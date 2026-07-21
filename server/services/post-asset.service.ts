import { createHash } from 'crypto'
import { lookup } from 'dns/promises'
import { and, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { db } from '@/server/db'
import { fileUploads, postAssets, posts } from '@/server/db/schema'
import { isPrivateUrl } from '@/server/ai/security'
import {
  deleteFile,
  getMimeType,
  getPublicUrl,
  uploadFile,
  validateFileMagicNumber,
  validateFileSize,
} from '@/server/services/cos-service'

const ALLOWED_IMAGE_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
])

const MAX_REDIRECTS = 3
const DOWNLOAD_TIMEOUT_MS = 30_000

export interface OpenAIFileInput {
  download_url: string
  file_id: string
  mime_type?: string
  file_name?: string
}

export interface UploadPostCoverInput {
  postId: string
  userId: string
  cover: OpenAIFileInput
  alt?: string
  prompt?: string
  idempotencyKey: string
}

export interface PostCoverAssetResult {
  assetId: string
  postId: string
  url: string
  key: string
  filename: string
  size: number
  mimeType: string
  source: 'chatgpt-imagegen'
}

function extensionForMimeType(mimeType: string): string {
  const extension = ALLOWED_IMAGE_TYPES.get(mimeType)
  if (!extension) {
    throw new Error('封面仅支持 JPEG、PNG 或 WebP 图片')
  }
  return extension
}

function normalizeMimeType(value: string | null | undefined): string | undefined {
  return value?.split(';', 1)[0]?.trim().toLowerCase() || undefined
}

async function assertPublicHttpsUrl(rawUrl: string): Promise<URL> {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new Error('图片临时下载地址无效')
  }

  if (url.protocol !== 'https:' || url.username || url.password || isPrivateUrl(url.toString())) {
    throw new Error('图片临时下载地址不安全')
  }

  const configuredHosts = (process.env.MCP_FILE_DOWNLOAD_HOSTS || '')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean)

  if (
    configuredHosts.length > 0 &&
    !configuredHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))
  ) {
    throw new Error('图片下载域名不在 MCP_FILE_DOWNLOAD_HOSTS 白名单中')
  }

  const addresses = await lookup(url.hostname, { all: true })
  if (addresses.length === 0) {
    throw new Error('无法解析图片下载域名')
  }

  for (const { address, family } of addresses) {
    const host = family === 6 ? `[${address}]` : address
    if (isPrivateUrl(`https://${host}`)) {
      throw new Error('图片下载域名解析到了内网地址')
    }
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
      headers: { Accept: 'image/png,image/jpeg,image/webp' },
    })

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location || redirectCount === MAX_REDIRECTS) {
        throw new Error('图片下载重定向次数过多')
      }
      await response.body?.cancel()
      nextUrl = new URL(location, safeUrl).toString()
      continue
    }

    if (!response.ok) {
      throw new Error(`图片下载失败（HTTP ${response.status}）`)
    }

    return response
  }

  throw new Error('图片下载失败')
}

async function readLimitedBody(response: Response): Promise<Buffer> {
  const declaredLength = Number(response.headers.get('content-length') || 0)
  if (declaredLength > 0 && !validateFileSize(declaredLength)) {
    throw new Error('封面图片超过 10MB 限制')
  }

  if (!response.body) {
    throw new Error('图片下载响应没有文件内容')
  }

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (!value) continue

    totalBytes += value.byteLength
    if (!validateFileSize(totalBytes)) {
      await reader.cancel()
      throw new Error('封面图片超过 10MB 限制')
    }
    chunks.push(value)
  }

  if (totalBytes === 0) {
    throw new Error('封面图片内容为空')
  }

  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)), totalBytes)
}

function safeFilename(input: OpenAIFileInput, mimeType: string): string {
  const extension = extensionForMimeType(mimeType)
  const baseName = (input.file_name || `chatgpt-cover-${Date.now()}`)
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/\.[^.]+$/, '')
    .slice(0, 80)
  return `${baseName || 'chatgpt-cover'}.${extension}`
}

export class PostAssetService {
  private async findByIdempotencyKey(idempotencyKey: string): Promise<PostCoverAssetResult | null> {
    const rows = await db
      .select({
        assetId: postAssets.id,
        postId: postAssets.postId,
        key: fileUploads.key,
        filename: fileUploads.filename,
        size: fileUploads.size,
        mimeType: fileUploads.mimeType,
      })
      .from(postAssets)
      .innerJoin(fileUploads, eq(postAssets.fileUploadId, fileUploads.id))
      .where(eq(postAssets.idempotencyKey, idempotencyKey))
      .limit(1)

    const existing = rows[0]
    if (!existing) return null

    return {
      ...existing,
      url: getPublicUrl(existing.key),
      source: 'chatgpt-imagegen',
    }
  }

  async uploadChatGptCover(input: UploadPostCoverInput): Promise<PostCoverAssetResult> {
    const existing = await this.findByIdempotencyKey(input.idempotencyKey)
    if (existing) {
      if (existing.postId !== input.postId) {
        throw new Error('该幂等键已用于另一篇文章')
      }
      return existing
    }

    const ownedPost = await db
      .select({ id: posts.id })
      .from(posts)
      .where(and(eq(posts.id, input.postId), eq(posts.authorId, input.userId)))
      .limit(1)

    if (!ownedPost[0]) {
      throw new Error('文章不存在或无权修改')
    }

    const response = await fetchWithSafeRedirects(input.cover.download_url)
    const responseMimeType = normalizeMimeType(response.headers.get('content-type'))
    const declaredMimeType = normalizeMimeType(input.cover.mime_type)
    const supportedResponseMimeType = responseMimeType && ALLOWED_IMAGE_TYPES.has(responseMimeType)
      ? responseMimeType
      : undefined
    const mimeType = supportedResponseMimeType || declaredMimeType

    if (!mimeType) {
      throw new Error('图片响应缺少 MIME 类型')
    }
    extensionForMimeType(mimeType)
    if (
      responseMimeType &&
      responseMimeType !== 'application/octet-stream' &&
      !supportedResponseMimeType
    ) {
      throw new Error('图片下载响应不是受支持的图片类型')
    }
    if (declaredMimeType && supportedResponseMimeType && declaredMimeType !== supportedResponseMimeType) {
      throw new Error('图片响应类型与 ChatGPT 文件类型不一致')
    }

    const buffer = await readLimitedBody(response)
    const filename = safeFilename(input.cover, mimeType)
    const extension = filename.split('.').pop() || ''
    if (!validateFileMagicNumber(buffer, extension)) {
      throw new Error('图片内容与声明的文件类型不一致')
    }

    const fileHash = createHash('sha256').update(buffer).digest('hex')
    const uploadResult = await uploadFile(buffer, filename)
    const fileUploadId = nanoid()
    const assetId = nanoid()
    const now = new Date().toISOString()

    try {
      await db.transaction(async (tx) => {
        await tx.insert(fileUploads).values({
          id: fileUploadId,
          key: uploadResult.key,
          filename,
          size: buffer.byteLength,
          mimeType: getMimeType(filename),
          uploaderId: input.userId,
          createdAt: now,
        })

        await tx.insert(postAssets).values({
          id: assetId,
          postId: input.postId,
          fileUploadId,
          kind: 'cover',
          source: 'chatgpt-imagegen',
          alt: input.alt || null,
          prompt: input.prompt || null,
          fileHash,
          idempotencyKey: input.idempotencyKey,
          createdAt: now,
        })

        await tx
          .update(posts)
          .set({
            coverImageUrl: uploadResult.url,
            aiCoverStatus: 'done',
            aiCoverGeneratedAt: now,
            aiCoverPrompt: input.prompt || null,
            updatedAt: now,
          })
          .where(and(eq(posts.id, input.postId), eq(posts.authorId, input.userId)))
      })
    } catch (error) {
      await deleteFile(uploadResult.key).catch(() => undefined)
      throw error
    }

    return {
      assetId,
      postId: input.postId,
      url: uploadResult.url,
      key: uploadResult.key,
      filename,
      size: buffer.byteLength,
      mimeType: getMimeType(filename),
      source: 'chatgpt-imagegen',
    }
  }
}

export const postAssetService = new PostAssetService()
