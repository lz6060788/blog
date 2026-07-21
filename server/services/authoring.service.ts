import { db } from '@/server/db'
import { categories, tags } from '@/server/db/schema'
import { PostRepository } from '@/server/repositories/post.repository'
import { PostService } from '@/server/services/post.service'

export interface CreateDraftInput {
  title: string
  content: string
  excerpt: string
  categoryId?: string
  tags?: string[]
}

export interface UpdateDraftInput {
  title?: string
  content?: string
  excerpt?: string
  categoryId?: string | null
  tags?: string[]
}

function calculateReadTime(content: string): number {
  return Math.max(1, Math.ceil(content.length / 400))
}

function assertTags(tagsToValidate?: string[]): void {
  if (tagsToValidate && tagsToValidate.length > 3) {
    throw new Error('每篇文章最多只能设置 3 个标签')
  }
}

function appBaseUrl(): string {
  return (process.env.BLOG_PUBLIC_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')
}

export class AuthoringService {
  private readonly postService = new PostService(new PostRepository())

  async getBlogContext() {
    const [categoryRows, tagRows] = await Promise.all([
      db.select().from(categories).orderBy(categories.name),
      db.select().from(tags).orderBy(tags.name),
    ])

    return {
      language: 'zh-CN',
      contentFormat: 'markdown',
      maxTags: 3,
      categories: categoryRows.map(({ id, name, slug }) => ({ id, name, slug })),
      tags: tagRows.map(({ id, name, slug }) => ({ id, name, slug })),
    }
  }

  async createDraft(userId: string, input: CreateDraftInput) {
    assertTags(input.tags)
    const result = await this.postService.createPost(userId, {
      ...input,
      published: false,
      readTime: calculateReadTime(input.content),
    })
    return this.getPreview(userId, result.id)
  }

  async listPosts(
    userId: string,
    options?: {
      status?: 'all' | 'draft' | 'published'
      search?: string
      page?: number
      limit?: number
    }
  ) {
    const result = await this.postService.listPostsForAuthor(userId, options)
    const baseUrl = appBaseUrl()
    const { data, ...pagination } = result
    return {
      ...pagination,
      posts: data.map((post) => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt || null,
        published: post.published,
        category: post.category,
        tags: post.tags,
        readTime: post.readTime,
        coverImageUrl: post.coverImageUrl || null,
        publishedDate: post.publishedDate || null,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        editorUrl: `${baseUrl}/admin/posts/${post.id}/edit`,
        publicUrl: post.published ? `${baseUrl}/zh/post/${post.id}` : null,
      })),
    }
  }

  async getPost(userId: string, postId: string) {
    return this.getPreview(userId, postId)
  }

  async updatePost(
    userId: string,
    postId: string,
    input: UpdateDraftInput,
    expectedUpdatedAt: string
  ) {
    assertTags(input.tags)
    const existing = await this.postService.getPostById(postId, userId)
    if (!existing) throw new Error('文章不存在')
    if (existing.updatedAt !== expectedUpdatedAt) {
      throw new Error('文章已在其他位置被修改，请重新读取文章后再编辑')
    }
    if (Object.keys(input).length === 0) throw new Error('至少需要提供一个要修改的字段')

    await this.postService.updatePost(postId, userId, {
      ...input,
      readTime: input.content ? calculateReadTime(input.content) : undefined,
    })
    return this.getPreview(userId, postId)
  }

  async updateDraft(userId: string, postId: string, input: UpdateDraftInput) {
    assertTags(input.tags)
    const existing = await this.postService.getPostById(postId, userId)
    if (!existing) throw new Error('文章不存在')
    if (existing.published) throw new Error('该文章已经发布，请使用后台编辑流程修改')

    await this.postService.updatePost(postId, userId, {
      ...input,
      readTime: input.content ? calculateReadTime(input.content) : undefined,
    })
    return this.getPreview(userId, postId)
  }

  async getPreview(userId: string, postId: string) {
    const post = await this.postService.getPostById(postId, userId)
    if (!post) throw new Error('文章不存在')

    const baseUrl = appBaseUrl()
    return {
      post,
      editorUrl: `${baseUrl}/admin/posts/${postId}/edit`,
      publicUrl: post.published ? `${baseUrl}/zh/post/${postId}` : null,
    }
  }

  async publish(userId: string, postId: string) {
    const post = await this.postService.getPostById(postId, userId)
    if (!post) throw new Error('文章不存在')

    const publishedDate = post.publishedDate || new Date().toISOString()
    await this.postService.updatePost(postId, userId, {
      published: true,
      publishedDate,
    })
    return this.getPreview(userId, postId)
  }
}

export const authoringService = new AuthoringService()
