import type { Metadata } from 'next'
import { ArrowUpRight, BookOpen, LibraryBig } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Link } from '@/app/i18n/routing'
import { Navigation } from '@/components/layout/header'
import { absoluteUrl, languageAlternates, localizedPath, localeToOpenGraph } from '@/lib/seo'
import { getPublishedSeries } from '@/server/db/queries/posts'

export const revalidate = 300

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const isChinese = params.locale === 'zh'
  const title = isChinese ? '系列文章' : 'Article Series'
  const description = isChinese
    ? '浏览按阅读顺序组织的专题文章与深度内容系列。'
    : 'Browse ordered article series and long-form reading paths.'
  const url = absoluteUrl(localizedPath(params.locale, '/series'))

  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates('/series') },
    openGraph: { title, description, url, locale: localeToOpenGraph(params.locale) },
  }
}

export default async function SeriesIndexPage() {
  const [values, t] = await Promise.all([getPublishedSeries(), getTranslations('series')])

  return (
    <>
      <Navigation />
      <main className="min-h-screen pb-20 pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <header className="relative isolate mb-16 overflow-hidden rounded-[2rem] border-2 border-theme-text-canvas bg-theme-text-canvas px-6 py-10 text-theme-surface shadow-[10px_10px_0_0_hsl(var(--theme-primary))] sm:px-10 sm:py-14 lg:px-14 lg:py-16">
            <div className="pointer-events-none absolute -right-5 -top-16 -z-10 select-none font-mono text-[9rem] font-black leading-none tracking-tighter text-theme-surface/[0.055] sm:text-[13rem] lg:text-[17rem]">SERIES</div>
            <div className="mb-10 flex items-center justify-between gap-6 border-b border-theme-surface/20 pb-5">
              <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-theme-surface/60"><LibraryBig className="h-4 w-4" />{t('eyebrow')}</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-theme-accent-primary">{values.length.toString().padStart(2, '0')} Volumes</span>
            </div>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,31rem)] lg:items-end">
              <h1 className="max-w-3xl text-5xl font-semibold leading-[0.92] tracking-[-0.055em] sm:text-7xl lg:text-8xl">{t('title')}</h1>
              <p className="max-w-[54ch] text-base leading-7 text-theme-surface/62 sm:text-lg">{t('description')}</p>
            </div>
          </header>

          {values.length ? (
            <ol className="grid gap-7 md:grid-cols-2">
              {values.map((item, index) => (
                <li key={item.id}>
                  <Link href={`/series/${item.slug}`} className="group block h-full">
                    <article className="flex h-full min-h-[22rem] flex-col rounded-[1.75rem] border-2 border-theme-text-canvas bg-theme-surface p-6 shadow-[7px_7px_0_0_hsl(var(--theme-foreground)/0.16)] transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-[11px_11px_0_0_hsl(var(--theme-primary))] sm:p-8">
                      <div className="flex items-start justify-between gap-6 border-b-2 border-theme-text-canvas pb-5">
                        <span className="font-mono text-5xl font-semibold leading-none tracking-[-0.08em] text-theme-text-canvas">{String(index + 1).padStart(2, '0')}</span>
                        <span className="rounded-full bg-theme-text-canvas px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-theme-surface">{t('postCount', { count: Number(item.postCount) })}</span>
                      </div>
                      <div className="flex flex-1 flex-col pt-7">
                        <p className="mb-3 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-theme-accent-primary"><BookOpen className="h-3.5 w-3.5" />{t('sequence')}</p>
                        <h2 className="break-words text-3xl font-semibold leading-tight tracking-tight text-theme-text-canvas sm:text-4xl">{item.name}</h2>
                        <p className="mt-4 line-clamp-3 text-sm leading-6 text-theme-text-secondary sm:text-base">{item.description || t('description')}</p>
                        <div className="mt-auto flex items-center justify-between border-t border-theme-border pt-5 text-sm font-semibold text-theme-text-canvas">
                          <span>{t('readSeries')}</span>
                          <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-theme-text-canvas transition-colors group-hover:bg-theme-text-canvas group-hover:text-theme-surface"><ArrowUpRight className="h-5 w-5" /></span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <div className="rounded-[2rem] border-2 border-dashed border-theme-border-strong px-6 py-20 text-center">
              <LibraryBig className="mx-auto h-10 w-10 text-theme-text-tertiary" />
              <p className="mt-4 text-base text-theme-text-secondary">{t('empty')}</p>
              <Link href="/archive" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-theme-accent-primary">{t('browseArchive')}<ArrowUpRight className="h-4 w-4" /></Link>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
