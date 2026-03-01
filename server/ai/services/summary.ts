import { generateText } from 'ai'
import { getAIModel } from '../providers'
import { AIService, getModelConfigByFunction, decryptApiKey } from './base'
import { getSummaryPrompt, SUMMARY_SYSTEM_PROMPT } from '../prompts/summary'
import { AIFunction, SummaryStatus } from '../types'
import { db } from '@/server/db'
import { posts } from '@/server/db/schema'
import { eq } from 'drizzle-orm'

/**
 * 文章语言检测结果
 */
interface LanguageDetectionResult {
  language: 'zh' | 'en' | 'other'
  confidence: number
}

/**
 * AI 摘要生成服务
 */
export class SummaryService extends AIService {
  /**
   * 检测文章语言
   * @param content 文章内容
   * @returns 语言检测结果
   */
  private detectLanguage(content: string): LanguageDetectionResult {
    // 简单的语言检测逻辑
    const chineseChars = content.match(/[\u4e00-\u9fa5]/g)
    const chineseRatio = chineseChars ? chineseChars.length / content.length : 0

    if (chineseRatio > 0.3) {
      return { language: 'zh', confidence: chineseRatio }
    }

    // 检测英文
    const englishWords = content.match(/[a-zA-Z]+/g)
    const englishRatio = englishWords ? englishWords.length / content.length : 0

    if (englishRatio > 0.5) {
      return { language: 'en', confidence: englishRatio }
    }

    return { language: 'other', confidence: 0 }
  }

  /**
   * 生成文章摘要
   * @param postId 文章 ID
   * @param title 文章标题
   * @param content 文章内容
   * @returns 生成的摘要
   */
  async generateSummary(
    postId: string,
    title: string,
    content: string
  ): Promise<{
    summary: string
    modelConfigId: string
    provider: string
    model: string
    inputTokens: number
    outputTokens: number
  }> {
    // 获取摘要功能的模型配置
    const modelConfig = await getModelConfigByFunction(AIFunction.SUMMARY)

    // 解密 API Key
    const apiKey = await decryptApiKey(modelConfig.apiKeyEncrypted)

    // 检测文章语言
    const { language } = this.detectLanguage(content)

    // 生成 Prompt
    const prompt = getSummaryPrompt(title, content, language)

    // 使用重试机制执行生成
    const result = await this.executeWithRetry(
      async () => {
        // 使用工厂函数创建模型实例
        const { model } = getAIModel({
          provider: modelConfig.provider as any,
          model: modelConfig.model,
          apiKey,
          baseUrl: modelConfig.baseUrl || undefined,
          maxTokens: modelConfig.maxTokens || 300,
          temperature: (modelConfig.temperature || 70) / 100,
        })

        const { text, usage } = await generateText({
          model,
          prompt,
          system: SUMMARY_SYSTEM_PROMPT,
          maxTokens: modelConfig.maxTokens || 300,
          temperature: (modelConfig.temperature || 70) / 100,
        })

        return {
          summary: text.trim(),
          inputTokens: usage?.promptTokens || 0,
          outputTokens: usage?.completionTokens || 0,
        }
      },
      modelConfig.id,
      'generate-summary',
      postId
    )

    return {
      ...result,
      modelConfigId: modelConfig.id,
      provider: modelConfig.provider,
      model: modelConfig.model,
    }
  }

  /**
   * 异步生成摘要并更新数据库
   * @param postId 文章 ID
   * @param title 文章标题
   * @param content 文章内容
   */
  async generateAndUpdate(
    postId: string,
    title: string,
    content: string
  ): Promise<void> {
    try {
      // 更新状态为 generating
      await db
        .update(posts)
        .set({ aiSummaryStatus: SummaryStatus.GENERATING })
        .where(eq(posts.id, postId))

      // 生成摘要
      const result = await this.generateSummary(postId, title, content)

      // 更新数据库
      await db
        .update(posts)
        .set({
          aiSummary: result.summary,
          aiSummaryGeneratedAt: new Date().toISOString(),
          aiSummaryStatus: SummaryStatus.DONE,
        })
        .where(eq(posts.id, postId))

      console.log(`Summary generated for post ${postId}`)
    } catch (error) {
      // 失败时更新状态
      try {
        await db
          .update(posts)
          .set({ aiSummaryStatus: SummaryStatus.FAILED })
          .where(eq(posts.id, postId))
      } catch (updateError) {
        console.error('Failed to update summary status:', updateError)
      }

      throw error
    }
  }
}

// 导出单例实例
export const summaryService = new SummaryService()
