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

function databaseCode(error: unknown) {
  const value = error as { code?: string; cause?: { code?: string } }
  return value.code || value.cause?.code
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
  async create(userId: string, input: DraftInput) {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    await db.transaction(async (tx) => {
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
    const existing = await this.findByPostId(postId, userId)
    if (existing) return existing

    const [post] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, postId), eq(posts.authorId, userId)))
      .limit(1)
    if (!post) throw new Error('文章不存在或无权编辑')

    const tagRows = await db
      .select({ tagId: postTags.tagId })
      .from(postTags)
      .where(eq(postTags.postId, postId))
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    try {
      await db.transaction(async (tx) => {
        await tx.insert(postDrafts).values({
          id,
          postId,
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          authorId: post.authorId,
          categoryId: post.categoryId,
          seriesId: post.seriesId,
          seriesOrder: post.seriesOrder,
          readTime: post.readTime,
          coverImageUrl: post.coverImageUrl,
          aiCoverStatus: post.aiCoverStatus,
          aiCoverGeneratedAt: post.aiCoverGeneratedAt,
          aiCoverPrompt: post.aiCoverPrompt,
          createdAt: now,
          updatedAt: now,
        })
        if (tagRows.length) {
          await tx.insert(postDraftTags).values(
            tagRows.map(({ tagId }) => ({ draftId: id, tagId })),
          )
        }
      })
    } catch (error) {
      if (databaseCode(error) !== '23505') throw error
    }

    const created = await this.findByPostId(postId, userId)
    if (!created) throw new Error('无法创建文章修订草稿')
    return created
  }

  async findById(id: string, userId?: string): Promise<DraftDocument | null> {
    const conditions = [eq(postDrafts.id, id)]
    if (userId) conditions.push(eq(postDrafts.authorId, userId))
    const [draft] = await db
      .select()
      .from(postDrafts)
      .where(and(...conditions))
      .limit(1)
    return draft ? this.hydrate(draft) : null
  }

  async findByPostId(postId: string, userId?: string): Promise<DraftDocument | null> {
    const conditions = [eq(postDrafts.postId, postId)]
    if (userId) conditions.push(eq(postDrafts.authorId, userId))
    const [draft] = await db
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
      db.select({ count: sql<number>`count(*)` }).from(postDrafts).where(where),
      db.select().from(postDrafts).where(where).orderBy(desc(postDrafts.updatedAt)).limit(limit).offset((page - 1) * limit),
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

  async update(id: string, userId: string, input: Partial<DraftInput>) {
    const existing = await this.findById(id, userId)
    if (!existing) throw new Error('草稿不存在或无权编辑')
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

    await db.transaction(async (tx) => {
      await tx.update(postDrafts).set(values).where(eq(postDrafts.id, id))
      if (input.tags !== undefined) await this.replaceDraftTags(tx, id, input.tags)
    })
  }

  async delete(id: string, userId: string) {
    const result = await db
      .delete(postDrafts)
      .where(and(eq(postDrafts.id, id), eq(postDrafts.authorId, userId)))
      .returning({ id: postDrafts.id })
    if (!result.length) throw new Error('草稿不存在或无权删除')
  }

  async publish(id: string, userId: string) {
    const draft = await this.findById(id, userId)
    if (!draft) throw new Error('草稿不存在或无权发布')
    if (!draft.title.trim() || !draft.content.trim()) throw new Error('标题和正文不能为空')
    const postId = draft.postId || draft.id
    const now = new Date().toISOString()

    await db.transaction(async (tx) => {
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

      if (draft.tags.length) {
        await tx.insert(postTags).values(
          draft.tags.map((tag) => ({ postId, tagId: tag.id })),
        )
      }
      await tx.delete(postDrafts).where(eq(postDrafts.id, id))
    })

    return postId
  }

  private async replaceDraftTags(tx: any, draftId: string, tagNames: string[]) {
    await tx.delete(postDraftTags).where(eq(postDraftTags.draftId, draftId))
    const tagIds = await ensureTagIds(tx, tagNames)
    if (tagIds.length) {
      await tx.insert(postDraftTags).values(tagIds.map((tagId) => ({ draftId, tagId })))
    }
  }

  private async hydrate(draft: typeof postDrafts.$inferSelect): Promise<DraftDocument> {
    const [category, seriesValue, tagRows] = await Promise.all([
      draft.categoryId
        ? db.select({ id: categories.id, name: categories.name, slug: categories.slug }).from(categories).where(eq(categories.id, draft.categoryId)).limit(1)
        : Promise.resolve([]),
      draft.seriesId
        ? db.select({ id: series.id, name: series.name, slug: series.slug }).from(series).where(eq(series.id, draft.seriesId)).limit(1)
        : Promise.resolve([]),
      db
        .select({ id: tags.id, name: tags.name, slug: tags.slug })
        .from(postDraftTags)
        .innerJoin(tags, eq(postDraftTags.tagId, tags.id))
        .where(eq(postDraftTags.draftId, draft.id)),
    ])

    return { ...draft, category: category[0] || null, series: seriesValue[0] || null, tags: tagRows }
  }
}
