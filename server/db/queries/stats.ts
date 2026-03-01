import { db } from '../index'
import { posts } from '../schema'
import { eq, gte, sql, and } from 'drizzle-orm'
import { SummaryStatus } from '../../ai/types'

/**
 * 统计数据类型定义
 */
export interface DashboardStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  recentPosts: number
  aiGeneratedPosts: number
  aiPendingPosts: number
  aiFailedPosts: number
  aiTotalTokens: number
}

/**
 * 获取所有文章总数
 * @returns 文章总数
 */
export async function getTotalPosts(): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
  return result[0]?.count || 0
}

/**
 * 获取已发布文章数
 * @returns 已发布文章数
 */
export async function getPublishedPostsCount(): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .where(eq(posts.published, true))
  return result[0]?.count || 0
}

/**
 * 获取草稿文章数
 * @returns 草稿文章数
 */
export async function getDraftPostsCount(): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .where(eq(posts.published, false))
  return result[0]?.count || 0
}

/**
 * 获取最近7天新增文章数
 * @returns 最近7天新增文章数
 */
export async function getRecentPostsCount(): Promise<number> {
  // 7天 = 7 * 24 * 60 * 60 * 1000 = 604800000 毫秒
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .where(gte(posts.createdAt, sevenDaysAgo))
  return result[0]?.count || 0
}

/**
 * 获取管理端首页所需的完整统计数据
 * @returns 统计数据对象
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [totalPosts, publishedPosts, draftPosts, recentPosts, aiStats] = await Promise.all([
    getTotalPosts(),
    getPublishedPostsCount(),
    getDraftPostsCount(),
    getRecentPostsCount(),
    getAIStats(),
  ])

  return {
    totalPosts,
    publishedPosts,
    draftPosts,
    recentPosts,
    ...aiStats,
  }
}

/**
 * AI 统计数据类型定义
 */
export interface AIStats {
  aiGeneratedPosts: number
  aiPendingPosts: number
  aiFailedPosts: number
  aiTotalTokens: number
}

/**
 * 获取已生成 AI 摘要的文章数
 * @returns 已生成摘要的文章数
 */
export async function getAIGeneratedPostsCount(): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .where(eq(posts.aiSummaryStatus, SummaryStatus.DONE))
  return result[0]?.count || 0
}

/**
 * 获取 AI 摘要生成中的文章数
 * @returns 生成中的文章数
 */
export async function getAIPendingPostsCount(): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .where(eq(posts.aiSummaryStatus, SummaryStatus.GENERATING))
  return result[0]?.count || 0
}

/**
 * 获取 AI 摘要生成失败的文章数
 * @returns 失败的文章数
 */
export async function getAIFailedPostsCount(): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .where(eq(posts.aiSummaryStatus, SummaryStatus.FAILED))
  return result[0]?.count || 0
}

/**
 * 获取 AI 统计数据
 * @returns AI 统计数据对象
 */
export async function getAIStats(): Promise<AIStats> {
  const [aiGeneratedPosts, aiPendingPosts, aiFailedPosts, aiTotalTokens] = await Promise.all([
    getAIGeneratedPostsCount(),
    getAIPendingPostsCount(),
    getAIFailedPostsCount(),
    getAITotalTokens(),
  ])

  return {
    aiGeneratedPosts,
    aiPendingPosts,
    aiFailedPosts,
    aiTotalTokens,
  }
}

/**
 * 获取今日 Token 使用量
 * @returns 今日总 Token 数
 */
export async function getAITotalTokens(): Promise<number> {
  const { getTodayTokenUsage } = await import('./ai-logs')
  return await getTodayTokenUsage()
}
