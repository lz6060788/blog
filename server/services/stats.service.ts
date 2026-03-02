/**
 * StatsService - 统计业务逻辑层
 *
 * 职责：
 * - 封装统计数据相关的业务逻辑
 * - 聚合来自不同查询函数的数据
 */

import * as StatsQueries from '@/server/db/queries/stats'

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

export class StatsService {
  /**
   * 获取管理端首页统计数据
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return await StatsQueries.getDashboardStats()
  }

  /**
   * 获取文章总数
   */
  async getTotalPosts(): Promise<number> {
    return await StatsQueries.getTotalPosts()
  }

  /**
   * 获取已发布文章数
   */
  async getPublishedPostsCount(): Promise<number> {
    return await StatsQueries.getPublishedPostsCount()
  }

  /**
   * 获取草稿文章数
   */
  async getDraftPostsCount(): Promise<number> {
    return await StatsQueries.getDraftPostsCount()
  }
}

// 导出单例实例
export const statsService = new StatsService()
