import type { Metadata } from 'next'
import { Layers3 } from 'lucide-react'
import { notFound } from 'next/navigation'

import { Link } from '@/app/i18n/routing'
import { Navigation } from '@/components/layout/header'
import { ArticleGrid } from '@/components/public/article-grid'
import { locales } from '@/i18n.config'
import { absoluteUrl, languageAlternates, localizedPath, localeToOpenGraph } from '@/lib/seo'
import { getPublishedSeries, getPublishedSeriesBySlug } from '@/server/db/queries/posts'

export const revalidate = 300

export async function generateStaticParams() {
  try {
    const values = await getPublishedSeries()
    return values.flatMap((item) => locales.map((locale) => ({ locale, slug: item.slug })))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  const value = await getPublishedSeriesBySlug(params.slug)
  if (!value) return { title: params.locale === 'zh' ? '专题未找到' : 'Series not found' }
  const title = params.locale === 'zh' ? `专题：${value.name}` : `${value.name} · Series`
  const description = value.description || (params.locale === 'zh' ? `按顺序阅读“${value.name}”专题。` : `Read the “${value.name}” series in order.`)
  const path = `/series/${value.slug}`
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(localizedPath(params.locale, path)), languages: languageAlternates(path) },
    openGraph: { title, description, url: absoluteUrl(localizedPath(params.locale, path)), locale: localeToOpenGraph(params.locale) },
  }
}

export default async function SeriesPage({ params }: { params: { locale: string; slug: string } }) {
  const value = await getPublishedSeriesBySlug(params.slug)
  if (!value) notFound()

  return (
    <>
      <Navigation />
      <main className="min-h-screen pb-16 pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <header className="mb-12 pt-6 md:mb-16 md:pt-10">
            <div className="mb-6 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.16em] text-theme-accent-primary">
              <span className="h-px w-8 bg-theme-accent-primary" />
              <span className="inline-flex items-center gap-2"><Layers3 className="h-4 w-4" />{params.locale === 'zh' ? '文章专题' : 'Article series'}</span>
            </div>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,30rem)] lg:items-end lg:gap-12">
              <h1 className="break-words text-5xl leading-[0.95] tracking-tighter text-theme-text-canvas sm:text-6xl md:text-7xl">{value.name}</h1>
              <p className="max-w-[58ch] text-base leading-relaxed text-theme-text-secondary sm:text-lg">{value.description || (params.locale === 'zh' ? '一组按阅读顺序组织的连续文章。' : 'A sequence of articles organized for continuous reading.')}</p>
            </div>
            <div className="mt-9 flex items-center gap-4 border-t border-theme-border pt-4 font-mono text-xs uppercase tracking-[0.16em] text-theme-text-tertiary">
              <span>{value.posts.length} {params.locale === 'zh' ? '篇文章' : 'posts'}</span><span className="h-1 w-1 rounded-full bg-theme-accent-primary" /><Link href="/archive" className="transition-colors hover:text-theme-accent-primary">{params.locale === 'zh' ? '浏览归档' : 'Browse archive'}</Link>
            </div>
          </header>
          <ArticleGrid posts={value.posts} />
        </div>
      </main>
    </>
  )
}
