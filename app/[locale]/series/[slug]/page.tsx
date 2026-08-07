import type { Metadata } from 'next'
import { ArrowLeft, ArrowUpRight, BookOpen, Layers3 } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { Link } from '@/app/i18n/routing'
import { Navigation } from '@/components/layout/header'
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
  const [value, seriesT, articleT] = await Promise.all([
    getPublishedSeriesBySlug(params.slug),
    getTranslations('series'),
    getTranslations('article'),
  ])
  if (!value) notFound()

  return (
    <>
      <Navigation />
      <main className="min-h-screen pb-20 pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <header className="relative isolate mb-14 overflow-hidden rounded-[2rem] border-2 border-theme-text-canvas bg-theme-text-canvas px-6 py-9 text-theme-surface shadow-[10px_10px_0_0_hsl(var(--theme-primary))] sm:px-10 sm:py-12 lg:px-14 lg:py-14">
            <div className="pointer-events-none absolute -bottom-16 right-0 -z-10 select-none font-mono text-[11rem] font-black leading-none text-theme-surface/[0.05] lg:text-[16rem]">{String(value.posts.length).padStart(2, '0')}</div>
            <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-theme-surface/20 pb-5">
              <Link href="/series" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-theme-surface/60 transition-colors hover:text-theme-surface"><ArrowLeft className="h-4 w-4" />{seriesT('eyebrow')}</Link>
              <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-theme-accent-primary"><Layers3 className="h-4 w-4" />{seriesT('postCount', { count: value.posts.length })}</span>
            </div>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,29rem)] lg:items-end">
              <div>
                <p className="mb-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-theme-surface/50"><BookOpen className="h-4 w-4" />{seriesT('sequence')}</p>
                <h1 className="break-words text-5xl font-semibold leading-[0.94] tracking-[-0.055em] sm:text-6xl lg:text-7xl">{value.name}</h1>
              </div>
              <p className="max-w-[54ch] text-base leading-7 text-theme-surface/62 sm:text-lg">{value.description || seriesT('description')}</p>
            </div>
          </header>

          <ol className="overflow-hidden rounded-[1.75rem] border-2 border-theme-text-canvas bg-theme-surface shadow-[8px_8px_0_0_hsl(var(--theme-foreground)/0.14)]">
            {value.posts.map((post, index) => (
              <li key={post.id} className="group border-b-2 border-theme-text-canvas last:border-b-0">
                <Link href={`/post/${post.id}`} className="grid gap-5 p-5 transition-colors hover:bg-theme-surface-alt sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:items-center sm:p-7 lg:grid-cols-[8rem_minmax(0,1fr)_auto] lg:p-9">
                  <div className="font-mono text-5xl font-semibold leading-none tracking-[-0.08em] text-theme-text-canvas lg:text-6xl">{String(index + 1).padStart(2, '0')}</div>
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-theme-text-tertiary">
                      <span>{post.category}</span><span className="h-1 w-1 rounded-full bg-theme-accent-primary" /><span>{articleT('minutesRead', { count: post.readTime })}</span>
                    </div>
                    <h2 className="text-2xl font-semibold leading-tight tracking-tight text-theme-text-canvas transition-colors group-hover:text-theme-accent-primary sm:text-3xl">{post.title}</h2>
                    {post.excerpt && <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-6 text-theme-text-secondary sm:text-base">{post.excerpt}</p>}
                  </div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-theme-text-canvas text-theme-text-canvas transition-all group-hover:bg-theme-text-canvas group-hover:text-theme-surface"><ArrowUpRight className="h-5 w-5" /></span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </main>
    </>
  )
}
