'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

import { locales } from '@/i18n.config'
import { localizedPath } from '@/lib/seo'
import { auth } from '@/server/auth'
import { SeriesRepository } from '@/server/repositories/series.repository'

const repository = new SeriesRepository()

async function userId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')
  return session.user.id
}

function revalidateSeries(slug?: string) {
  revalidateTag('public-posts')
  revalidatePath('/admin/series')
  revalidatePath('/sitemap.xml')
  if (slug) {
    for (const locale of locales) revalidatePath(localizedPath(locale, `/series/${slug}`))
  }
}

export async function getSeriesForSelect() {
  return repository.list(await userId())
}

export async function createSeries(input: { name: string; slug?: string; description?: string }) {
  try {
    const value = await repository.create(await userId(), input)
    revalidateSeries(value.slug)
    return value
  } catch (error) {
    const value = error as { code?: string; cause?: { code?: string } }
    if (value.code === '23505' || value.cause?.code === '23505') throw new Error('专题名称或 slug 已存在')
    throw error
  }
}

export async function updateSeries(id: string, input: { name: string; slug?: string; description?: string }) {
  const value = await repository.update(await userId(), id, input)
  revalidateSeries(value.slug)
  return value
}

export async function deleteSeries(id: string) {
  await repository.delete(await userId(), id)
  revalidateSeries()
  return { success: true }
}
