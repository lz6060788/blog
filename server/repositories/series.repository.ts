import { and, asc, desc, eq, inArray, or, sql } from 'drizzle-orm'

import { generateSlug } from '@/lib/utils/slug'
import { db } from '@/server/db'
import { categories, postDrafts, posts, series } from '@/server/db/schema'

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
        postCount: sql<number>`count(${posts.id}) filter (where ${posts.published} = true)`,
      })
      .from(series)
      .leftJoin(posts, eq(posts.seriesId, series.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .groupBy(series.id)
      .orderBy(asc(series.name))
  }

  async getManagementData(userId: string) {
    const [seriesValues, postValues] = await Promise.all([
      this.list(userId),
      db
        .select({
          id: posts.id,
          title: posts.title,
          excerpt: posts.excerpt,
          coverImageUrl: posts.coverImageUrl,
          publishedDate: posts.publishedDate,
          categoryName: categories.name,
          seriesId: posts.seriesId,
          seriesOrder: posts.seriesOrder,
          seriesName: series.name,
        })
        .from(posts)
        .leftJoin(categories, eq(posts.categoryId, categories.id))
        .leftJoin(series, eq(posts.seriesId, series.id))
        .where(and(eq(posts.authorId, userId), eq(posts.published, true)))
        .orderBy(desc(posts.publishedDate), desc(posts.createdAt)),
    ])

    return {
      series: seriesValues,
      posts: postValues,
    }
  }

  async replacePosts(userId: string, seriesId: string, orderedPostIds: string[]) {
    const uniquePostIds = Array.from(new Set(orderedPostIds))
    if (uniquePostIds.length !== orderedPostIds.length) throw new Error('收录列表中存在重复文章')

    const [target] = await db
      .select({ id: series.id, slug: series.slug })
      .from(series)
      .where(and(eq(series.id, seriesId), eq(series.authorId, userId)))
      .limit(1)
    if (!target) throw new Error('专题不存在或无权修改')

    const selectedPosts = uniquePostIds.length
      ? await db
          .select({ id: posts.id, seriesId: posts.seriesId })
          .from(posts)
          .where(and(
            eq(posts.authorId, userId),
            eq(posts.published, true),
            inArray(posts.id, uniquePostIds),
          ))
      : []
    if (selectedPosts.length !== uniquePostIds.length) throw new Error('部分文章不存在、未发布或无权操作')

    const currentPosts = await db
      .select({ id: posts.id })
      .from(posts)
      .where(and(eq(posts.authorId, userId), eq(posts.seriesId, seriesId)))

    const previousSeriesIds = Array.from(new Set(
      selectedPosts
        .map((post) => post.seriesId)
        .filter((id): id is string => Boolean(id) && id !== seriesId),
    ))
    const touchedPostIds = Array.from(new Set([...currentPosts.map((post) => post.id), ...uniquePostIds]))
    const affectedSeriesIds = Array.from(new Set([seriesId, ...previousSeriesIds]))

    await db.transaction(async (tx) => {
      await tx
        .update(posts)
        .set({ seriesId: null, seriesOrder: null })
        .where(and(eq(posts.authorId, userId), eq(posts.seriesId, seriesId)))

      if (currentPosts.length) {
        await tx
          .update(postDrafts)
          .set({ seriesId: null, seriesOrder: null, updatedAt: new Date().toISOString() })
          .where(and(eq(postDrafts.authorId, userId), inArray(postDrafts.postId, currentPosts.map((post) => post.id))))
      }

      for (let index = 0; index < uniquePostIds.length; index += 1) {
        const postId = uniquePostIds[index]
        const seriesOrder = index + 1
        await tx
          .update(posts)
          .set({ seriesId, seriesOrder, updatedAt: new Date().toISOString() })
          .where(and(eq(posts.id, postId), eq(posts.authorId, userId), eq(posts.published, true)))
        await tx
          .update(postDrafts)
          .set({ seriesId, seriesOrder, updatedAt: new Date().toISOString() })
          .where(and(eq(postDrafts.postId, postId), eq(postDrafts.authorId, userId)))
      }

      for (const previousSeriesId of previousSeriesIds) {
        const remainingPosts = await tx
          .select({ id: posts.id })
          .from(posts)
          .where(and(eq(posts.authorId, userId), eq(posts.seriesId, previousSeriesId)))
          .orderBy(asc(posts.seriesOrder), asc(posts.publishedDate), asc(posts.createdAt))

        for (let index = 0; index < remainingPosts.length; index += 1) {
          const post = remainingPosts[index]
          const seriesOrder = index + 1
          await tx.update(posts).set({ seriesOrder }).where(eq(posts.id, post.id))
          await tx
            .update(postDrafts)
            .set({ seriesOrder, updatedAt: new Date().toISOString() })
            .where(and(eq(postDrafts.postId, post.id), eq(postDrafts.authorId, userId)))
        }
      }

      if (affectedSeriesIds.length) {
        await tx
          .update(series)
          .set({ updatedAt: new Date().toISOString() })
          .where(and(eq(series.authorId, userId), inArray(series.id, affectedSeriesIds)))
      }
    })

    const affectedSeries = await db
      .select({ slug: series.slug })
      .from(series)
      .where(and(eq(series.authorId, userId), or(...affectedSeriesIds.map((id) => eq(series.id, id)))))

    return {
      postIds: touchedPostIds,
      seriesSlugs: affectedSeries.map((value) => value.slug),
    }
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
