import { AIProvider } from '../types'
import { db } from '@/server/db'
import { aiCallLogs, aiModelConfigs, aiFunctionMappings } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { AICallStatus } from '../types'

/**
 * AI 服务基础类
 * 提供错误处理、重试、日志记录等通用功能
 */
export abstract class AIService {
  protected maxRetries = 2
  protected retryDelays = [1000, 2000] // 毫秒

  /**
   * 执行带重试的 AI 调用
   * @param fn AI 调用函数
   * @param modelConfigId 模型配置 ID
   * @param action 操作类型
   * @param postId 文章 ID（可选）
   * @returns AI 调用结果
   */
  protected async executeWithRetry<T>(
    fn: () => Promise<T>,
    modelConfigId: string,
    action: string,
    postId?: string
  ): Promise<T> {
    const startTime = Date.now()
    let lastError: Error | null = null

    // 获取模型配置用于日志记录
    const modelConfig = await db.query.aiModelConfigs.findFirst({
      where: eq(aiModelConfigs.id, modelConfigId),
    })

    if (!modelConfig) {
      throw new Error(`Model config not found: ${modelConfigId}`)
    }

    // 尝试执行，失败则重试
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await fn()

        // 成功后记录日志
        await this.logCall({
          postId,
          modelConfigId,
          action,
          provider: modelConfig.provider as AIProvider,
          model: modelConfig.model,
          status: AICallStatus.SUCCESS,
          durationMs: Date.now() - startTime,
        })

        return result
      } catch (error) {
        lastError = error as Error
        const errorMessage = error instanceof Error ? error.message : String(error)

        if (attempt < this.maxRetries) {
          // 记录重试日志
          await this.logCall({
            postId,
            modelConfigId,
            action,
            provider: modelConfig.provider as AIProvider,
            model: modelConfig.model,
            status: AICallStatus.RETRYING,
            errorMessage: `Attempt ${attempt + 1} failed: ${errorMessage}`,
            durationMs: Date.now() - startTime,
          })

          // 等待后重试
          await this.sleep(this.retryDelays[attempt])
        } else {
          // 最后一次尝试失败，记录错误日志
          const lastErrorMessage = lastError instanceof Error ? lastError.message : String(lastError)

          await this.logCall({
            postId,
            modelConfigId,
            action,
            provider: modelConfig.provider as AIProvider,
            model: modelConfig.model,
            status: AICallStatus.FAILED,
            errorMessage: lastErrorMessage,
            durationMs: Date.now() - startTime,
          })

          throw new Error(
            `AI call failed after ${this.maxRetries + 1} attempts: ${lastErrorMessage}`
          )
        }
      }
    }

    throw lastError || new Error('AI call failed')
  }

  /**
   * 记录 AI 调用日志
   */
  protected async logCall(params: {
    postId?: string
    modelConfigId: string
    action: string
    provider: AIProvider
    model: string
    status: AICallStatus
    inputTokens?: number
    outputTokens?: number
    errorMessage?: string
    durationMs: number
  }): Promise<void> {
    const crypto = require('crypto')
    const id = crypto.randomBytes(16).toString('hex')

    try {
      await db.insert(aiCallLogs).values({
        id,
        postId: params.postId || null,
        modelConfigId: params.modelConfigId,
        action: params.action,
        provider: params.provider,
        model: params.model,
        inputTokens: params.inputTokens || null,
        outputTokens: params.outputTokens || null,
        status: params.status,
        errorMessage: params.errorMessage || null,
        durationMs: params.durationMs,
      })
    } catch (error: any) {
      // 日志记录失败不影响主流程，仅记录错误
      console.error('Failed to record AI call log:', error.message)
    }
  }

  /**
   * 延迟函数
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

/**
 * 根据功能名获取对应的模型配置
 * @param functionName 功能名称
 * @returns 模型配置，如果不存在则抛出错误
 */
export async function getModelConfigByFunction(functionName: string) {
  // 先查询功能映射（不使用 JOIN 避免外键约束问题）
  const mapping = await db.query.aiFunctionMappings.findFirst({
    where: eq(aiFunctionMappings.functionName, functionName),
  })

  if (!mapping) {
    throw new Error(`Function mapping not found: ${functionName}`)
  }

  // 如果没有配置模型
  if (!mapping.modelConfigId) {
    throw new Error(
      `No model configured for function: ${functionName}. Please configure a model in settings first.`
    )
  }

  // 单独查询模型配置
  const modelConfig = await db.query.aiModelConfigs.findFirst({
    where: eq(aiModelConfigs.id, mapping.modelConfigId),
  })

  // 如果模型配置不存在（被删除了），清理无效映射
  if (!modelConfig) {
    await db
      .update(aiFunctionMappings)
      .set({ modelConfigId: null, updatedAt: new Date().toISOString() })
      .where(eq(aiFunctionMappings.functionName, functionName))

    throw new Error(
      `Configured model no longer exists for function: ${functionName}. Please reconfigure in settings.`
    )
  }

  // 检查模型是否启用
  if (!modelConfig.enabled) {
    throw new Error(
      `Model is disabled for function: ${functionName}. Please enable the model in settings.`
    )
  }

  return modelConfig
}

/**
 * 解密 API Key
 * @param encryptedKey 加密的 API Key
 * @returns 解密后的 API Key
 */
export async function decryptApiKey(encryptedKey: string): Promise<string> {
  const { decrypt } = await import('../crypto')
  return decrypt(encryptedKey)
}
