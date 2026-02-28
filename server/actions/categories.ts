'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/server/db'
import { categories } from '@/server/db/schema'
import { auth } from '@/server/auth'
import { eq } from 'drizzle-orm'

async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  return { ...session.user, id: session.user.id as string }
}

export async function getCategories() {
  await getCurrentUser()
  return await db.select().from(categories).orderBy(categories.createdAt)
}

export async function getCategory(id: string) {
  const user = await getCurrentUser()
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1)
  if (!category) throw new Error('分类不存在')
  return category
}

export async function createCategory(data: { name: string; slug: string; description?: string }) {
  const user = await getCurrentUser()
  const id = crypto.randomUUID()
  await db.insert(categories).values({
    id,
    name: data.name,
    slug: data.slug,
    description: data.description || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  revalidatePath('/admin/categories')
  return { success: true, id }
}

export async function updateCategory(id: string, data: { name: string; slug: string; description?: string }) {
  const user = await getCurrentUser()
  await db
    .update(categories)
    .set({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(categories.id, id))
  revalidatePath('/admin/categories')
  return { success: true }
}

export async function deleteCategory(id: string) {
  const user = await getCurrentUser()
  await db.delete(categories).where(eq(categories.id, id))
  revalidatePath('/admin/categories')
  return { success: true }
}
