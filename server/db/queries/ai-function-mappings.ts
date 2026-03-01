import { db } from '../index'
import { aiFunctionMappings, aiModelConfigs } from '../schema'
import { eq, and } from 'drizzle-orm'
import { AIFunction } from '../../ai/types'

/**
 * AI 功能映射查询
 */

/**
 * 获取所有功能映射
 * @returns 功能映射列表
 */
export async function getAllFunctionMappings() {
  return await db
    .select({
      id: aiFunctionMappings.id,
      functionName: aiFunctionMappings.functionName,
      modelConfigId: aiFunctionMappings.modelConfigId,
      createdAt: aiFunctionMappings.createdAt,
      updatedAt: aiFunctionMappings.updatedAt,
      modelConfig: {
        id: aiModelConfigs.id,
        name: aiModelConfigs.name,
        provider: aiModelConfigs.provider,
        model: aiModelConfigs.model,
        enabled: aiModelConfigs.enabled,
      },
    })
    .from(aiFunctionMappings)
    .leftJoin(aiModelConfigs, eq(aiFunctionMappings.modelConfigId, aiModelConfigs.id))
    .orderBy(aiFunctionMappings.functionName)
}

/**
 * 根据功能名获取映射
 * @param functionName 功能名称
 * @returns 功能映射
 */
export async function getFunctionMapping(functionName: AIFunction | string) {
  const result = await db
    .select({
      id: aiFunctionMappings.id,
      functionName: aiFunctionMappings.functionName,
      modelConfigId: aiFunctionMappings.modelConfigId,
      createdAt: aiFunctionMappings.createdAt,
      updatedAt: aiFunctionMappings.updatedAt,
      modelConfig: {
        id: aiModelConfigs.id,
        name: aiModelConfigs.name,
        provider: aiModelConfigs.provider,
        model: aiModelConfigs.model,
        enabled: aiModelConfigs.enabled,
      },
    })
    .from(aiFunctionMappings)
    .leftJoin(aiModelConfigs, eq(aiFunctionMappings.modelConfigId, aiModelConfigs.id))
    .where(eq(aiFunctionMappings.functionName, functionName))
    .limit(1)

  return result[0] || null
}

/**
 * 更新功能映射
 * @param functionName 功能名称
 * @param modelConfigId 模型配置 ID
 * @returns 更新的映射
 */
export async function updateFunctionMapping(
  functionName: string,
  modelConfigId: string | null
) {
  const crypto = require('crypto')
  const id = crypto.randomBytes(16).toString('hex')

  // 检查映射是否存在
  const existing = await db.query.aiFunctionMappings.findFirst({
    where: eq(aiFunctionMappings.functionName, functionName),
  })

  if (existing) {
    // 更新
    const result = await db
      .update(aiFunctionMappings)
      .set({
        modelConfigId,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(aiFunctionMappings.functionName, functionName))
      .returning()

    return result[0]
  } else {
    // 创建
    const result = await db
      .insert(aiFunctionMappings)
      .values({
        id,
        functionName,
        modelConfigId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning()

    return result[0]
  }
}

/**
 * 获取默认模型配置映射（用于前端显示）
 * @returns 功能到模型的映射
 */
export async function getDefaultModelMappings() {
  const mappings = await getAllFunctionMappings()

  const result: Record<string, any> = {}
  for (const mapping of mappings) {
    result[mapping.functionName] = mapping.modelConfig
      ? {
          id: mapping.modelConfig.id,
          name: mapping.modelConfig.name,
          provider: mapping.modelConfig.provider,
          model: mapping.modelConfig.model,
        }
      : null
  }

  return result
}
