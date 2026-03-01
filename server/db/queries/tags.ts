import { db } from '../index'
import { tags } from '../schema'
import { eq } from 'drizzle-orm'
import type { Tag } from '@/lib/types'

/**
 * 获取所有标签
 * @returns 所有标签列表
 */
export async function getAllTags(): Promise<Tag[]> {
  const result = await db.select().from(tags)
  return result.map(t => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }))
}

/**
 * 根据 slug 获取标签
 * @param slug 标签的 slug
 * @returns 标签对象，如果不存在则返回 null
 */
export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const result = await db
    .select()
    .from(tags)
    .where(eq(tags.slug, slug))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  const t = result[0]
  return {
    id: t.id,
    name: t.name,
    slug: t.slug,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }
}

/**
 * 根据 ID 获取标签
 * @param id 标签 ID
 * @returns 标签对象，如果不存在则返回 null
 */
export async function getTagById(id: string): Promise<Tag | null> {
  const result = await db
    .select()
    .from(tags)
    .where(eq(tags.id, id))
    .limit(1)

  if (result.length === 0) {
    return null
  }

  const t = result[0]
  return {
    id: t.id,
    name: t.name,
    slug: t.slug,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }
}
