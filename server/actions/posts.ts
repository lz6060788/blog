'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/server/auth'
import { PostRepository } from '@/server/repositories/post.repository'
import { PostService } from '@/server/services/post.service'

// 创建 Service 实例
function createPostService() {
  const postRepository = new PostRepository()
  return new PostService(postRepository)
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
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const postService = createPostService()
  const result = await postService.createPost(session.user.id, data)

  // 重新验证缓存
  revalidatePath('/admin/posts')
  revalidatePath('/admin/drafts')

  return { success: true, postId: result.id }
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
    coverImageUrl?: string | null
    aiCoverStatus?: 'pending' | 'generating' | 'done' | 'failed' | 'manual' | null
  }
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const postService = createPostService()
  await postService.updatePost(id, session.user.id, data)

  // 重新验证缓存
  revalidatePath('/admin/posts')
  revalidatePath('/admin/drafts')
  revalidatePath(`/admin/posts/${id}/edit`)

  return { success: true }
}

// 删除文章
export async function deletePost(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const postService = createPostService()
  await postService.deletePost(id, session.user.id)

  // 重新验证缓存
  revalidatePath('/admin/posts')
  revalidatePath('/admin/drafts')

  return { success: true }
}

// 切换文章发布状态
export async function togglePostStatus(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const postService = createPostService()
  const newStatus = await postService.togglePostStatus(id, session.user.id)

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

  const postService = createPostService()
  return await postService.getPostById(id, session.user.id)
}

// 获取所有分类（用于表单选择）
export async function getCategoriesForSelect() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const { db } = await import('@/server/db')
  const { categories } = await import('@/server/db/schema')

  return await db.select().from(categories).orderBy(categories.name)
}

// 获取所有标签（用于表单选择）
export async function getTagsForSelect() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const { db } = await import('@/server/db')
  const { tags } = await import('@/server/db/schema')

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

  const postService = createPostService()
  return await postService.listPublishedPosts(options)
}
