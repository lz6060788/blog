'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/server/db'
import { posts, categories, tags, postTags } from '@/server/db/schema'
import { auth } from '@/server/auth'
import { eq } from 'drizzle-orm'

// 获取当前用户
async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  // 确保 id 存在
  return {
    ...session.user,
    id: session.user.id as string,
  }
}

// 生成摘要（从内容前 150 字提取）
function generateExcerpt(content: string, maxLength = 150): string {
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

// 生成 slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// 创建文章
export async function createPost(data: {
  title: string
  content: string
  excerpt?: string
  published?: boolean
  categoryId?: string
  tags?: string[]
  readTime?: number
  publishedDate?: string
}) {
  const user = await getCurrentUser()

  const { title, content, excerpt, published = false, categoryId, tags: tagNames, readTime = 0, publishedDate } = data

  if (!title.trim()) {
    throw new Error('标题不能为空')
  }

  if (!content.trim()) {
    throw new Error('内容不能为空')
  }

  const postId = crypto.randomUUID()

  // 如果没有提供摘要，自动生成
  const finalExcerpt = excerpt || generateExcerpt(content)

  const insertData: {
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
  } = {
    id: postId,
    title: title.trim(),
    content: content.trim(),
    published,
    authorId: user.id,
    categoryId: categoryId || null,
    readTime,
    publishedDate: publishedDate || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  // 只在有摘要时添加
  if (finalExcerpt) {
    insertData.excerpt = finalExcerpt
  }

  await db.insert(posts).values(insertData)

  // 处理标签
  if (tagNames && Array.isArray(tagNames) && tagNames.length > 0) {
    for (const tagName of tagNames) {
      if (!tagName || typeof tagName !== 'string') continue

      // 检查标签是否已存在
      const [existingTag] = await db
        .select()
        .from(tags)
        .where(eq(tags.name, tagName.trim()))
        .limit(1)

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

  // 重新验证缓存
  revalidatePath('/admin/posts')
  revalidatePath('/admin/drafts')

  return { success: true, postId }
}

// 更新文章
export async function updatePost(
  id: string,
  data: {
    title?: string
    content?: string
    excerpt?: string
    published?: boolean
    categoryId?: string
    tags?: string[]
    readTime?: number
    publishedDate?: string
  }
) {
  const user = await getCurrentUser()

  // 检查文章是否存在且属于当前用户
  const existingPost = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1)

  if (existingPost.length === 0) {
    throw new Error('文章不存在')
  }

  const post = existingPost[0]
  if (post.authorId !== user.id) {
    throw new Error('无权修改此文章')
  }

  const { title, content, excerpt, published, categoryId, tags: tagNames, readTime, publishedDate } = data

  // 构建更新数据
  const updateData: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  }

  if (title !== undefined) {
    if (!title.trim()) {
      throw new Error('标题不能为空')
    }
    updateData.title = title.trim()
  }

  if (content !== undefined) {
    if (!content.trim()) {
      throw new Error('内容不能为空')
    }
    updateData.content = content.trim()
    // 如果更新了内容但没有提供摘要，重新生成摘要
    if (excerpt === undefined) {
      updateData.excerpt = generateExcerpt(content)
    }
  }

  if (excerpt !== undefined) {
    updateData.excerpt = excerpt
  }

  if (published !== undefined) {
    updateData.published = published
  }

  if (categoryId !== undefined) {
    updateData.categoryId = categoryId
  }

  if (readTime !== undefined) {
    updateData.readTime = readTime
  }

  if (publishedDate !== undefined) {
    updateData.publishedDate = publishedDate
  }

  await db
    .update(posts)
    .set(updateData)
    .where(eq(posts.id, id))

  // 处理标签（增量更新）
  if (tagNames !== undefined) {
    // 删除现有的标签关联
    await db.delete(postTags).where(eq(postTags.postId, id))

    // 添加新的标签关联
    if (Array.isArray(tagNames) && tagNames.length > 0) {
      for (const tagName of tagNames) {
        if (!tagName || typeof tagName !== 'string') continue

        // 检查标签是否已存在
        const [existingTag] = await db
          .select()
          .from(tags)
          .where(eq(tags.name, tagName.trim()))
          .limit(1)

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
          postId: id,
          tagId,
        })
      }
    }
  }

  // 重新验证缓存
  revalidatePath('/admin/posts')
  revalidatePath('/admin/drafts')
  revalidatePath(`/admin/posts/${id}/edit`)

  return { success: true }
}

// 删除文章
export async function deletePost(id: string) {
  const user = await getCurrentUser()

  // 检查文章是否存在且属于当前用户
  const existingPost = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1)

  if (existingPost.length === 0) {
    throw new Error('文章不存在')
  }

  const post = existingPost[0]
  if (post.authorId !== user.id) {
    throw new Error('无权删除此文章')
  }

  await db.delete(posts).where(eq(posts.id, id))

  // 重新验证缓存
  revalidatePath('/admin/posts')
  revalidatePath('/admin/drafts')

  return { success: true }
}

// 切换文章发布状态
export async function togglePostStatus(id: string) {
  const user = await getCurrentUser()

  // 检查文章是否存在且属于当前用户
  const existingPost = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1)

  if (existingPost.length === 0) {
    throw new Error('文章不存在')
  }

  const post = existingPost[0]
  if (post.authorId !== user.id) {
    throw new Error('无权修改此文章')
  }

  const newStatus = !post.published

  await db
    .update(posts)
    .set({
      published: newStatus,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(posts.id, id))

  // 重新验证缓存
  revalidatePath('/admin/posts')
  revalidatePath('/admin/drafts')

  return { success: true, published: newStatus }
}

// 获取单篇文章
export async function getPost(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const result = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  const post = result[0]
  // 检查权限
  if (post.authorId !== session.user.id) {
    throw new Error('无权访问此文章')
  }

  // 获取文章的标签
  const postTagsList = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
    })
    .from(postTags)
    .leftJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, id))

  return {
    ...post,
    tags: postTagsList.map(t => t.name),
  }
}

// 获取所有分类（用于表单选择）
export async function getCategoriesForSelect() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  return await db.select().from(categories).orderBy(categories.name)
}

// 获取所有标签（用于表单选择）
export async function getTagsForSelect() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  return await db.select().from(tags).orderBy(tags.name)
}

// 获取所有文章（支持分页、搜索、筛选）
export async function getPosts(options?: {
  publishedOnly?: boolean
  draftsOnly?: boolean
  search?: string
  page?: number
  pageSize?: number
}) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const page = options?.page || 1
  const pageSize = options?.pageSize || 20
  const offset = (page - 1) * pageSize

  // 使用 sql 模块来构建复杂查询
  const { sql } = require('drizzle-orm')

  let whereConditions = [sql`${posts.authorId} = ${session.user.id}`]

  // 如果需要筛选
  if (options?.publishedOnly) {
    whereConditions.push(sql`${posts.published} = 1`)
  } else if (options?.draftsOnly) {
    whereConditions.push(sql`${posts.published} = 0`)
  }

  // 搜索功能
  if (options?.search && options.search.trim()) {
    whereConditions.push(sql`${posts.title} LIKE ${'%' + options.search.trim() + '%'}`)
  }

  // 组合 WHERE 条件
  const whereClause = whereConditions.length > 1
    ? sql.join(whereConditions, sql` AND `)
    : whereConditions[0]

  // 获取总数
  const countResult = await db
    .select({ count: sql`COUNT(*)` })
    .from(posts)
    .where(whereClause)

  const total = Number(countResult[0]?.count || 0)

  // 获取分页数据，包含分类信息和 AI 摘要状态
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
      aiSummary: posts.aiSummary,
      aiSummaryStatus: posts.aiSummaryStatus,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(whereClause)
    .orderBy(posts.createdAt)
    .limit(pageSize)
    .offset(offset)

  // 为每篇文章获取标签和字数
  const data = await Promise.all(
    postsData.map(async (post) => {
      // 获取标签
      const postTagsList = await db
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
        })
        .from(postTags)
        .leftJoin(tags, eq(postTags.tagId, tags.id))
        .where(eq(postTags.postId, post.id))

      // 计算字数（中文字符数）
      const wordCount = (post.content || '').length

      return {
        ...post,
        category: post.categoryName
          ? { id: post.categoryId, name: post.categoryName, slug: post.categorySlug }
          : null,
        tags: postTagsList,
        wordCount,
      }
    })
  )

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}
