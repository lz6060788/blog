/**
 * AI 封面生成服务
 * 根据文章内容自动生成封面图片
 */

import { AIService, getModelConfigByFunction, decryptApiKey } from './base'
import { AICoverRequest, AICoverResponse, AIFunction, ImageGenerationOptions } from '../types'
import { createImageClient } from '../clients/image-client'
import { generateCoverPrompt, validateCoverPrompt } from '../prompts/cover'
import { db } from '@/server/db'
import { posts } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { uploadFile } from '@/server/services/cos-service'

/**
 * 从 URL 下载图片
 * @param url 图片 URL
 * @returns 图片 Buffer
 */
async function downloadImage(url: string): Promise<{ buffer: Buffer; filename: string }> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())

  // 从 URL 或 Content-Type 推断文件扩展名
  let ext = 'png'
  const contentType = response.headers.get('content-type')
  if (contentType?.includes('jpeg') || contentType?.includes('jpg')) {
    ext = 'jpg'
  } else if (contentType?.includes('png')) {
    ext = 'png'
  } else if (contentType?.includes('webp')) {
    ext = 'webp'
  }

  const filename = `cover-${Date.now()}.${ext}`
  return { buffer, filename }
}

/**
 * 封面生成服务类
 */
export class CoverGenerationService extends AIService {
  /**
   * 生成文章封面
   * @param request 封面生成请求
   * @returns 封面生成响应
   */
  async generateCover(request: AICoverRequest): Promise<AICoverResponse> {
    const { postId, title, content, excerpt, tags } = request

    // 获取模型配置
    const modelConfig = await getModelConfigByFunction(AIFunction.COVER)

    // 解密 API Key
    const apiKey = await decryptApiKey(modelConfig.apiKeyEncrypted)

    // 创建图像生成客户端
    const imageClient = createImageClient({
      provider: modelConfig.provider as any,
      model: modelConfig.model,
      apiKey,
      baseUrl: modelConfig.baseUrl || undefined,
    })

    // 生成 Prompt
    const prompt = generateCoverPrompt({
      title,
      excerpt: excerpt || content.substring(0, 500),
      tags,
    })

    // 验证 Prompt
    if (!validateCoverPrompt(prompt)) {
      throw new Error('Generated prompt is invalid or too long')
    }

    // 图像生成选项（16:9 比例，适合作为封面）
    const imageOptions: ImageGenerationOptions = {
      size: '1792x1024', // 16:9 比例
      quality: 'standard',
      style: 'vivid',
      format: 'url',
    }

    // 使用带重试的执行
    const result = await this.executeWithRetry(
      async () => {
        const imageResult = await imageClient.generateImage(prompt, imageOptions)
        return {
          imageUrl: imageResult.url,
          prompt,
          revisedPrompt: imageResult.revisedPrompt,
        }
      },
      modelConfig.id,
      'generate-cover',
      postId
    )

    // 下载并上传图片到 COS
    let finalImageUrl = result.imageUrl
    try {
      const { buffer, filename } = await downloadImage(result.imageUrl)
      const uploadResult = await uploadFile(buffer, filename)
      finalImageUrl = uploadResult.url
      console.log(`✓ 封面图片已上传到 COS: ${finalImageUrl}`)
    } catch (error) {
      console.error('上传封面到 COS 失败，使用 AI 返回的 URL:', error)
      // 如果上传失败，仍然使用 AI 返回的 URL
    }

    // 更新文章的封面相关字段
    await db
      .update(posts)
      .set({
        coverImageUrl: finalImageUrl,
        aiCoverStatus: 'done',
        aiCoverGeneratedAt: new Date().toISOString(),
        aiCoverPrompt: result.revisedPrompt || result.prompt,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(posts.id, postId))

    return {
      imageUrl: finalImageUrl,
      prompt: result.revisedPrompt || result.prompt,
      modelConfigId: modelConfig.id,
      provider: modelConfig.provider as any,
      model: modelConfig.model,
      imageSize: imageOptions.size,
      imageFormat: 'png',
      durationMs: 0, // executeWithRetry 会记录
    }
  }

  /**
   * 手动设置封面图片
   * @param postId 文章 ID
   * @param imageUrl 图片 URL
   */
  async setManualCover(postId: string, imageUrl: string): Promise<void> {
    await db
      .update(posts)
      .set({
        coverImageUrl: imageUrl,
        aiCoverStatus: 'manual',
        aiCoverGeneratedAt: null,
        aiCoverPrompt: null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(posts.id, postId))
  }

  /**
   * 删除封面图片
   * @param postId 文章 ID
   */
  async removeCover(postId: string): Promise<void> {
    await db
      .update(posts)
      .set({
        coverImageUrl: null,
        aiCoverStatus: 'pending',
        aiCoverGeneratedAt: null,
        aiCoverPrompt: null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(posts.id, postId))
  }

  /**
   * 获取封面生成状态
   * @param postId 文章 ID
   * @returns 封面状态
   */
  async getCoverStatus(postId: string): Promise<{
    status: 'pending' | 'generating' | 'done' | 'failed' | 'manual'
    coverImageUrl?: string | null
    aiCoverGeneratedAt?: string | null
  }> {
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
      columns: {
        aiCoverStatus: true,
        coverImageUrl: true,
        aiCoverGeneratedAt: true,
      },
    })

    if (!post) {
      throw new Error(`Post not found: ${postId}`)
    }

    return {
      status: (post.aiCoverStatus || 'pending') as 'pending' | 'generating' | 'done' | 'failed' | 'manual',
      coverImageUrl: post.coverImageUrl,
      aiCoverGeneratedAt: post.aiCoverGeneratedAt,
    }
  }

  /**
   * 设置封面生成状态为 generating
   * @param postId 文章 ID
   */
  async setCoverGenerating(postId: string): Promise<void> {
    await db
      .update(posts)
      .set({
        aiCoverStatus: 'generating',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(posts.id, postId))
  }

  /**
   * 设置封面生成失败状态
   * @param postId 文章 ID
   * @param errorMessage 错误信息
   */
  async setCoverFailed(postId: string, errorMessage: string): Promise<void> {
    await db
      .update(posts)
      .set({
        aiCoverStatus: 'failed',
        aiCoverPrompt: `Error: ${errorMessage}`,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(posts.id, postId))
  }
}

/**
 * 单例实例
 */
let coverServiceInstance: CoverGenerationService | null = null

/**
 * 获取封面生成服务实例
 * @returns 封面生成服务实例
 */
export function getCoverService(): CoverGenerationService {
  if (!coverServiceInstance) {
    coverServiceInstance = new CoverGenerationService()
  }
  return coverServiceInstance
}
