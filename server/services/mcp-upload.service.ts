import { lookup } from 'dns/promises'
import { and, eq } from 'drizzle-orm'

import { db } from '@/server/db'
import { posts } from '@/server/db/schema'
import { isPrivateUrl } from '@/server/ai/security'
import {
  deleteFile,
  getMimeType,
  uploadFile,
  validateFileMagicNumber,
} from '@/server/services/cos-service'

const FILE_EXTENSION_BY_MIME = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/gif', 'gif'],
  ['image/webp', 'webp'],
  ['audio/mpeg', 'mp3'],
  ['audio/ogg', 'ogg'],
  ['audio/wav', 'wav'],
  ['audio/x-wav', 'wav'],
  ['audio/flac', 'flac'],
  ['audio/mp4', 'm4a'],
  ['audio/aac', 'aac'],
  ['video/mp4', 'mp4'],
  ['video/quicktime', 'mov'],
  ['video/webm', 'webm'],
  ['application/pdf', 'pdf'],
  ['application/msword', 'doc'],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx'],
  ['text/plain', 'txt'],
  ['text/markdown', 'md'],
])

const COVER_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_REDIRECTS = 3
const DOWNLOAD_TIMEOUT_MS = 120_000
const TEN_MB = 10 * 1024 * 1024
const FIFTY_MB = 50 * 1024 * 1024
const ONE_HUNDRED_MB = 100 * 1024 * 1024

export interface OpenAIFileInput {
  download_url: string
  file_id: string
  mime_type?: string
  file_name?: string
}

interface UploadedFile {
  url: string
  key: string
  filename: string
  size: number
  mimeType: string
  source: 'chatgpt-file'
}

function normalizeMimeType(value: string | null | undefined): string | undefined {
  return value?.split(';', 1)[0]?.trim().toLowerCase() || undefined
}

function maxSizeForMimeType(mimeType: string): number {
  if (mimeType.startsWith('video/')) return ONE_HUNDRED_MB
  if (mimeType.startsWith('audio/')) return FIFTY_MB
  return TEN_MB
}

async function assertPublicHttpsUrl(rawUrl: string): Promise<URL> {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new Error('文件临时下载地址无效')
  }

  if (url.protocol !== 'https:' || url.username || url.password || isPrivateUrl(url.toString())) {
    throw new Error('文件临时下载地址不安全')
  }

  const configuredHosts = (process.env.MCP_FILE_DOWNLOAD_HOSTS || '')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean)

  if (
    configuredHosts.length > 0 &&
    !configuredHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))
  ) {
    throw new Error('文件下载域名不在 MCP_FILE_DOWNLOAD_HOSTS 白名单中')
  }

  const addresses = await lookup(url.hostname, { all: true })
  if (addresses.length === 0) throw new Error('无法解析文件下载域名')
  for (const { address, family } of addresses) {
    const host = family === 6 ? `[${address}]` : address
    if (isPrivateUrl(`https://${host}`)) throw new Error('文件下载域名解析到了内网地址')
  }
  return url
}

async function fetchWithSafeRedirects(rawUrl: string): Promise<Response> {
  let nextUrl = rawUrl
  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const safeUrl = await assertPublicHttpsUrl(nextUrl)
    const response = await fetch(safeUrl, {
      redirect: 'manual',
      signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
      headers: { Accept: '*/*' },
    })

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location || redirectCount === MAX_REDIRECTS) throw new Error('文件下载重定向次数过多')
      await response.body?.cancel()
      nextUrl = new URL(location, safeUrl).toString()
      continue
    }
    if (!response.ok) throw new Error(`文件下载失败（HTTP ${response.status}）`)
    return response
  }
  throw new Error('文件下载失败')
}

async function readLimitedBody(response: Response, maxBytes: number): Promise<Buffer> {
  const declaredLength = Number(response.headers.get('content-length') || 0)
  if (declaredLength > maxBytes) throw new Error(`文件超过 ${Math.floor(maxBytes / 1024 / 1024)}MB 限制`)
  if (!response.body) throw new Error('文件下载响应没有内容')

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (!value) continue
    totalBytes += value.byteLength
    if (totalBytes > maxBytes) {
      await reader.cancel()
      throw new Error(`文件超过 ${Math.floor(maxBytes / 1024 / 1024)}MB 限制`)
    }
    chunks.push(value)
  }
  if (totalBytes === 0) throw new Error('文件内容为空')
  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)), totalBytes)
}

function safeFilename(input: OpenAIFileInput, mimeType: string, prefix: string): string {
  const extension = FILE_EXTENSION_BY_MIME.get(mimeType)
  if (!extension) throw new Error(`不支持的文件类型：${mimeType}`)
  const baseName = (input.file_name || `${prefix}-${Date.now()}`)
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/\.[^.]+$/, '')
    .slice(0, 80)
  return `${baseName || prefix}.${extension}`
}

export class McpUploadService {
  private async uploadRemoteFile(
    input: OpenAIFileInput,
    prefix: string,
    allowedMimeTypes?: Set<string>
  ): Promise<UploadedFile> {
    const response = await fetchWithSafeRedirects(input.download_url)
    const responseMimeType = normalizeMimeType(response.headers.get('content-type'))
    const declaredMimeType = normalizeMimeType(input.mime_type)
    const supportedResponseMimeType = responseMimeType && FILE_EXTENSION_BY_MIME.has(responseMimeType)
      ? responseMimeType
      : undefined
    const supportedDeclaredMimeType = declaredMimeType && FILE_EXTENSION_BY_MIME.has(declaredMimeType)
      ? declaredMimeType
      : undefined
    const mimeType = supportedResponseMimeType || supportedDeclaredMimeType

    if (!mimeType) throw new Error('无法识别或不支持该文件类型')
    if (allowedMimeTypes && !allowedMimeTypes.has(mimeType)) throw new Error('文章封面仅支持 JPEG、PNG 或 WebP')
    if (responseMimeType && responseMimeType !== 'application/octet-stream' && !supportedResponseMimeType) {
      throw new Error(`文件响应类型不受支持：${responseMimeType}`)
    }
    if (supportedResponseMimeType && supportedDeclaredMimeType && supportedResponseMimeType !== supportedDeclaredMimeType) {
      throw new Error('文件响应类型与客户端声明类型不一致')
    }

    const filename = safeFilename(input, mimeType, prefix)
    const buffer = await readLimitedBody(response, maxSizeForMimeType(mimeType))
    const extension = filename.split('.').pop() || ''
    if (!validateFileMagicNumber(buffer, extension)) throw new Error('文件内容与声明的文件类型不一致')

    const uploaded = await uploadFile(buffer, filename)
    return {
      ...uploaded,
      filename,
      size: buffer.byteLength,
      mimeType: getMimeType(filename),
      source: 'chatgpt-file',
    }
  }

  async uploadCover(input: {
    postId: string
    userId: string
    file: OpenAIFileInput
    prompt?: string
  }) {
    const ownedPost = await db
      .select({ id: posts.id })
      .from(posts)
      .where(and(eq(posts.id, input.postId), eq(posts.authorId, input.userId)))
      .limit(1)
    if (!ownedPost[0]) throw new Error('文章不存在或无权修改')

    const uploaded = await this.uploadRemoteFile(input.file, 'chatgpt-cover', COVER_MIME_TYPES)
    const now = new Date().toISOString()
    try {
      await db
        .update(posts)
        .set({
          coverImageUrl: uploaded.url,
          aiCoverStatus: 'done',
          aiCoverGeneratedAt: now,
          aiCoverPrompt: input.prompt || null,
          updatedAt: now,
        })
        .where(and(eq(posts.id, input.postId), eq(posts.authorId, input.userId)))
    } catch (error) {
      await deleteFile(uploaded.key).catch(() => undefined)
      throw error
    }
    return { postId: input.postId, ...uploaded }
  }

  async uploadFile(file: OpenAIFileInput): Promise<{ url: string }> {
    const uploaded = await this.uploadRemoteFile(file, 'chatgpt-file')
    return { url: uploaded.url }
  }
}

export const mcpUploadService = new McpUploadService()
