import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n.config'
import { Navigation } from '@/components/layout/header'
import { ContentCollection } from '@/components/public/discovery'
import { getAllTags, getTagBySlug } from '@/server/db/queries/tags'
import { getPublishedPosts } from '@/server/db/queries/posts'
import { absoluteUrl, languageAlternates, localizedPath, localeToOpenGraph } from '@/lib/seo'

export const revalidate = 300

export async function generateStaticParams() {
  try {
    const tags = await getAllTags()
    return tags.flatMap(tag => locales.map(locale => ({ locale, slug: tag.slug })))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  const tag = await getTagBySlug(params.slug)
  if (!tag) return { title: params.locale === 'zh' ? '标签未找到' : 'Tag not found' }

  const title = params.locale === 'zh' ? `标签：${tag.name}` : `${tag.name} · Tag`
  const description = params.locale === 'zh'
    ? `浏览带有“${tag.name}”标签的全部文章。`
    : `Browse every article tagged with “${tag.name}”.`
  const path = `/tag/${tag.slug}`
  const url = absoluteUrl(localizedPath(params.locale, path))

  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: { title, description, url, locale: localeToOpenGraph(params.locale) },
  }
}

export default async function TagPage({ params }: { params: { slug: string } }) {
  const tag = await getTagBySlug(params.slug)
  if (!tag) notFound()
  const posts = await getPublishedPosts(undefined, tag.id)

  return (
    <>
      <Navigation />
      <ContentCollection kind="tag" name={tag.name} posts={posts} />
    </>
  )
}
