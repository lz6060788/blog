import { and, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm'

import { generateSlug } from '@/lib/utils/slug'
import { db } from '@/server/db'
import {
  categories,
  postDrafts,
  postDraftTags,
  posts,
  postTags,
  series,
  tags,
} from '@/server/db/schema'

export interface DraftInput {
  title: string
  content: string
  excerpt?: string | null
  categoryId?: string | null
  seriesId?: string | null
  seriesOrder?: number | null
  tags?: string[]
  readTime?: number
  coverImageUrl?: string | null
  aiCoverStatus?: string | null
}

export interface DraftDocument {
  postPublished: boolean
  id: string
  postId: string | null
  title: string
  content: string
  excerpt: string | null
  authorId: string
  categoryId: string | null
  seriesId: string | null
  seriesOrder: number | null
  readTime: number
  coverImageUrl: string | null
  aiCoverStatus: string | null
  aiCoverGeneratedAt: string | null
  aiCoverPrompt: string | null
  createdAt: string
  updatedAt: string
  category: { id: string; name: string; slug: string } | null
  series: { id: string; name: string; slug: string } | null
  tags: Array<{ id: string; name: string; slug: string }>
}

function calculateReadTime(content: string) {
  return Math.max(1, Math.ceil(content.length / 400))
}

async function ensureTagIds(tx: any, tagNames: string[]) {
  const normalized = Array.from(new Set(tagNames.map((name) => name.trim()).filter(Boolean)))
  const ids: string[] = []

  for (const name of normalized) {
    const [existing] = await tx.select().from(tags).where(eq(tags.name, name)).limit(1)
    if (existing) {
      ids.push(existing.id)
      continue
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const [created] = await tx
      .insert(tags)
      .values({ id, name, slug: generateSlug(name), createdAt: now, updatedAt: now })
      .returning({ id: tags.id })
    ids.push(created.id)
  }

  return ids
}

export class DraftRepository {
  constructor(private readonly database = db) {}
  private async lockDraft(tx: any, id: string, userId: string, expectedUpdatedAt?: string) {
    const condition = and(eq(postDrafts.id, id), eq(postDrafts.authorId, userId))
    const [pointer] = await tx.select().from(postDrafts).where(condition)
    if (!pointer) throw new Error('草稿已发布、已删除或无权操作，请刷新后重试')
    // Every operation locks the parent before its draft, including withdrawal.
    if (pointer.postId) {
      const [parent] = await tx.select().from(posts).where(and(eq(posts.id, pointer.postId), eq(posts.authorId, userId))).for('update')
      if (!parent) throw new Error('关联文章不存在或无权操作')
    }
    const [draft] = await tx.select().from(postDrafts).where(condition).for('update')
    if (!draft) throw new Error('草稿已发布或已删除，请刷新后重试')
    if (expectedUpdatedAt && draft.updatedAt !== expectedUpdatedAt) throw new Error('草稿或发布状态已在其他位置改变，请刷新后重试')
    return draft as typeof postDrafts.$inferSelect
  }

  private async ensureForPost(tx: any, userId: string, postId: string) {
    const [post] = await tx.select().from(posts).where(and(eq(posts.id, postId), eq(posts.authorId, userId))).for('update')
    if (!post) throw new Error('文章不存在或无权编辑')
    const [existing] = await tx.select().from(postDrafts).where(eq(postDrafts.postId, postId)).for('update')
    if (existing) return existing as typeof postDrafts.$inferSelect
    const { published: _published, publishedDate: _date, ...snapshot } = post
    const now = new Date().toISOString()
    const [draft] = await tx.insert(postDrafts).values({ ...snapshot, id: crypto.randomUUID(), postId, createdAt: now, updatedAt: now }).returning()
    const tagRows = await tx.select({ tagId: postTags.tagId }).from(postTags).where(eq(postTags.postId, postId))
    if (tagRows.length) await tx.insert(postDraftTags).values(tagRows.map(({ tagId }: { tagId: string }) => ({ draftId: draft.id, tagId })))
    return draft as typeof postDrafts.$inferSelect
  }

  async unpublish(postId: string, userId: string) {
    const draftId = await this.database.transaction(async (tx) => {
      const draft = await this.ensureForPost(tx, userId, postId)
      const now = new Date(Math.max(Date.now(), Date.parse(draft.updatedAt) + 1)).toISOString()
      await tx.update(posts).set({ published: false, updatedAt: now }).where(eq(posts.id, postId))
      // Invalidate open editors without changing their saved content.
      await tx.update(postDrafts).set({ updatedAt: now }).where(eq(postDrafts.id, draft.id))
      return draft.id
    })
    return draftId
  }
  async create(userId: string, input: DraftInput) {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    await this.database.transaction(async (tx) => {
      await tx.insert(postDrafts).values({
        id,
        postId: null,
        title: input.title,
        content: input.content,
        excerpt: input.excerpt || null,
        authorId: userId,
        categoryId: input.categoryId || null,
        seriesId: input.seriesId || null,
        seriesOrder: input.seriesOrder ?? null,
        readTime: input.readTime ?? calculateReadTime(input.content),
        coverImageUrl: input.coverImageUrl || null,
        aiCoverStatus: input.aiCoverStatus || null,
        createdAt: now,
        updatedAt: now,
      })
      await this.replaceDraftTags(tx, id, input.tags || [])
    })

    return id
  }

  async getOrCreateForPost(userId: string, postId: string) {
    const draft = await this.database.transaction((tx) => this.ensureForPost(tx, userId, postId))
    return this.hydrate(draft)
  }

  async findById(id: string, userId?: string): Promise<DraftDocument | null> {
    const conditions = [eq(postDrafts.id, id)]
    if (userId) conditions.push(eq(postDrafts.authorId, userId))
    const [draft] = await this.database
      .select()
      .from(postDrafts)
      .where(and(...conditions))
      .limit(1)
    return draft ? this.hydrate(draft) : null
  }

  async findByPostId(postId: string, userId?: string): Promise<DraftDocument | null> {
    const conditions = [eq(postDrafts.postId, postId)]
    if (userId) conditions.push(eq(postDrafts.authorId, userId))
    const [draft] = await this.database
      .select()
      .from(postDrafts)
      .where(and(...conditions))
      .limit(1)
    return draft ? this.hydrate(draft) : null
  }

  async listForAuthor(userId: string, options?: { search?: string; page?: number; limit?: number }) {
    const page = Math.max(1, options?.page || 1)
    const limit = Math.min(100, Math.max(1, options?.limit || 50))
    const conditions = [eq(postDrafts.authorId, userId)]
    const search = options?.search?.trim()
    if (search) {
      const match = or(
        ilike(postDrafts.title, `%${search}%`),
        ilike(postDrafts.excerpt, `%${search}%`),
      )
      if (match) conditions.push(match)
    }
    const where = and(...conditions)
    const [count, rows] = await Promise.all([
      this.database.select({ count: sql<number>`count(*)` }).from(postDrafts).where(where),
      this.database.select().from(postDrafts).where(where).orderBy(desc(postDrafts.updatedAt)).limit(limit).offset((page - 1) * limit),
    ])
    const hydrated = await Promise.all(rows.map((row) => this.hydrate(row)))
    const total = Number(count[0]?.count || 0)
    const totalPages = Math.max(1, Math.ceil(total / limit))
    return {
      data: hydrated,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  }

  async update(id: string, userId: string, input: Partial<DraftInput>, expectedUpdatedAt?: string) {
    const values: Record<string, unknown> = { updatedAt: new Date().toISOString() }
    if (input.title !== undefined) values.title = input.title
    if (input.content !== undefined) {
      values.content = input.content
      values.readTime = input.readTime ?? calculateReadTime(input.content)
    } else if (input.readTime !== undefined) values.readTime = input.readTime
    if (input.excerpt !== undefined) values.excerpt = input.excerpt || null
    if (input.categoryId !== undefined) values.categoryId = input.categoryId || null
    if (input.seriesId !== undefined) values.seriesId = input.seriesId || null
    if (input.seriesOrder !== undefined) values.seriesOrder = input.seriesOrder
    if (input.coverImageUrl !== undefined) values.coverImageUrl = input.coverImageUrl
    if (input.aiCoverStatus !== undefined) values.aiCoverStatus = input.aiCoverStatus

    return this.database.transaction(async (tx) => {
      const existing = await this.lockDraft(tx, id, userId, expectedUpdatedAt)
      const updatedAt = new Date(Math.max(Date.now(), Date.parse(existing.updatedAt) + 1)).toISOString()
      await tx.update(postDrafts).set({ ...values, updatedAt }).where(eq(postDrafts.id, id))
      if (input.tags !== undefined) await this.replaceDraftTags(tx, id, input.tags)
      return updatedAt
    })
  }

  async delete(id: string, userId: string, expectedUpdatedAt?: string) {
    await this.database.transaction(async (tx) => {
      const draft = await this.lockDraft(tx, id, userId, expectedUpdatedAt)
      if (draft.postId) {
        const [post] = await tx.select().from(posts).where(eq(posts.id, draft.postId))
        if (!post.published) throw new Error('待发布文章的草稿不能单独删除，请删除整篇待发布文章')
      }
      await tx.delete(postDrafts).where(eq(postDrafts.id, id))
    })
  }

  async deletePendingArticle(id: string, userId: string, expectedUpdatedAt: string) {
    return this.database.transaction(async (tx) => {
      const draft = await this.lockDraft(tx, id, userId, expectedUpdatedAt)
      if (!draft.postId) throw new Error('这不是撤回的文章')
      const [post] = await tx.select().from(posts).where(eq(posts.id, draft.postId))
      if (post.published) throw new Error('文章已经重新发布，请刷新后重试')
      await tx.delete(posts).where(eq(posts.id, draft.postId))
      return draft.postId
    })
  }

  async publish(id: string, userId: string, expectedUpdatedAt?: string) {
    return this.database.transaction(async (tx) => {
      const draft = await this.lockDraft(tx, id, userId, expectedUpdatedAt)
      if (!draft.title.trim() || !draft.content.trim()) throw new Error('标题和正文不能为空')
      const postId = draft.postId || draft.id
      const now = new Date().toISOString()
      const draftTags = await tx.select({ tagId: postDraftTags.tagId }).from(postDraftTags).where(eq(postDraftTags.draftId, id))
      if (draft.postId) {
        await tx
          .update(posts)
          .set({
            title: draft.title,
            content: draft.content,
            excerpt: draft.excerpt,
            categoryId: draft.categoryId,
            seriesId: draft.seriesId,
            seriesOrder: draft.seriesOrder,
            readTime: draft.readTime,
            coverImageUrl: draft.coverImageUrl,
            aiCoverStatus: draft.aiCoverStatus,
            aiCoverGeneratedAt: draft.aiCoverGeneratedAt,
            aiCoverPrompt: draft.aiCoverPrompt,
            published: true,
            publishedDate: sql`coalesce(${posts.publishedDate}, ${now})`,
            updatedAt: now,
          })
          .where(and(eq(posts.id, draft.postId), eq(posts.authorId, userId)))
        await tx.delete(postTags).where(eq(postTags.postId, draft.postId))
      } else {
        await tx.insert(posts).values({
          id: postId,
          title: draft.title,
          content: draft.content,
          excerpt: draft.excerpt,
          published: true,
          authorId: draft.authorId,
          categoryId: draft.categoryId,
          seriesId: draft.seriesId,
          seriesOrder: draft.seriesOrder,
          readTime: draft.readTime,
          publishedDate: now,
          coverImageUrl: draft.coverImageUrl,
          aiCoverStatus: draft.aiCoverStatus,
          aiCoverGeneratedAt: draft.aiCoverGeneratedAt,
          aiCoverPrompt: draft.aiCoverPrompt,
          createdAt: draft.createdAt,
          updatedAt: now,
        })
      }

      if (draftTags.length) {
        await tx.insert(postTags).values(draftTags.map(({ tagId }) => ({ postId, tagId })))
      }
      await tx.delete(postDrafts).where(eq(postDrafts.id, id))
      return postId
    })
  }

  private async replaceDraftTags(tx: any, draftId: string, tagNames: string[]) {
    await tx.delete(postDraftTags).where(eq(postDraftTags.draftId, draftId))
    const tagIds = await ensureTagIds(tx, tagNames)
    if (tagIds.length) {
      await tx.insert(postDraftTags).values(tagIds.map((tagId) => ({ draftId, tagId })))
    }
  }

  private async hydrate(draft: typeof postDrafts.$inferSelect): Promise<DraftDocument> {
    const [category, seriesValue, tagRows, parent] = await Promise.all([
      draft.categoryId
        ? this.database.select({ id: categories.id, name: categories.name, slug: categories.slug }).from(categories).where(eq(categories.id, draft.categoryId)).limit(1)
        : Promise.resolve([]),
      draft.seriesId
        ? this.database.select({ id: series.id, name: series.name, slug: series.slug }).from(series).where(eq(series.id, draft.seriesId)).limit(1)
        : Promise.resolve([]),
      this.database
        .select({ id: tags.id, name: tags.name, slug: tags.slug })
        .from(postDraftTags)
        .innerJoin(tags, eq(postDraftTags.tagId, tags.id))
        .where(eq(postDraftTags.draftId, draft.id)),
      draft.postId ? this.database.select({ published: posts.published }).from(posts).where(eq(posts.id, draft.postId)).limit(1) : Promise.resolve([]),
    ])

    return { ...draft, postPublished: parent[0]?.published ?? false, category: category[0] || null, series: seriesValue[0] || null, tags: tagRows }
  }
}
