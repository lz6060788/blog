'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/server/db'
import { settings } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/server/auth'

// 获取当前用户
async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  return {
    ...session.user,
    id: session.user.id as string,
  }
}

// 获取博客设置
export async function getSettings() {
  const result = await db
    .select()
    .from(settings)
    .limit(1)

  if (result.length === 0) {
    // 如果没有设置记录，创建默认设置
    const defaultSettings = {
      id: 'default',
      blogName: 'My Blog',
      blogDescription: 'A personal blog',
      postsPerPage: 10,
      updatedAt: new Date().toISOString(),
    }
    await db.insert(settings).values(defaultSettings)
    return defaultSettings
  }

  return result[0]
}

// 更新博客设置
export async function updateSettings(data: {
  blogName?: string
  blogDescription?: string
  postsPerPage?: number
}) {
  const user = await getCurrentUser()

  const { blogName, blogDescription, postsPerPage } = data

  // 构建更新数据
  const updateData: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  }

  if (blogName !== undefined) {
    if (!blogName.trim()) {
      throw new Error('博客名称不能为空')
    }
    updateData.blogName = blogName.trim()
  }

  if (blogDescription !== undefined) {
    updateData.blogDescription = blogDescription.trim()
  }

  if (postsPerPage !== undefined) {
    if (postsPerPage < 1 || postsPerPage > 100) {
      throw new Error('每页文章数必须在 1-100 之间')
    }
    updateData.postsPerPage = postsPerPage
  }

  // 检查设置记录是否存在
  const existing = await db
    .select()
    .from(settings)
    .where(eq(settings.id, 'default'))
    .limit(1)

  if (existing.length === 0) {
    // 创建新记录
    await db.insert(settings).values({
      id: 'default',
      blogName: (updateData.blogName as string) || 'My Blog',
      blogDescription: (updateData.blogDescription as string) || 'A personal blog',
      postsPerPage: (updateData.postsPerPage as number) || 10,
      updatedAt: new Date().toISOString(),
    })
  } else {
    // 更新现有记录
    await db
      .update(settings)
      .set(updateData)
      .where(eq(settings.id, 'default'))
  }

  // 重新验证缓存
  revalidatePath('/admin/settings')

  return { success: true }
}
