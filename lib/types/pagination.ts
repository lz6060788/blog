/**
 * 分页参数
 */

export interface PaginationParams {
  /** 页码（从 1 开始） */
  page?: number
  /** 每页数量 */
  limit?: number
}

export interface PaginationResult {
  /** 当前页码 */
  page: number
  /** 每页数量 */
  limit: number
  /** 总记录数 */
  total: number
  /** 总页数 */
  totalPages: number
  /** 是否有下一页 */
  hasNext: boolean
  /** 是否有上一页 */
  hasPrev: boolean
}

/**
 * 分页参数默认值
 */
export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 20
export const MAX_LIMIT = 100

/**
 * 分页工具类
 */
export class PaginationHelper {
  /**
   * 规范化分页参数
   */
  static normalizeParams(params?: PaginationParams): {
    page: number
    limit: number
    offset: number
  } {
    const page = Math.max(DEFAULT_PAGE, params?.page || DEFAULT_PAGE)
    const limit = Math.min(MAX_LIMIT, Math.max(1, params?.limit || DEFAULT_LIMIT))
    const offset = (page - 1) * limit

    return { page, limit, offset }
  }

  /**
   * 计算分页元数据
   */
  static calculateMetadata(
    total: number,
    page: number,
    limit: number
  ): PaginationResult {
    const totalPages = Math.ceil(total / limit)

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  }
}
