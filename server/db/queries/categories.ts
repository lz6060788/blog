import { db } from '../index'
import { categories } from '../schema'
import { eq } from 'drizzle-orm'
import type { Category } from '@/lib/types'

/**
 * 获取所有分类
 * @returns 所有分类列表
 */
export async function getAllCategories(): Promise<Category[]> {
  const result = await db.select().from(categories)
  return result.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }))
}

/**
 * 根据 slug 获取分类
 * @param slug 分类的 slug
 * @returns 分类对象，如果不存在则返回 null
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  const c = result[0]
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }
}

/**
 * 根据 ID 获取分类
 * @param id 分类 ID
 * @returns 分类对象，如果不存在则返回 null
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  const c = result[0]
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }
}
