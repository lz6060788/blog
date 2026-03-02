/**
 * PostService - 文章业务逻辑层
 *
 * 职责：
 * - 封装文章相关的核心业务逻辑
 * - 处理事务管理
 * - 调用 Repository 层进行数据访问
 * - 处理业务规则验证
 */

import type { PostRepository } from '@/server/repositories/post.repository'

export interface CreatePostInput {
  title: string
  content: string
  excerpt?: string
  published?: boolean
  categoryId?: string
  tags?: string[]
  readTime?: number
  publishedDate?: string
}

export interface UpdatePostInput {
  title?: string
  content?: string
  excerpt?: string
  published?: boolean
  categoryId?: string
  tags?: string[]
  readTime?: number
  publishedDate?: string
}

export interface ListPostsOptions {
  publishedOnly?: boolean
  draftsOnly?: boolean
  search?: string
  page?: number
  limit?: number
}

export interface PostWithRelations {
  id: string
  title: string
  content: string
  excerpt?: string
  published: boolean
  authorId: string
  categoryId?: string | null
  readTime: number
  publishedDate?: string | null
  createdAt: string
  updatedAt: string
  category?: {
    id: string
    name: string
    slug: string
  } | null
  tags: Array<{
    id: string
    name: string
    slug: string
  }>
  wordCount?: number
}

export interface PaginatedPostsResult {
  data: PostWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class PostService {
  constructor(private postRepository: PostRepository) {}

  /**
   * 创建文章
   */
  async createPost(userId: string, input: CreatePostInput): Promise<{ id: string }> {
    // 业务规则验证
    this.validateTitle(input.title)
    this.validateContent(input.content)

    // 自动生成摘要（如果未提供）
    const excerpt = input.excerpt || this.generateExcerpt(input.content)

    // 调用 Repository 层创建文章
    const postId = await this.postRepository.create({
      ...input,
      excerpt,
      authorId: userId,
    })

    return { id: postId }
  }

  /**
   * 更新文章
   */
  async updatePost(
    postId: string,
    userId: string,
    input: UpdatePostInput
  ): Promise<void> {
    // 业务规则验证
    if (input.title !== undefined) {
      this.validateTitle(input.title)
    }
    if (input.content !== undefined) {
      this.validateContent(input.content)
    }

    // 调用 Repository 层更新文章
    await this.postRepository.update(postId, userId, input)
  }

  /**
   * 删除文章
   */
  async deletePost(postId: string, userId: string): Promise<void> {
    await this.postRepository.delete(postId, userId)
  }

  /**
   * 根据 ID 获取文章
   */
  async getPostById(postId: string, userId?: string): Promise<PostWithRelations | null> {
    return await this.postRepository.findById(postId, userId)
  }

  /**
   * 根据 slug 获取文章
   */
  async getPostBySlug(slug: string): Promise<PostWithRelations | null> {
    return await this.postRepository.findBySlug(slug)
  }

  /**
   * 获取文章列表（支持分页和筛选）
   */
  async listPublishedPosts(
    options?: ListPostsOptions
  ): Promise<PaginatedPostsResult> {
    return await this.postRepository.listPublished(options)
  }

  /**
   * 发布文章
   */
  async publishPost(postId: string, userId: string): Promise<void> {
    // 检查文章是否正在生成 AI 摘要
    const post = await this.postRepository.findById(postId, userId)
    if (!post) {
      throw new Error('文章不存在')
    }

    if (post.aiSummaryStatus === 'generating') {
      throw new Error('摘要生成中，请等待完成后再发布')
    }

    await this.postRepository.update(postId, userId, { published: true })
  }

  /**
   * 切换文章发布状态
   */
  async togglePostStatus(postId: string, userId: string): Promise<boolean> {
    const post = await this.postRepository.findById(postId, userId)
    if (!post) {
      throw new Error('文章不存在')
    }

    const newStatus = !post.published
    await this.postRepository.update(postId, userId, { published: newStatus })

    return newStatus
  }

  /**
   * 验证标题
   */
  private validateTitle(title: string): void {
    if (!title.trim()) {
      throw new Error('标题不能为空')
    }
  }

  /**
   * 验证内容
   */
  private validateContent(content: string): void {
    if (!content.trim()) {
      throw new Error('内容不能为空')
    }
  }

  /**
   * 生成摘要（从内容前 150 字提取）
   */
  private generateExcerpt(content: string, maxLength = 150): string {
    // 移除 Markdown 语法
    const plainText = content
      .replace(/^#{1,6}\s+/gm, '') // 标题
      .replace(/\*\*([^*]+)\*\*/g, '$1') // 粗体
      .replace(/\*([^*]+)\*/g, '$1') // 斜体
      .replace(/`([^`]+)`/g, '$1') // 行内代码
      .replace(/```[\s\S]*?```/g, '') // 代码块
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 链接
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // 图片
      .replace(/^\s*[-*+]\s+/gm, '') // 列表
      .replace(/^\s*\d+\.\s+/gm, '') // 有序列表
      .replace(/^\s*>\s+/gm, '') // 引用
      .replace(/\n+/g, ' ') // 换行转为空格
      .trim()

    if (plainText.length <= maxLength) {
      return plainText
    }
    return plainText.substring(0, maxLength).trim() + '...'
  }
}
