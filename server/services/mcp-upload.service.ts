import { lookup } from 'dns/promises'
import { and, eq } from 'drizzle-orm'

import { db } from '@/server/db'
import { posts, postDrafts } from '@/server/db/schema'
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

export interface RemoteFileInput {
  download_url: string
  file_id: string
  mime_type?: string
  file_name?: string
}

export interface Base64FileInput {
  base64: string
  mime_type?: string
  file_name?: string
}

export type McpFileInput = RemoteFileInput | Base64FileInput

interface UploadedFile {
  url: string
  key: string
  filename: string
  size: number
  mimeType: string
  source: 'chatgpt-file' | 'base64'
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

function safeFilename(input: { file_name?: string }, mimeType: string, prefix: string): string {
  const extension = FILE_EXTENSION_BY_MIME.get(mimeType)
  if (!extension) throw new Error(`不支持的文件类型：${mimeType}`)
  const baseName = (input.file_name || `${prefix}-${Date.now()}`)
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/\.[^.]+$/, '')
    .slice(0, 80)
  return `${baseName || prefix}.${extension}`
}

export class McpUploadService {
  private async uploadBuffer(input: {
    buffer: Buffer
    mimeType: string
    fileName?: string
    prefix: string
    source: UploadedFile['source']
    allowedMimeTypes?: Set<string>
  }): Promise<UploadedFile> {
    if (!FILE_EXTENSION_BY_MIME.has(input.mimeType)) {
      throw new Error(`不支持的文件类型：${input.mimeType}`)
    }
    if (input.allowedMimeTypes && !input.allowedMimeTypes.has(input.mimeType)) {
      throw new Error('文章封面仅支持 JPEG、PNG 或 WebP')
    }

    const maxBytes = maxSizeForMimeType(input.mimeType)
    if (input.buffer.length === 0) throw new Error('文件内容为空')
    if (input.buffer.length > maxBytes) {
      throw new Error(`文件超过 ${Math.floor(maxBytes / 1024 / 1024)}MB 限制`)
    }

    const filename = safeFilename({ file_name: input.fileName }, input.mimeType, input.prefix)
    const extension = filename.split('.').pop() || ''
    if (!validateFileMagicNumber(input.buffer, extension)) {
      throw new Error('文件内容与声明的文件类型不一致')
    }

    const uploaded = await uploadFile(input.buffer, filename)
    return {
      ...uploaded,
      filename,
      size: input.buffer.byteLength,
      mimeType: getMimeType(filename),
      source: input.source,
    }
  }

  private async uploadRemoteFile(
    input: RemoteFileInput,
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
    if (responseMimeType && responseMimeType !== 'application/octet-stream' && !supportedResponseMimeType) {
      throw new Error(`文件响应类型不受支持：${responseMimeType}`)
    }
    if (supportedResponseMimeType && supportedDeclaredMimeType && supportedResponseMimeType !== supportedDeclaredMimeType) {
      throw new Error('文件响应类型与客户端声明类型不一致')
    }

    const buffer = await readLimitedBody(response, maxSizeForMimeType(mimeType))
    return this.uploadBuffer({
      buffer,
      mimeType,
      fileName: input.file_name,
      prefix,
      source: 'chatgpt-file',
      allowedMimeTypes,
    })
  }

  private async uploadBase64File(
    input: Base64FileInput,
    prefix: string,
    allowedMimeTypes?: Set<string>
  ): Promise<UploadedFile> {
    const dataUrlMatch = input.base64.match(/^data:([^;,]+);base64,([\s\S]*)$/)
    const dataUrlMimeType = normalizeMimeType(dataUrlMatch?.[1])
    const declaredMimeType = normalizeMimeType(input.mime_type)

    if (dataUrlMimeType && declaredMimeType && dataUrlMimeType !== declaredMimeType) {
      throw new Error('Base64 Data URL 类型与客户端声明类型不一致')
    }

    const mimeType = dataUrlMimeType || declaredMimeType
    if (!mimeType || !FILE_EXTENSION_BY_MIME.has(mimeType)) {
      throw new Error('Base64 文件必须提供受支持的 mime_type，或使用带 MIME 的 Data URL')
    }
    if (allowedMimeTypes && !allowedMimeTypes.has(mimeType)) {
      throw new Error('文章封面仅支持 JPEG、PNG 或 WebP')
    }

    const payload = dataUrlMatch?.[2] ?? input.base64
    if (!payload || payload.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(payload)) {
      throw new Error('Base64 文件内容格式无效')
    }

    const padding = payload.endsWith('==') ? 2 : payload.endsWith('=') ? 1 : 0
    const decodedBytes = (payload.length / 4) * 3 - padding
    const maxBytes = maxSizeForMimeType(mimeType)
    if (decodedBytes <= 0) throw new Error('文件内容为空')
    if (decodedBytes > maxBytes) {
      throw new Error(`文件超过 ${Math.floor(maxBytes / 1024 / 1024)}MB 限制`)
    }

    return this.uploadBuffer({
      buffer: Buffer.from(payload, 'base64'),
      mimeType,
      fileName: input.file_name,
      prefix,
      source: 'base64',
      allowedMimeTypes,
    })
  }

  private async uploadInput(
    input: McpFileInput,
    prefix: string,
    allowedMimeTypes?: Set<string>
  ): Promise<UploadedFile> {
    return 'download_url' in input
      ? this.uploadRemoteFile(input, prefix, allowedMimeTypes)
      : this.uploadBase64File(input, prefix, allowedMimeTypes)
  }

  async uploadCover(input: {
    postId: string
    userId: string
    file: McpFileInput
    prompt?: string
  }) {
    const ownedDraft = await db
      .select({ id: postDrafts.id })
      .from(postDrafts)
      .where(and(eq(postDrafts.id, input.postId), eq(postDrafts.authorId, input.userId)))
      .limit(1)
    const ownedPost = ownedDraft[0] ? [] : await db
      .select({ id: posts.id })
      .from(posts)
      .where(and(eq(posts.id, input.postId), eq(posts.authorId, input.userId)))
      .limit(1)
    if (!ownedDraft[0] && !ownedPost[0]) throw new Error('文章或草稿不存在，或无权修改')

    const uploaded = await this.uploadInput(input.file, 'chatgpt-cover', COVER_MIME_TYPES)
    const now = new Date().toISOString()
    try {
      const target = ownedDraft[0] ? postDrafts : posts
      const targetId = ownedDraft[0] ? postDrafts.id : posts.id
      const targetAuthorId = ownedDraft[0] ? postDrafts.authorId : posts.authorId
      await db
        .update(target)
        .set({
          coverImageUrl: uploaded.url,
          aiCoverStatus: 'done',
          aiCoverGeneratedAt: now,
          aiCoverPrompt: input.prompt || null,
          updatedAt: now,
        })
        .where(and(eq(targetId, input.postId), eq(targetAuthorId, input.userId)))
    } catch (error) {
      await deleteFile(uploaded.key).catch(() => undefined)
      throw error
    }
    return { postId: input.postId, ...uploaded }
  }

  async uploadFile(file: McpFileInput): Promise<{ url: string }> {
    const uploaded = await this.uploadInput(file, 'chatgpt-file')
    return { url: uploaded.url }
  }
}

export const mcpUploadService = new McpUploadService()
