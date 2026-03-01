import { db } from '../index'
import { posts, categories, tags, postTags, users } from '../schema'
import { eq, desc } from 'drizzle-orm'
import type { Post, Tag } from '@/lib/types'

/**
 * 获取所有已发布的文章列表
 * @param categoryId 可选的分类 ID 筛选
 * @param tagId 可选的标签 ID 筛选
 * @returns 已发布的文章列表
 */
export async function getPublishedPosts(categoryId?: string, tagId?: string): Promise<Post[]> {
  let query = db
    .select({
      id: posts.id,
      title: posts.title,
      excerpt: posts.excerpt,
      content: posts.content,
      date: posts.publishedDate,
      readTime: posts.readTime,
      categoryId: posts.categoryId,
      authorId: posts.authorId,
      publishedDate: posts.publishedDate,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.publishedDate))

  const result = await query

  // 获取所有分类
  const allCategories = await db.select().from(categories)
  const categoryMap = new Map(allCategories.map(c => [c.id, c]))

  // 获取所有文章的标签
  const postTagRelations = await db
    .select({
      postId: postTags.postId,
      tagId: postTags.tagId,
    })
    .from(postTags)

  const allTags = await db.select().from(tags)
  const tagMap = new Map(allTags.map(t => [t.id, t]))

  // 构建文章 ID 到标签的映射
  const postTagsMap = new Map<string, string[]>()
  for (const relation of postTagRelations) {
    if (!postTagsMap.has(relation.postId)) {
      postTagsMap.set(relation.postId, [])
    }
    const tag = tagMap.get(relation.tagId)
    if (tag) {
      postTagsMap.get(relation.postId)!.push(tag.name)
    }
  }

  // 转换为 Post 类型
  return result
    .filter(post => {
      // 分类筛选
      if (categoryId && post.categoryId !== categoryId) return false
      // 标签筛选
      if (tagId) {
        const postTagIds = postTagRelations
          .filter(pt => pt.postId === post.id)
          .map(pt => pt.tagId)
        if (!postTagIds.includes(tagId)) return false
      }
      return true
    })
    .map(post => {
      const category = post.categoryId ? categoryMap.get(post.categoryId) : null
      return {
        id: post.id,
        title: post.title,
        excerpt: post.excerpt || '',
        content: post.content,
        date: post.publishedDate || post.createdAt,
        readTime: post.readTime,
        category: category?.name || 'Uncategorized',
        tags: postTagsMap.get(post.id) || [],
        // Database fields
        categoryId: post.categoryId,
        publishedDate: post.publishedDate,
        published: true,
        authorId: post.authorId,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        categoryObj: category,
      }
    })
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

  // 获取标签
  const tagRelations = await db
    .select({
      tagId: postTags.tagId,
    })
    .from(postTags)
    .where(eq(postTags.postId, post.id))

  const tagIds = tagRelations.map(tr => tr.tagId)
  const tagList = tagIds.length > 0
    ? await db.select().from(tags).where(eq(tags.id, tagIds[0])) // 简化处理，实际需要 in 查询
    : []

  // 获取所有匹配的标签
  const allTags: Tag[] = []
  for (const tid of tagIds) {
    const t = await db.select().from(tags).where(eq(tags.id, tid)).limit(1)
    if (t.length > 0) {
      allTags.push({
        id: t[0].id,
        name: t[0].name,
        slug: t[0].slug,
        createdAt: t[0].createdAt || '',
        updatedAt: t[0].updatedAt || '',
      })
    }
  }

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
    publishedDate: post.publishedDate,
    published: post.published,
    authorId: post.authorId,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    categoryObj: category?.[0] || null,
    tagObjs: allTags,
  }
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
 * 根据文章 ID 更新 AI 摘要
 * @param postId 文章 ID
 * @param data 更新数据
 */
export async function updatePostAISummary(
  postId: string,
  data: {
    aiSummary?: string
    aiSummaryGeneratedAt?: string
    aiSummaryStatus?: string
  }
) {
  await db
    .update(posts)
    .set(data)
    .where(eq(posts.id, postId))
}

/**
 * 检查文章是否可以编辑或发布
 * @param postId 文章 ID
 * @returns 是否可以编辑（如果正在生成摘要则返回 false）
 */
export async function canEditPost(postId: string): Promise<boolean> {
  const post = await db
    .select({ aiSummaryStatus: posts.aiSummaryStatus })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1)

  if (post.length === 0) {
    return true
  }

  // 如果正在生成摘要，不允许编辑
  return post[0].aiSummaryStatus !== 'generating'
}

