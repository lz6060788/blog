import { eq, or } from 'drizzle-orm'

import { generateSlug } from '@/lib/utils/slug'
import { db } from '@/server/db'
import { categories, tags } from '@/server/db/schema'
import { DraftRepository, type DraftInput } from '@/server/repositories/draft.repository'
import { PostRepository } from '@/server/repositories/post.repository'
import { SeriesRepository } from '@/server/repositories/series.repository'
import { PostService } from '@/server/services/post.service'

export interface CreateDraftInput extends DraftInput {}
export interface UpdateDraftInput extends Partial<DraftInput> {}
export interface CreateCategoryInput { name: string; slug?: string; description?: string }

function assertTags(tagsToValidate?: string[]) {
  if (tagsToValidate && tagsToValidate.length > 3) throw new Error('每篇文章最多只能设置 3 个标签')
}

function appBaseUrl() {
  return (process.env.BLOG_PUBLIC_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')
}

export class AuthoringService {
  private readonly postService = new PostService(new PostRepository())
  private readonly postRepository = new PostRepository()
  private readonly draftRepository = new DraftRepository()
  private readonly seriesRepository = new SeriesRepository()

  async getBlogContext() {
    const [categoryRows, tagRows, seriesRows] = await Promise.all([
      db.select().from(categories).orderBy(categories.name),
      db.select().from(tags).orderBy(tags.name),
      this.seriesRepository.list(),
    ])
    return {
      language: 'zh-CN',
      contentFormat: 'markdown',
      maxTags: 3,
      internalLinks: {
        authoringStyle: 'Obsidian-style title selection with an optional display alias',
        storedSyntax: '[显示文字](post:ARTICLE_UUID)',
        note: 'Use search_internal_posts to obtain a stable published article UUID.',
      },
      draftWorkflow: {
        newArticle: 'create_post_draft -> publish_post',
        revision: 'update_post creates/reuses one bound draft -> publish_post',
      },
      categories: categoryRows.map(({ id, name, slug }) => ({ id, name, slug })),
      tags: tagRows.map(({ id, name, slug }) => ({ id, name, slug })),
      series: seriesRows.map(({ id, name, slug, description, postCount }) => ({ id, name, slug, description, postCount: Number(postCount) })),
    }
  }

  async createCategory(input: CreateCategoryInput) {
    const name = input.name.trim()
    const slug = generateSlug(input.slug?.trim() || name)
    if (!name) throw new Error('分类名称不能为空')
    if (!slug) throw new Error('无法生成有效的分类 slug')
    const existing = await db.select({ id: categories.id, name: categories.name, slug: categories.slug }).from(categories).where(or(eq(categories.name, name), eq(categories.slug, slug)))
    if (existing.some((item) => item.name === name)) throw new Error(`分类名称“${name}”已存在`)
    if (existing.some((item) => item.slug === slug)) throw new Error(`分类 slug“${slug}”已存在`)
    const now = new Date().toISOString()
    const [created] = await db.insert(categories).values({ id: crypto.randomUUID(), name, slug, description: input.description?.trim() || null, createdAt: now, updatedAt: now }).returning()
    return created
  }

  async createSeries(userId: string, input: { name: string; slug?: string; description?: string }) {
    return this.seriesRepository.create(userId, input)
  }

  async listSeries(userId: string) {
    return this.seriesRepository.list(userId)
  }

  async createDraft(userId: string, input: CreateDraftInput) {
    assertTags(input.tags)
    const id = await this.draftRepository.create(userId, input)
    return this.getPreview(userId, id)
  }

  async createRevision(userId: string, postId: string) {
    const draft = await this.draftRepository.getOrCreateForPost(userId, postId)
    return this.draftPreview(draft)
  }

  async listPosts(userId: string, options?: { status?: 'all' | 'draft' | 'published'; search?: string; page?: number; limit?: number }) {
    if (options?.status === 'draft') return this.listDrafts(userId, options)
    const result = await this.postRepository.listForAuthor(userId, { status: 'published', search: options?.search, page: options?.page, limit: options?.limit })
    const baseUrl = appBaseUrl()
    const { data, ...pagination } = result
    return {
      ...pagination,
      posts: data.map((post) => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt || null,
        published: true,
        category: post.category || null,
        series: post.series || null,
        seriesOrder: post.seriesOrder ?? null,
        hasDraft: Boolean(post.hasDraft),
        tags: post.tags,
        readTime: post.readTime,
        coverImageUrl: post.coverImageUrl || null,
        publishedDate: post.publishedDate || null,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        editorUrl: `${baseUrl}/admin/posts/${post.id}/edit`,
        publicUrl: `${baseUrl}/zh/post/${post.id}`,
      })),
    }
  }

  async listDrafts(userId: string, options?: { search?: string; page?: number; limit?: number }) {
    const result = await this.draftRepository.listForAuthor(userId, options)
    const baseUrl = appBaseUrl()
    const { data, ...pagination } = result
    return {
      ...pagination,
      posts: data.map((draft) => ({
        id: draft.id,
        title: draft.title,
        excerpt: draft.excerpt || null,
        published: false,
        category: draft.category,
        series: draft.series,
        seriesOrder: draft.seriesOrder,
        tags: draft.tags,
        readTime: draft.readTime,
        coverImageUrl: draft.coverImageUrl,
        publishedDate: null,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
        editorUrl: `${baseUrl}/admin/posts/${draft.id}/edit`,
        publicUrl: null,
      })),
    }
  }

  async getPost(userId: string, postId: string) {
    const post = await this.postService.getPostById(postId, userId)
    if (!post || !post.published) throw new Error('已发布文章不存在')
    return { post, editorUrl: `${appBaseUrl()}/admin/posts/${postId}/edit`, publicUrl: `${appBaseUrl()}/zh/post/${postId}` }
  }

  async getDraft(userId: string, draftId: string) {
    const draft = await this.draftRepository.findById(draftId, userId)
    if (!draft) throw new Error('草稿不存在')
    return this.draftPreview(draft)
  }

  async updatePost(userId: string, postId: string, input: UpdateDraftInput, expectedUpdatedAt: string) {
    assertTags(input.tags)
    const post = await this.postService.getPostById(postId, userId)
    if (!post) throw new Error('文章不存在')
    if (post.updatedAt !== expectedUpdatedAt) throw new Error('文章已在其他位置被修改，请重新读取文章后再编辑')
    const draft = await this.draftRepository.getOrCreateForPost(userId, postId)
    await this.draftRepository.update(draft.id, userId, input)
    return this.getPreview(userId, draft.id)
  }

  async updateDraft(userId: string, draftId: string, input: UpdateDraftInput) {
    assertTags(input.tags)
    await this.draftRepository.update(draftId, userId, input)
    return this.getPreview(userId, draftId)
  }

  async getPreview(userId: string, documentId: string) {
    const draft = await this.draftRepository.findById(documentId, userId)
    if (draft) return this.draftPreview(draft)
    return this.getPost(userId, documentId)
  }

  async publish(userId: string, documentId: string) {
    const directDraft = await this.draftRepository.findById(documentId, userId)
    const draft = directDraft || await this.draftRepository.findByPostId(documentId, userId)
    if (!draft) throw new Error('没有可发布的草稿；请先创建或更新草稿')
    const postId = await this.draftRepository.publish(draft.id, userId)
    return this.getPost(userId, postId)
  }

  async searchInternalPosts(userId: string, search?: string, limit = 20) {
    const result = await this.postRepository.listForAuthor(userId, { status: 'published', search, page: 1, limit })
    return result.data.map((post) => ({ id: post.id, title: post.title, excerpt: post.excerpt || null, category: post.category, internalLink: `[${post.title}](post:${post.id})` }))
  }

  private draftPreview(draft: Awaited<ReturnType<DraftRepository['findById']>> & {}) {
    if (!draft) throw new Error('草稿不存在')
    const baseUrl = appBaseUrl()
    return {
      post: { ...draft, published: false, documentType: 'draft', isRevision: Boolean(draft.postId) },
      editorUrl: `${baseUrl}/admin/posts/${draft.id}/edit`,
      publicUrl: draft.postId ? `${baseUrl}/zh/post/${draft.postId}` : null,
    }
  }
}

export const authoringService = new AuthoringService()
