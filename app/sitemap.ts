import type { MetadataRoute } from 'next'
import { locales } from '@/i18n.config'
import { getPublishedPosts } from '@/server/db/queries/posts'
import { absoluteUrl, localizedPath, safeDate } from '@/lib/seo'

// 数据由数据库生成，并定期重新验证；不维护静态文章清单。
export const revalidate = 300

function localizedEntries(
  path: string,
  options: Omit<MetadataRoute.Sitemap[number], 'url'>,
): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: absoluteUrl(localizedPath(locale, path)),
    ...options,
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    ...localizedEntries('/', {
      changeFrequency: 'weekly',
      priority: 1,
    }),
    ...localizedEntries('/archive', {
      changeFrequency: 'weekly',
      priority: 0.7,
    }),
  ]

  try {
    const posts = await getPublishedPosts()
    const postEntries = posts.flatMap((post) =>
      localizedEntries(`/post/${post.id}`, {
        lastModified: safeDate(post.updatedAt || post.date),
        changeFrequency: 'monthly',
        priority: 0.8,
      }),
    )

    const categorySlugs = new Set(posts.flatMap(post => post.categoryObj?.slug ? [post.categoryObj.slug] : []))
    const tagSlugs = new Set(posts.flatMap(post => post.tagObjs?.map(tag => tag.slug) || []))
    const discoveryEntries = [
      ...Array.from(categorySlugs).flatMap(slug => localizedEntries(`/category/${slug}`, {
        changeFrequency: 'weekly',
        priority: 0.65,
      })),
      ...Array.from(tagSlugs).flatMap(slug => localizedEntries(`/tag/${slug}`, {
        changeFrequency: 'weekly',
        priority: 0.6,
      })),
    ]

    return [...staticEntries, ...discoveryEntries, ...postEntries]
  } catch (error) {
    console.error('Failed to generate article sitemap entries:', error)
    return staticEntries
  }
}
