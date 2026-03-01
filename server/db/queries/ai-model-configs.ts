import { db } from '../index'
import { aiModelConfigs, aiFunctionMappings } from '../schema'
import { eq, desc, and, sql } from 'drizzle-orm'
import { AIProvider } from '../../ai/types'
import { encrypt, maskApiKey } from '../../ai/crypto'

/**
 * AI 模型配置查询
 */

/**
 * 获取所有模型配置
 * @param options 查询选项
 * @returns 模型配置列表
 */
export async function getAllModelConfigs(options?: {
  includeDisabled?: boolean
}) {
  const query = db.select().from(aiModelConfigs)

  if (!options?.includeDisabled) {
    query.where(eq(aiModelConfigs.enabled, 1))
  }

  return await query.orderBy(desc(aiModelConfigs.createdAt))
}

/**
 * 根据 ID 获取模型配置
 * @param id 配置 ID
 * @returns 模型配置，如果不存在则返回 null
 */
export async function getModelConfigById(id: string) {
  const result = await db
    .select()
    .from(aiModelConfigs)
    .where(eq(aiModelConfigs.id, id))
    .limit(1)

  return result[0] || null
}

/**
 * 创建模型配置
 * @param data 配置数据
 * @returns 创建的配置
 */
export async function createModelConfig(data: {
  name: string
  provider: AIProvider
  model: string
  apiKey: string
  baseUrl?: string
  maxTokens?: number
  temperature?: number
  enabled?: boolean
}) {
  const crypto = require('crypto')
  const id = crypto.randomBytes(16).toString('hex')

  // 加密 API Key
  const apiKeyEncrypted = encrypt(data.apiKey)

  const result = await db
    .insert(aiModelConfigs)
    .values({
      id,
      name: data.name,
      provider: data.provider,
      model: data.model,
      apiKeyEncrypted,
      baseUrl: data.baseUrl || null,
      maxTokens: data.maxTokens || 300,
      temperature: Math.round((data.temperature || 0.7) * 100), // 转换为整数 (0-100)
      enabled: data.enabled !== undefined ? data.enabled : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .returning()

  return result[0]
}

/**
 * 更新模型配置
 * @param id 配置 ID
 * @param data 更新数据
 * @returns 更新的配置
 */
export async function updateModelConfig(
  id: string,
  data: {
    name?: string
    provider?: AIProvider
    model?: string
    apiKey?: string
    baseUrl?: string
    maxTokens?: number
    temperature?: number
    enabled?: boolean
  }
) {
  const updateData: any = {
    updatedAt: new Date().toISOString(),
  }

  if (data.name !== undefined) updateData.name = data.name
  if (data.provider !== undefined) updateData.provider = data.provider
  if (data.model !== undefined) updateData.model = data.model
  if (data.baseUrl !== undefined) updateData.baseUrl = data.baseUrl || null
  if (data.maxTokens !== undefined) updateData.maxTokens = data.maxTokens
  if (data.temperature !== undefined)
    updateData.temperature = Math.round(data.temperature * 100)
  if (data.enabled !== undefined) updateData.enabled = data.enabled ? 1 : 0

  // 只有提供了非空 API Key 时才更新（空字符串表示不修改）
  if (data.apiKey && data.apiKey.trim()) {
    updateData.apiKeyEncrypted = encrypt(data.apiKey)
  }

  const result = await db
    .update(aiModelConfigs)
    .set(updateData)
    .where(eq(aiModelConfigs.id, id))
    .returning()

  return result[0]
}

/**
 * 删除模型配置（级联删除相关的功能映射）
 * @param id 配置 ID
 * @returns 是否删除成功
 */
export async function deleteModelConfig(id: string): Promise<boolean> {
  // 先删除相关的功能映射（级联删除）
  await db
    .delete(aiFunctionMappings)
    .where(eq(aiFunctionMappings.modelConfigId, id))

  // 再删除模型配置本身
  const result = await db
    .delete(aiModelConfigs)
    .where(eq(aiModelConfigs.id, id))

  return result.rowsAffected > 0
}

/**
 * 切换模型配置启用状态
 * @param id 配置 ID
 * @returns 更新后的配置
 */
export async function toggleModelConfig(id: string) {
  const config = await getModelConfigById(id)
  if (!config) {
    throw new Error(`Model config not found: ${id}`)
  }

  const result = await db
    .update(aiModelConfigs)
    .set({
      enabled: !config.enabled,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(aiModelConfigs.id, id))
    .returning()

  return result[0]
}

/**
 * 检查配置名称是否唯一
 * @param name 配置名称
 * @param excludeId 排除的 ID（用于更新时检查）
 * @returns 是否唯一
 */
export async function isConfigNameUnique(
  name: string,
  excludeId?: string
): Promise<boolean> {
  const conditions = [eq(aiModelConfigs.name, name)]

  if (excludeId) {
    conditions.push(sql`${aiModelConfigs.id} != ${excludeId}`)
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(aiModelConfigs)
    .where(and(...conditions))

  return result[0].count === 0
}

/**
 * 获取模型配置列表（用于下拉选择，返回脱敏数据）
 * @returns 模型配置列表
 */
export async function getModelConfigsForSelect() {
  const configs = await db
    .select({
      id: aiModelConfigs.id,
      name: aiModelConfigs.name,
      provider: aiModelConfigs.provider,
      model: aiModelConfigs.model,
      enabled: aiModelConfigs.enabled,
    })
    .from(aiModelConfigs)
    .where(eq(aiModelConfigs.enabled, 1))
    .orderBy(desc(aiModelConfigs.createdAt))

  return configs
}

/**
 * 内部：执行 AI 模型测试
 * 提取共同的测试逻辑以减少代码重复
 */
async function performAIModelTest(options: {
  provider: string
  model: string
  apiKey: string
  baseUrl?: string
  configName?: string // 用于日志
}) {
  const { provider, model, apiKey, baseUrl, configName } = options

  console.log('[performAIModelTest] Testing model:', {
    configName,
    provider,
    model,
    baseUrl,
  })

  // 导入必要的模块
  const { getAIModel } = await import('@/server/ai/providers')
  const { parseAIError } = await import('@/server/ai')
  const { generateText } = await import('ai')

  // 使用工厂函数创建模型实例
  const { model: aiModel } = getAIModel({
    provider: provider as any,
    model,
    apiKey,
    baseUrl,
  })

  console.log('[performAIModelTest] Model created, calling generateText...')

  const startTime = Date.now()

  // 发送简单的测试请求（使用 "Say 'OK'" 以获得确定性的响应）
  const { text } = await generateText({
    model: aiModel,
    prompt: "Say 'OK'",
    maxTokens: 20,
  })

  const duration = Date.now() - startTime

  console.log('[performAIModelTest] Test successful, response:', text)

  return {
    success: true as const,
    responseTime: duration,
    message: text,
  }
}

/**
 * 测试模型配置（从数据库）
 * @param id 配置 ID
 * @returns 测试结果
 */
export async function testModelConfig(id: string) {
  const config = await getModelConfigById(id)
  if (!config) {
    throw new Error(`Model config not found: ${id}`)
  }

  try {
    // 导入解密模块
    const { decrypt } = await import('@/server/ai/crypto')

    // 解密 API Key
    const apiKey = await decrypt(config.apiKeyEncrypted)
    console.log('[testModelConfig] API Key decrypted, length:', apiKey.length)

    return await performAIModelTest({
      provider: config.provider,
      model: config.model,
      apiKey,
      baseUrl: config.baseUrl || undefined,
      configName: config.name,
    })
  } catch (error) {
    const { parseAIError } = await import('@/server/ai')
    const { message, type } = parseAIError(error)

    console.error('[testModelConfig] Test failed:', { type, message })

    return {
      success: false as const,
      error: message,
      errorType: type,
    }
  }
}

/**
 * 测试模型配置（临时配置，用于保存前测试）
 * @param tempConfig 临时配置
 * @returns 测试结果
 */
export async function testModelConfigTemp(tempConfig: {
  provider: string
  model: string
  apiKey: string
  baseUrl?: string
}) {
  try {
    return await performAIModelTest({
      provider: tempConfig.provider,
      model: tempConfig.model,
      apiKey: tempConfig.apiKey,
      baseUrl: tempConfig.baseUrl,
    })
  } catch (error) {
    const { parseAIError } = await import('@/server/ai')
    const { message, type } = parseAIError(error)

    console.error('[testModelConfigTemp] Test failed:', { type, message })

    return {
      success: false as const,
      error: message,
      errorType: type,
    }
  }
}
