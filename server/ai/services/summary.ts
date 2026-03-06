import { generateText } from 'ai'
import { getAIModel } from '../providers'
import { AIService, getModelConfigByFunction, decryptApiKey } from './base'
import { getSummaryPrompt, SUMMARY_SYSTEM_PROMPT } from '../prompts/summary'
import { AIFunction, AICallStatus } from '../types'
import { db } from '@/server/db'
import { posts, aiCallLogs, aiModelConfigs } from '@/server/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'

/**
 * 文章语言检测结果
 */
interface LanguageDetectionResult {
  language: 'zh' | 'en' | 'other'
  confidence: number
}

/**
 * AI 摘要生成状态（用于 UI 显示）
 * 通过 ai_call_logs 表查询得出
 */
export type SummaryStatus = 'pending' | 'generating' | 'done' | 'failed'

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
        })

        const { text, usage } = await generateText({
          model,
          prompt,
          system: SUMMARY_SYSTEM_PROMPT,
          temperature: (modelConfig.temperature || 70) / 100,
        })

        return {
          summary: text.trim(),
          inputTokens: (usage as any)?.inputTokens || 0,
          outputTokens: (usage as any)?.outputTokens || 0,
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
    // 获取摘要功能的模型配置
    const modelConfig = await getModelConfigByFunction(AIFunction.SUMMARY)

    // 创建 "generating" 状态的日志条目
    const crypto = require('crypto')
    const generatingLogId = crypto.randomBytes(16).toString('hex')
    await db.insert(aiCallLogs).values({
      id: generatingLogId,
      postId,
      modelConfigId: modelConfig.id,
      action: 'generate-summary',
      provider: modelConfig.provider as any,
      model: modelConfig.model,
      status: 'retrying', // 使用 'retrying' 表示正在生成中
      createdAt: new Date().toISOString(),
    })

    try {
      // 生成摘要
      const result = await this.generateSummary(postId, title, content)

      // 更新数据库 - 直接写入 excerpt 字段
      await db
        .update(posts)
        .set({
          excerpt: result.summary,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(posts.id, postId))

      // 删除初始的 "retrying" 日志（因为 executeWithRetry 已经创建了新的日志）
      await db.delete(aiCallLogs).where(eq(aiCallLogs.id, generatingLogId))

      console.log(`Summary generated for post ${postId}`)
    } catch (error) {
      console.error(`Failed to generate summary for post ${postId}:`, error)

      // 失败时也删除初始的 "retrying" 日志（executeWithRetry 已经创建了 failed 日志）
      try {
        await db.delete(aiCallLogs).where(eq(aiCallLogs.id, generatingLogId))
      } catch (deleteError) {
        // 忽略删除错误
      }

      throw error
    }
  }

  /**
   * 获取文章的摘要生成状态
   * 通过查询 ai_call_logs 表判断当前状态
   * @param postId 文章 ID
   * @returns 状态信息
   */
  async getSummaryStatus(postId: string): Promise<{
    status: SummaryStatus
    summary?: string
    generatedAt?: string
    error?: string
  }> {
    // 查询最新的摘要生成日志
    const logs = await db
      .select({
        status: aiCallLogs.status,
        createdAt: aiCallLogs.createdAt,
        errorMessage: aiCallLogs.errorMessage,
      })
      .from(aiCallLogs)
      .where(
        and(
          eq(aiCallLogs.postId, postId),
          eq(sql`ai_call_logs.action`, 'generate-summary')
        )
      )
      .orderBy(desc(aiCallLogs.createdAt))
      .limit(5)

    // 获取当前文章的 excerpt
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
      columns: {
        excerpt: true,
      },
    })

    // 判断状态
    if (logs.length === 0) {
      // 没有任何日志，说明从未生成过
      return {
        status: 'pending',
        summary: post?.excerpt || undefined,
      }
    }

    // 检查最新的日志
    const latestLog = logs[0]

    // 如果最新的日志是 retrying，说明正在生成中
    if (latestLog.status === 'retrying') {
      return {
        status: 'generating',
        summary: post?.excerpt || undefined,
      }
    }

    // 如果最新的日志是 success，说明生成成功
    if (latestLog.status === 'success') {
      return {
        status: 'done',
        summary: post?.excerpt || undefined,
        generatedAt: latestLog.createdAt,
      }
    }

    // 如果最新的日志是 failed，说明生成失败
    if (latestLog.status === 'failed') {
      return {
        status: 'failed',
        summary: post?.excerpt || undefined,
        error: latestLog.errorMessage || undefined,
        generatedAt: latestLog.createdAt,
      }
    }

    // 默认返回 pending
    return {
      status: 'pending',
      summary: post?.excerpt || undefined,
    }
  }
}

// 导出单例实例
export const summaryService = new SummaryService()
