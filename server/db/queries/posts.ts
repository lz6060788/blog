import { db } from '../index'
import { posts, categories, tags, postTags, users, aiCallLogs, series } from '../schema'
import { eq, desc, sql, and, inArray, or } from 'drizzle-orm'
import type { Post, PostSummary, SearchResult, Tag } from '@/lib/types'
import { unstable_cache } from 'next/cache'

function parsePostDate(value?: string | null): number {
  if (!value) return 0
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? 0 : timestamp
}

/**
 * 获取所有已发布的文章列表
 * @param categoryId 可选的分类 ID 筛选
 * @param tagId 可选的标签 ID 筛选
 * @returns 已发布的文章列表
 */
async function loadPublishedPosts(): Promise<PostSummary[]> {
  let query = db
    .select({
      id: posts.id,
      title: posts.title,
      excerpt: posts.excerpt,
      date: posts.publishedDate,
      readTime: posts.readTime,
      categoryId: posts.categoryId,
      seriesId: posts.seriesId,
      seriesOrder: posts.seriesOrder,
      authorId: posts.authorId,
      publishedDate: posts.publishedDate,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      coverImageUrl: posts.coverImageUrl,
    })
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.publishedDate))

  const result = await query

  // 并行获取列表页需要的关联信息
  const [allCategories, allSeries, postTagRelations, allTags] = await Promise.all([
    db.select().from(categories),
    db.select().from(series),
    db
      .select({
        postId: postTags.postId,
        tagId: postTags.tagId,
      })
      .from(postTags),
    db.select().from(tags),
  ])
  const categoryMap = new Map(allCategories.map(c => [c.id, c]))
  const seriesMap = new Map(allSeries.map(item => [item.id, item]))
  const tagMap = new Map(allTags.map(t => [t.id, t]))

  // 构建文章 ID 到标签的映射
  const postTagsMap = new Map<string, string[]>()
  const postTagObjectsMap = new Map<string, Tag[]>()
  for (const relation of postTagRelations) {
    if (!postTagsMap.has(relation.postId)) {
      postTagsMap.set(relation.postId, [])
    }
    const tag = tagMap.get(relation.tagId)
    if (tag) {
      postTagsMap.get(relation.postId)!.push(tag.name)
      if (!postTagObjectsMap.has(relation.postId)) {
        postTagObjectsMap.set(relation.postId, [])
      }
      postTagObjectsMap.get(relation.postId)!.push(tag)
    }
  }

  // 转换为公开列表类型。数据库字段是 text，最终再按真实时间值稳定排序，
  // 避免不同 ISO 格式的字符串排序让新文章落到旧文章之后。
  return result
    .map<PostSummary>(post => {
      const category = post.categoryId ? categoryMap.get(post.categoryId) : null
      const seriesValue = post.seriesId ? seriesMap.get(post.seriesId) : null
      return {
        id: post.id,
        title: post.title,
        excerpt: post.excerpt || '',
        date: post.publishedDate || post.createdAt,
        readTime: post.readTime,
        category: category?.name || 'Uncategorized',
        tags: postTagsMap.get(post.id) || [],
        // Database fields
        categoryId: post.categoryId,
        seriesId: post.seriesId,
        seriesOrder: post.seriesOrder,
        publishedDate: post.publishedDate,
        published: true,
        authorId: post.authorId,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        categoryObj: category,
        seriesObj: seriesValue,
        tagObjs: postTagObjectsMap.get(post.id) || [],
        coverImageUrl: post.coverImageUrl,
      }
    })
    .sort((a, b) => {
      const publishedDifference = parsePostDate(b.date) - parsePostDate(a.date)
      if (publishedDifference !== 0) return publishedDifference

      const createdDifference = parsePostDate(b.createdAt) - parsePostDate(a.createdAt)
      if (createdDifference !== 0) return createdDifference

      return a.id.localeCompare(b.id)
    })
}

const getCachedPublishedPosts = unstable_cache(
  loadPublishedPosts,
  ['published-post-summaries-v2'],
  { revalidate: 300, tags: ['public-posts'] },
)

export async function getPublishedPosts(categoryId?: string, tagId?: string): Promise<PostSummary[]> {
  const publishedPosts = await getCachedPublishedPosts()

  return publishedPosts.filter(post => {
    if (categoryId && post.categoryId !== categoryId) return false
    if (tagId && !post.tagObjs?.some(tag => tag.id === tagId)) return false
    return true
  })
}

function normalizeSearchText(value: string): string {
  return value.toLocaleLowerCase().normalize('NFKC')
}

function createSearchSnippet(value: string, normalizedQuery: string): string {
  const plainText = value.replace(/\s+/g, ' ').trim()
  if (!plainText) return ''

  const normalizedText = normalizeSearchText(plainText)
  const matchIndex = normalizedText.indexOf(normalizedQuery)
  const start = matchIndex > 70 ? matchIndex - 55 : 0
  const end = Math.min(plainText.length, start + 170)
  return `${start > 0 ? '…' : ''}${plainText.slice(start, end).trim()}${end < plainText.length ? '…' : ''}`
}

/**
 * 在缓存的公开文章摘要中搜索。缓存由内容变更动作主动失效，不需要维护
 * 独立索引，也不会在每次输入时重复读取全部文章正文。
 */
export async function searchPublishedPosts(query: string, limit = 8): Promise<SearchResult[]> {
  const normalizedQuery = normalizeSearchText(query.trim())
  if (!normalizedQuery) return []

  const publishedRows = await getPublishedPosts()

  return publishedRows
    .map(row => {
      const title = normalizeSearchText(row.title)
      const excerpt = normalizeSearchText(row.excerpt)
      const category = normalizeSearchText(row.category)
      const normalizedTags = row.tags.map(tag => normalizeSearchText(tag))

      let score = 0
      if (title.startsWith(normalizedQuery)) score += 120
      else if (title.includes(normalizedQuery)) score += 100
      if (category === normalizedQuery) score += 80
      else if (category.includes(normalizedQuery)) score += 60
      if (normalizedTags.some(tag => tag === normalizedQuery)) score += 70
      else if (normalizedTags.some(tag => tag.includes(normalizedQuery))) score += 50
      if (excerpt.includes(normalizedQuery)) score += 30

      return {
        score,
        timestamp: parsePostDate(row.date),
        result: {
          id: row.id,
          title: row.title,
          excerpt: row.excerpt,
          snippet: createSearchSnippet(row.excerpt, normalizedQuery),
          date: row.date,
          readTime: row.readTime,
          category: row.category,
          categorySlug: row.categoryObj?.slug,
          tags: row.tags,
        } satisfies SearchResult,
      }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || b.timestamp - a.timestamp)
    .slice(0, Math.max(1, Math.min(limit, 20)))
    .map(item => item.result)
}

/**
 * 服务端数据获取函数：根据 ID 获取文章
 * @param id 文章 ID
 * @returns 文章对象，如果不存在则返回 null
 */
export async function getPost(id: string): Promise<Post | null> {
  const result = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  const post = result[0]

  // 只返回已发布的文章
  if (!post.published) {
    return null
  }

  // 获取分类
  const category = post.categoryId
    ? await db.select().from(categories).where(eq(categories.id, post.categoryId)).limit(1)
    : null
  const seriesValue = post.seriesId
    ? await db.select().from(series).where(eq(series.id, post.seriesId)).limit(1)
    : null

  // 获取标签
  const tagRelations = await db
    .select({
      tagId: postTags.tagId,
    })
    .from(postTags)
    .where(eq(postTags.postId, post.id))

  const tagIds = tagRelations.map(tr => tr.tagId)
  const tagRows = tagIds.length > 0
    ? await db.select().from(tags).where(inArray(tags.id, tagIds))
    : []
  const allTags: Tag[] = tagRows.map(tag => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    createdAt: tag.createdAt || '',
    updatedAt: tag.updatedAt || '',
  }))

  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt || '',
    content: post.content,
    date: post.publishedDate || post.createdAt,
    readTime: post.readTime,
    category: category?.[0]?.name || 'Uncategorized',
    tags: allTags.map(t => t.name),
    // Database fields
    categoryId: post.categoryId,
    seriesId: post.seriesId,
    seriesOrder: post.seriesOrder,
    publishedDate: post.publishedDate,
    published: post.published,
    authorId: post.authorId,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    categoryObj: category?.[0] || null,
    seriesObj: seriesValue?.[0] || null,
    tagObjs: allTags,
    // Cover image
    coverImageUrl: post.coverImageUrl,
  }
}

export async function getPublishedSeries() {
  return db
    .select({
      id: series.id,
      name: series.name,
      slug: series.slug,
      description: series.description,
      createdAt: series.createdAt,
      updatedAt: series.updatedAt,
      postCount: sql<number>`count(${posts.id})`,
    })
    .from(series)
    .innerJoin(posts, and(eq(posts.seriesId, series.id), eq(posts.published, true)))
    .groupBy(series.id)
    .orderBy(series.name)
}

export async function getPublishedSeriesBySlug(slug: string) {
  const [value] = await db.select().from(series).where(eq(series.slug, slug)).limit(1)
  if (!value) return null
  const publishedPosts = await getPublishedPosts()
  const seriesPosts = publishedPosts
    .filter((post) => post.seriesId === value.id)
    .sort((a, b) => (a.seriesOrder ?? Number.MAX_SAFE_INTEGER) - (b.seriesOrder ?? Number.MAX_SAFE_INTEGER))
  return seriesPosts.length ? { ...value, posts: seriesPosts } : null
}

/**
 * 获取所有已发布文章的 ID 列表（用于 SSG）
 * @returns 所有已发布文章的 ID 列表
 */
export async function getAllPublishedPostIds(): Promise<string[]> {
  const result = await db
    .select({
      id: posts.id,
    })
    .from(posts)
    .where(eq(posts.published, true))

  return result.map(p => p.id)
}

// 保留旧的函数名以兼容性
export async function getAllPostIds(): Promise<string[]> {
  return getAllPublishedPostIds()
}

/**
 * 获取 AI 摘要统计数据
 * @returns AI 摘要统计
 */
export async function getAISummaryStats() {
  const result = await db
    .select({
      total: sql<number>`count(*)`,
      generated: sql<number>`sum(CASE WHEN ai_summary_status = 'done' THEN 1 ELSE 0 END)`,
      pending: sql<number>`sum(CASE WHEN ai_summary_status = 'generating' THEN 1 ELSE 0 END)`,
      failed: sql<number>`sum(CASE WHEN ai_summary_status = 'failed' THEN 1 ELSE 0 END)`,
    })
    .from(posts)

  return {
    aiGeneratedPosts: result[0].generated || 0,
    aiPendingPosts: result[0].pending || 0,
    aiFailedPosts: result[0].failed || 0,
  }
}

/**
 * 检查文章是否可以编辑或发布
 * @param postId 文章 ID
 * @returns 是否可以编辑（如果正在生成摘要则返回 false）
 */
export async function canEditPost(postId: string): Promise<boolean> {
  // 通过查询 ai_call_logs 判断是否正在生成摘要
  const summaryLogs = await db
    .select({ status: aiCallLogs.status })
    .from(aiCallLogs)
    .where(
      and(
        or(eq(aiCallLogs.postId, postId), eq(aiCallLogs.draftId, postId)),
        eq(aiCallLogs.action, 'generate-summary')
      )
    )
    .orderBy(desc(aiCallLogs.createdAt))
    .limit(1)

  if (summaryLogs.length === 0) {
    return true
  }

  // 如果正在重试（生成中），不允许编辑
  return summaryLogs[0].status !== 'retrying'
}

