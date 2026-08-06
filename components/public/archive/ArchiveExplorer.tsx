'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  CalendarBlank,
  CaretDown,
  Clock,
  FolderOpen,
  FunnelSimple,
  Hash,
  Tag,
  X,
} from '@phosphor-icons/react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Link } from '@/app/i18n/routing'
import type { PostSummary } from '@/lib/types'

interface ArchiveExplorerProps {
  posts: PostSummary[]
}

interface DateParts {
  year: number
  month: number
  day: string
}

function getDateParts(value: string): DateParts {
  const date = new Date(value)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  return {
    year: Number(parts.find(part => part.type === 'year')?.value || 0),
    month: Number(parts.find(part => part.type === 'month')?.value || 0),
    day: parts.find(part => part.type === 'day')?.value || '—',
  }
}

function getMonthLabel(month: number, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2024, month - 1, 1)))
}

export default function ArchiveExplorer({ posts }: ArchiveExplorerProps) {
  const locale = useLocale()
  const t = useTranslations('archive')
  const articleT = useTranslations('article')
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get('category') || ''
  const selectedTag = searchParams.get('tag') || ''

  const categories = useMemo(() => {
    const categoryMap = new Map<string, string>()
    posts.forEach(post => {
      if (post.categoryObj?.slug) categoryMap.set(post.categoryObj.slug, post.category)
    })
    return Array.from(categoryMap, ([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name, locale))
  }, [locale, posts])

  const tags = useMemo(() => {
    const tagMap = new Map<string, string>()
    posts.forEach(post => post.tagObjs?.forEach(tag => tagMap.set(tag.slug, tag.name)))
    return Array.from(tagMap, ([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name, locale))
  }, [locale, posts])

  const filteredPosts = useMemo(() => posts.filter(post => {
    if (selectedCategory && post.categoryObj?.slug !== selectedCategory) return false
    if (selectedTag && !post.tagObjs?.some(tag => tag.slug === selectedTag)) return false
    return true
  }), [posts, selectedCategory, selectedTag])

  const groups = useMemo(() => {
    const years = new Map<number, Map<number, PostSummary[]>>()
    filteredPosts.forEach(post => {
      const { year, month } = getDateParts(post.date)
      if (!years.has(year)) years.set(year, new Map())
      const months = years.get(year)!
      if (!months.has(month)) months.set(month, [])
      months.get(month)!.push(post)
    })

    return Array.from(years, ([year, months]) => ({
      year,
      count: Array.from(months.values()).reduce((sum, monthPosts) => sum + monthPosts.length, 0),
      months: Array.from(months, ([month, monthPosts]) => ({ month, posts: monthPosts }))
        .sort((a, b) => b.month - a.month),
    })).sort((a, b) => b.year - a.year)
  }, [filteredPosts])

  const setFilter = (key: 'category' | 'tag', value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const clearFilters = () => router.replace(pathname, { scroll: false })
  const hasFilters = Boolean(selectedCategory || selectedTag)

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-14 border-y border-theme-border py-4 sm:py-5"
        aria-label={t('jumpToYear')}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex shrink-0 items-center gap-4">
            <p className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-theme-text-tertiary">
              <CalendarBlank size={14} />
              {t('jumpToYear')}
            </p>
            <div className="flex flex-wrap gap-2">
              {groups.map(group => (
                <a
                  key={group.year}
                  href={`#year-${group.year}`}
                  className="border-b border-transparent px-1 py-1 font-mono text-sm text-theme-text-canvas transition-colors hover:border-theme-accent-primary hover:text-theme-accent-primary"
                >
                  {group.year}
                </a>
              ))}
            </div>
          </div>

          <div className="hidden h-6 w-px bg-theme-border lg:block" />

          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 lg:justify-end">
            <span className="hidden items-center gap-1.5 pr-1 font-mono text-[11px] uppercase tracking-[0.14em] text-theme-text-tertiary sm:inline-flex">
              <FunnelSimple size={13} />
            </span>
            <label className="relative min-w-[9rem] flex-1 sm:flex-none">
              <span className="sr-only">{t('categoryFilter')}</span>
              <FolderOpen size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-tertiary" />
              <select
                value={selectedCategory}
                onChange={event => setFilter('category', event.target.value)}
                className="h-9 w-full appearance-none rounded-full border border-theme-border bg-transparent pl-8 pr-8 text-xs text-theme-text-canvas outline-none transition-colors hover:border-theme-text-tertiary focus:border-theme-accent-primary sm:w-44"
              >
                <option value="">{t('allCategories')}</option>
                {categories.map(category => <option key={category.slug} value={category.slug}>{category.name}</option>)}
              </select>
              <CaretDown size={12} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-theme-text-tertiary" />
            </label>
            <label className="relative min-w-[9rem] flex-1 sm:flex-none">
              <span className="sr-only">{t('tagFilter')}</span>
              <Hash size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-tertiary" />
              <select
                value={selectedTag}
                onChange={event => setFilter('tag', event.target.value)}
                className="h-9 w-full appearance-none rounded-full border border-theme-border bg-transparent pl-8 pr-8 text-xs text-theme-text-canvas outline-none transition-colors hover:border-theme-text-tertiary focus:border-theme-accent-primary sm:w-40"
              >
                <option value="">{t('allTags')}</option>
                {tags.map(tag => <option key={tag.slug} value={tag.slug}>{tag.name}</option>)}
              </select>
              <CaretDown size={12} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-theme-text-tertiary" />
            </label>
            {hasFilters && (
              <>
                <span className="px-1 font-mono text-[11px] text-theme-text-tertiary">
                  {t('postCount', { count: filteredPosts.length })}
                </span>
                <button
                  type="button"
                  onClick={clearFilters}
                  aria-label={t('clearFilters')}
                  title={t('clearFilters')}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-theme-text-tertiary transition-colors hover:bg-theme-surface-alt hover:text-theme-text-canvas"
                >
                  <X size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </motion.section>

      {groups.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-theme-border py-20 text-center text-theme-text-secondary">
          {t('noResults')}
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="space-y-20"
        >
          {groups.map(group => (
            <motion.section
              key={group.year}
              id={`year-${group.year}`}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              className="scroll-mt-24 md:grid md:grid-cols-[10rem_minmax(0,1fr)] md:gap-10 lg:grid-cols-[13rem_minmax(0,1fr)]"
            >
              <div className="mb-8 self-start md:sticky md:top-24 md:mb-0">
                <h2 className="text-6xl font-semibold leading-none tracking-tighter text-theme-text-disabled md:text-7xl lg:text-8xl">
                  {group.year}
                </h2>
                <p className="mt-3 font-mono text-xs text-theme-text-tertiary">
                  {t('postCount', { count: group.count })}
                </p>
              </div>

              <div className="space-y-12">
                {group.months.map(monthGroup => (
                  <section
                    key={monthGroup.month}
                    id={`archive-${group.year}-${String(monthGroup.month).padStart(2, '0')}`}
                    className="scroll-mt-24"
                  >
                    <div className="mb-4 flex items-baseline gap-4 border-b border-theme-border pb-3">
                      <h3 className="text-2xl font-medium tracking-tight text-theme-text-canvas sm:text-3xl">
                        {getMonthLabel(monthGroup.month, locale)}
                      </h3>
                      <span className="font-mono text-xs text-theme-text-tertiary">
                        {t('monthCount', { count: monthGroup.posts.length })}
                      </span>
                      <div className="ml-auto font-mono text-xs text-theme-text-disabled">
                        {String(monthGroup.month).padStart(2, '0')}
                      </div>
                    </div>

                    <div className="divide-y divide-theme-border-muted">
                      {monthGroup.posts.map(post => {
                        const { day } = getDateParts(post.date)
                        return (
                          <article key={post.id} className="group grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 py-5 sm:grid-cols-[3.25rem_minmax(0,1fr)_auto] sm:items-center sm:gap-5">
                            <div className="font-mono text-xl text-theme-text-disabled sm:text-2xl">{day}</div>
                            <div className="min-w-0">
                              <Link href={`/post/${post.id}`} className="inline-flex max-w-full items-start gap-2">
                                <h4 className="truncate text-base font-medium text-theme-text-canvas transition-colors group-hover:text-theme-accent-primary sm:text-lg">
                                  {post.title}
                                </h4>
                                <ArrowUpRight size={15} className="mt-1 shrink-0 text-theme-text-disabled transition-colors group-hover:text-theme-accent-primary" />
                              </Link>
                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-theme-text-tertiary">
                                {post.categoryObj?.slug ? (
                                  <Link href={`/category/${post.categoryObj.slug}`} className="inline-flex items-center gap-1 transition-colors hover:text-theme-accent-primary">
                                    <Tag size={12} /> {post.category}
                                  </Link>
                                ) : <span>{post.category}</span>}
                                {post.tagObjs?.slice(0, 3).map(tag => (
                                  <Link key={tag.id} href={`/tag/${tag.slug}`} className="transition-colors hover:text-theme-accent-primary">#{tag.name}</Link>
                                ))}
                              </div>
                            </div>
                            <div className="col-start-2 flex items-center gap-1.5 font-mono text-[11px] text-theme-text-tertiary sm:col-start-auto sm:justify-self-end">
                              <Clock size={12} />
                              {articleT('minutesRead', { count: post.readTime })}
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </motion.section>
          ))}
        </motion.div>
      )}
    </>
  )
}
