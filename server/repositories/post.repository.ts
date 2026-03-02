/**
 * PostRepository - 文章数据访问层
 *
 * 职责：
 * - 封装所有数据库操作
 * - 提供优化的查询方法
 * - 处理关联查询（避免 N+1 问题）
 * - 屏蔽 ORM 细节
 */

import { db } from '@/server/db'
import { posts, categories, tags, postTags } from '@/server/db/schema'
import { eq, sql, desc, inArray } from 'drizzle-orm'
import { PaginationHelper, DEFAULT_LIMIT } from '@/lib/types/pagination'

export type { CreatePostInput, UpdatePostInput, ListPostsOptions, PostWithRelations, PaginatedPostsResult } from '@/server/services/post.service'

export class PostRepository {
  /**
   * 创建文章
   */
  async create(input: {
    title: string
    content: string
    excerpt?: string
    published: boolean
    authorId: string
    categoryId?: string | null
    readTime: number
    publishedDate?: string | null
    tags?: string[]
  }): Promise<string> {
    const postId = crypto.randomUUID()

    // 插入文章
    await db.insert(posts).values({
      id: postId,
      title: input.title,
      content: input.content,
      excerpt: input.excerpt,
      published: input.published,
      authorId: input.authorId,
      categoryId: input.categoryId || null,
      readTime: input.readTime,
      publishedDate: input.publishedDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // 处理标签关联
    if (input.tags && Array.isArray(input.tags) && input.tags.length > 0) {
      await this._associateTags(postId, input.tags)
    }

    return postId
  }

  /**
   * 更新文章
   */
  async update(
    postId: string,
    userId: string,
    input: {
      title?: string
      content?: string
      excerpt?: string
      published?: boolean
      categoryId?: string
      tags?: string[]
      readTime?: number
      publishedDate?: string
      aiSummary?: string | null
      aiSummaryStatus?: 'pending' | 'generating' | 'done' | 'failed' | null
    }
  ): Promise<void> {
    // 检查文章是否存在且属于当前用户
    const existingPost = await this._findByIdRaw(postId)
    if (!existingPost) {
      throw new Error('文章不存在')
    }
    if (existingPost.authorId !== userId) {
      throw new Error('无权修改此文章')
    }

    // 构建更新数据
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    }

    if (input.title !== undefined) updateData.title = input.title
    if (input.content !== undefined) updateData.content = input.content
    if (input.excerpt !== undefined) updateData.excerpt = input.excerpt
    if (input.published !== undefined) updateData.published = input.published
    if (input.categoryId !== undefined) updateData.categoryId = input.categoryId
    if (input.readTime !== undefined) updateData.readTime = input.readTime
    if (input.publishedDate !== undefined) updateData.publishedDate = input.publishedDate

    await db.update(posts).set(updateData).where(eq(posts.id, postId))

    // 处理标签更新
    if (input.tags !== undefined) {
      await db.delete(postTags).where(eq(postTags.postId, postId))
      if (input.tags.length > 0) {
        await this._associateTags(postId, input.tags)
      }
    }
  }

  /**
   * 删除文章
   */
  async delete(postId: string, userId: string): Promise<void> {
    // 检查文章是否存在且属于当前用户
    const existingPost = await this._findByIdRaw(postId)
    if (!existingPost) {
      throw new Error('文章不存在')
    }
    if (existingPost.authorId !== userId) {
      throw new Error('无权删除此文章')
    }

    await db.delete(posts).where(eq(posts.id, postId))
  }

  /**
   * 根据 ID 获取文章（带关联数据）
   */
  async findById(postId: string, userId?: string): Promise<any | null> {
    const result = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1)

    if (result.length === 0) {
      return null
    }

    const post = result[0]

    // 权限检查
    if (userId && post.authorId !== userId) {
      throw new Error('无权访问此文章')
    }

    // 获取关联数据
    const [category, tags] = await Promise.all([
      this._getPostCategory(post.categoryId),
      this._getPostTags(postId),
    ])

    return {
      ...post,
      category,
      tags,
      wordCount: (post.content || '').length,
    }
  }

  /**
   * 根据 slug 获取文章
   */
  async findBySlug(slug: string): Promise<any | null> {
    // TODO: 实现根据 slug 查询的逻辑
    // 目前 posts 表没有 slug 字段，需要添加
    throw new Error('findBySlug 功能待实现，需要先为 posts 表添加 slug 字段')
  }

  /**
   * 获取已发布文章列表（支持分页和筛选）
   */
  async listPublished(options?: {
    publishedOnly?: boolean
    draftsOnly?: boolean
    search?: string
    page?: number
    limit?: number
  }): Promise<{
    data: any[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    // 规范化分页参数
    const { page, limit, offset } = PaginationHelper.normalizeParams(options)

    // 构建 WHERE 条件
    let whereConditions: any[] = []

    if (options?.publishedOnly) {
      whereConditions.push(sql`${posts.published} = 1`)
    } else if (options?.draftsOnly) {
      whereConditions.push(sql`${posts.published} = 0`)
    }

    if (options?.search && options.search.trim()) {
      whereConditions.push(sql`${posts.title} LIKE ${'%' + options.search.trim() + '%'}`)
    }

    // 组合 WHERE 条件
    const whereClause =
      whereConditions.length > 0 ? (whereConditions.length === 1 ? whereConditions[0] : sql.join(whereConditions, sql` AND `)) : undefined

    // 获取总数
    const countResult = await db
      .select({ count: sql`COUNT(*)` })
      .from(posts)
      .where(whereClause)

    const total = Number(countResult[0]?.count || 0)

    // 获取分页数据（使用 leftJoin 优化关联查询）
    const postsData = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        excerpt: posts.excerpt,
        published: posts.published,
        authorId: posts.authorId,
        categoryId: posts.categoryId,
        readTime: posts.readTime,
        publishedDate: posts.publishedDate,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .where(whereClause)
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset)

    // 批量获取标签（避免 N+1 查询）
    const postIds = postsData.map((p) => p.id)
    const allTags =
      postIds.length > 0
        ? await db
            .select({
              postId: postTags.postId,
              tagId: tags.id,
              tagName: tags.name,
              tagSlug: tags.slug,
            })
            .from(postTags)
            .leftJoin(tags, eq(postTags.tagId, tags.id))
            .where(inArray(postTags.postId, postIds))
        : []

    // 组装数据
    const data = postsData.map((post) => ({
      ...post,
      category: post.categoryName
        ? {
            id: post.categoryId,
            name: post.categoryName,
            slug: post.categorySlug,
          }
        : null,
      tags: allTags.filter((t) => t.postId === post.id).map((t) => ({ id: t.tagId, name: t.tagName, slug: t.tagSlug })),
      wordCount: (post.content || '').length,
    }))

    // 计算分页元数据
    const metadata = PaginationHelper.calculateMetadata(total, page, limit)

    return {
      data,
      ...metadata,
    }
  }

  /**
   * 原始查询方法 - 不检查权限
   */
  private async _findByIdRaw(postId: string): Promise<any | null> {
    const result = await db.select().from(posts).where(eq(posts.id, postId)).limit(1)
    return result.length > 0 ? result[0] : null
  }

  /**
   * 获取文章的分类
   */
  private async _getPostCategory(categoryId: string | null): Promise<any> {
    if (!categoryId) return null

    const result = await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1)
    return result.length > 0 ? { id: result[0].id, name: result[0].name, slug: result[0].slug } : null
  }

  /**
   * 获取文章的标签
   */
  private async _getPostTags(postId: string): Promise<any[]> {
    return await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
      })
      .from(postTags)
      .leftJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, postId))
  }

  /**
   * 关联标签到文章
   */
  private async _associateTags(postId: string, tagNames: string[]): Promise<void> {
    const { generateSlug } = await import('@/lib/utils/slug')

    for (const tagName of tagNames) {
      if (!tagName || typeof tagName !== 'string') continue

      // 检查标签是否已存在
      const [existingTag] = await db.select().from(tags).where(eq(tags.name, tagName.trim())).limit(1)

      let tagId: string

      if (existingTag) {
        tagId = existingTag.id
      } else {
        // 创建新标签
        const newTagId = crypto.randomUUID()
        const slug = generateSlug(tagName.trim())

        const [newTag] = await db
          .insert(tags)
          .values({
            id: newTagId,
            name: tagName.trim(),
            slug,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .returning()

        tagId = newTag.id
      }

      // 建立文章-标签关联
      await db.insert(postTags).values({
        postId,
        tagId,
      })
    }
  }
}
