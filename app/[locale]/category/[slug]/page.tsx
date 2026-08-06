import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n.config'
import { Navigation } from '@/components/layout/header'
import { ContentCollection } from '@/components/public/discovery'
import { getAllCategories, getCategoryBySlug } from '@/server/db/queries/categories'
import { getPublishedPosts } from '@/server/db/queries/posts'
import { absoluteUrl, languageAlternates, localizedPath, localeToOpenGraph } from '@/lib/seo'

export const revalidate = 300

export async function generateStaticParams() {
  try {
    const categories = await getAllCategories()
    return categories.flatMap(category => locales.map(locale => ({ locale, slug: category.slug })))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug)
  if (!category) return { title: params.locale === 'zh' ? '分类未找到' : 'Category not found' }

  const title = params.locale === 'zh' ? `分类：${category.name}` : `${category.name} · Category`
  const description = category.description || (params.locale === 'zh'
    ? `浏览“${category.name}”分类下的全部文章。`
    : `Browse every article filed under “${category.name}”.`)
  const path = `/category/${category.slug}`
  const url = absoluteUrl(localizedPath(params.locale, path))

  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: { title, description, url, locale: localeToOpenGraph(params.locale) },
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategoryBySlug(params.slug)
  if (!category) notFound()
  const posts = await getPublishedPosts(category.id)

  return (
    <>
      <Navigation />
      <ContentCollection kind="category" name={category.name} description={category.description} posts={posts} />
    </>
  )
}
