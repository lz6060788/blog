import { db } from '../index'
import { aiCallLogs } from '../schema'
import { eq, desc, gte, lte, sql, and } from 'drizzle-orm'
import { AICallStatus } from '../../ai/types'

/**
 * AI 日志查询
 */

/**
 * 分页查询 AI 调用日志
 * @param options 查询选项
 * @returns 日志列表和总数
 */
export async function getCallLogs(options?: {
  page?: number
  limit?: number
  modelConfigId?: string
  status?: AICallStatus
  startDate?: string
  endDate?: string
}) {
  const page = options?.page || 1
  const limit = options?.limit || 20
  const offset = (page - 1) * limit

  // 构建查询条件
  const conditions = []

  if (options?.modelConfigId) {
    conditions.push(eq(aiCallLogs.modelConfigId, options.modelConfigId))
  }

  if (options?.status) {
    conditions.push(eq(aiCallLogs.status, options.status))
  }

  if (options?.startDate) {
    conditions.push(gte(aiCallLogs.createdAt, options.startDate))
  }

  if (options?.endDate) {
    conditions.push(lte(aiCallLogs.createdAt, options.endDate))
  }

  // 获取总数
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(aiCallLogs)
    .where(conditions.length > 0 ? and(...conditions) : undefined)

  const total = countResult[0].count

  // 获取日志列表
  const logs = await db
    .select()
    .from(aiCallLogs)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(aiCallLogs.createdAt))
    .limit(limit)
    .offset(offset)

  // 关联查询：获取配置名称和文章标题
  for (const log of logs) {
    if (log.modelConfigId) {
      const modelConfig = await db.query.aiModelConfigs.findFirst({
        where: (table, { eq }) => eq(table.id, log.modelConfigId),
      })
      ;(log as any).configName = modelConfig?.name || 'Unknown'
    }

    if (log.postId) {
      const post = await db.query.posts.findFirst({
        where: (table, { eq }) => eq(table.id, log.postId),
      })
      ;(log as any).postTitle = post?.title || 'Unknown'
    }
  }

  return {
    logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * 获取日志统计信息
 * @param options 查询选项
 * @returns 统计数据
 */
export async function getCallLogStats(options?: {
  startDate?: string
  endDate?: string
}) {
  const conditions = []

  if (options?.startDate) {
    conditions.push(gte(aiCallLogs.createdAt, options.startDate))
  }

  if (options?.endDate) {
    conditions.push(lte(aiCallLogs.createdAt, options.endDate))
  }

  const result = await db
    .select({
      total: sql<number>`count(*)`,
      success: sql<number>`sum(CASE WHEN status = 'success' THEN 1 ELSE 0 END)`,
      failed: sql<number>`sum(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)`,
      totalTokens: sql<number>`sum(input_tokens + output_tokens)`,
    })
    .from(aiCallLogs)
    .where(conditions.length > 0 ? and(...conditions) : undefined)

  return result[0]
}

/**
 * 获取今日 Token 使用量
 * @returns 今日总 Token 数
 */
export async function getTodayTokenUsage(): Promise<number> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startDate = today.toISOString()

  const result = await getCallLogStats({ startDate })

  return result.totalTokens || 0
}
