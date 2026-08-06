import { and, asc, eq, sql } from 'drizzle-orm'

import { generateSlug } from '@/lib/utils/slug'
import { db } from '@/server/db'
import { posts, series } from '@/server/db/schema'

export class SeriesRepository {
  async list(userId?: string, publishedOnly = false) {
    const conditions: any[] = []
    if (userId) conditions.push(eq(series.authorId, userId))
    if (publishedOnly) conditions.push(eq(posts.published, true))

    return db
      .select({
        id: series.id,
        name: series.name,
        slug: series.slug,
        description: series.description,
        authorId: series.authorId,
        createdAt: series.createdAt,
        updatedAt: series.updatedAt,
        postCount: sql<number>`count(${posts.id})`,
      })
      .from(series)
      .leftJoin(posts, eq(posts.seriesId, series.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .groupBy(series.id)
      .orderBy(asc(series.name))
  }

  async findBySlug(slug: string) {
    const [value] = await db.select().from(series).where(eq(series.slug, slug)).limit(1)
    if (!value) return null

    const seriesPosts = await db
      .select()
      .from(posts)
      .where(and(eq(posts.seriesId, value.id), eq(posts.published, true)))
      .orderBy(asc(posts.seriesOrder), asc(posts.publishedDate), asc(posts.createdAt))

    return { ...value, posts: seriesPosts }
  }

  async create(userId: string, input: { name: string; slug?: string; description?: string }) {
    const name = input.name.trim()
    const slug = generateSlug(input.slug?.trim() || name)
    if (!name) throw new Error('专题名称不能为空')
    if (!slug) throw new Error('无法生成有效的专题 slug')
    const now = new Date().toISOString()
    const [created] = await db
      .insert(series)
      .values({
        id: crypto.randomUUID(),
        name,
        slug,
        description: input.description?.trim() || null,
        authorId: userId,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
    return created
  }

  async update(userId: string, id: string, input: { name: string; slug?: string; description?: string }) {
    const name = input.name.trim()
    const slug = generateSlug(input.slug?.trim() || name)
    if (!name || !slug) throw new Error('专题名称和 slug 不能为空')
    const [updated] = await db
      .update(series)
      .set({ name, slug, description: input.description?.trim() || null, updatedAt: new Date().toISOString() })
      .where(and(eq(series.id, id), eq(series.authorId, userId)))
      .returning()
    if (!updated) throw new Error('专题不存在或无权修改')
    return updated
  }

  async delete(userId: string, id: string) {
    const [deleted] = await db
      .delete(series)
      .where(and(eq(series.id, id), eq(series.authorId, userId)))
      .returning({ id: series.id })
    if (!deleted) throw new Error('专题不存在或无权删除')
  }
}
