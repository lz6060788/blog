'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { tags } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'

async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  return { ...session.user, id: session.user.id as string }
}

export async function getTags() {
  await getCurrentUser()
  return await db.select().from(tags).orderBy(tags.createdAt)
}

export async function getTag(id: string) {
  const user = await getCurrentUser()
  const [tag] = await db.select().from(tags).where(eq(tags.id, id)).limit(1)
  if (!tag) throw new Error('标签不存在')
  return tag
}

export async function createTag(data: { name: string; slug: string }) {
  const user = await getCurrentUser()
  const id = crypto.randomUUID()
  await db.insert(tags).values({
    id,
    name: data.name,
    slug: data.slug,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  revalidatePath('/admin/tags')
  return { success: true, id }
}

export async function updateTag(id: string, data: { name: string; slug: string }) {
  const user = await getCurrentUser()
  await db
    .update(tags)
    .set({
      name: data.name,
      slug: data.slug,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(tags.id, id))
  revalidatePath('/admin/tags')
  return { success: true }
}

export async function deleteTag(id: string) {
  const user = await getCurrentUser()
  await db.delete(tags).where(eq(tags.id, id))
  revalidatePath('/admin/tags')
  return { success: true }
}
