'use client'

import { Clock, Stack } from '@phosphor-icons/react'
import { formatDateLong } from '@/lib/date-format'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/app/i18n/routing'
import type { Tag as TagEntity } from '@/lib/types'

interface ArticleHeaderProps {
  title: string
  excerpt: string
  category: string
  readTime: number
  date: string
  tags: string[]
  categorySlug?: string
  tagObjs?: TagEntity[]
  series?: { name: string; slug: string; position: number; total: number }
}

export function ArticleHeader({
  title,
  excerpt,
  category,
  readTime,
  date,
  tags,
  categorySlug,
  tagObjs,
  series,
}: ArticleHeaderProps) {
  const locale = useLocale()
  const t = useTranslations('article')

  return (
    <header className="mb-14 border-b border-theme-border pb-9 sm:mb-16 sm:pb-11">
      {/* Category */}
      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
        {categorySlug ? (
          <Link href={`/category/${categorySlug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-theme-accent-primary transition-colors hover:text-theme-text-canvas">
            {category}
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-theme-accent-primary">
            {category}
          </span>
        )}
        <div className="flex items-center gap-1.5 text-theme-text-tertiary text-sm font-mono">
          <Clock size={14} />
          {t('minutesRead', { count: readTime })}
        </div>
        {series && (
          <Link href={`/series/${series.slug}`} className="inline-flex items-center gap-1.5 text-sm text-theme-text-secondary transition-colors hover:text-theme-accent-primary">
            <Stack size={14} />
            {series.name} · {series.position}/{series.total}
          </Link>
        )}
      </div>

      {/* Title */}
      <h1 className="mb-6 text-balance text-3xl font-semibold leading-[1.25] tracking-tight text-theme-text-canvas sm:text-5xl sm:leading-[1.2]">
        {title}
      </h1>

      {/* Excerpt */}
      {excerpt && <p className="mb-8 max-w-[60ch] text-lg leading-relaxed text-theme-text-secondary sm:text-xl">
        {excerpt}
      </p>}

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-theme-text-tertiary sm:text-sm">
        <time dateTime={date}>{formatDateLong(date, locale)}</time>
        {tags.length > 0 && <span aria-hidden="true">/</span>}
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {tags.map((tag) => {
            const tagObject = tagObjs?.find(item => item.name === tag)
            return tagObject ? (
              <Link key={tag} href={`/tag/${tagObject.slug}`} className="transition-colors hover:text-theme-accent-primary">#{tag}</Link>
            ) : (
              <span key={tag}>#{tag}</span>
            )
          })}
        </div>
      </div>
    </header>
  )
}
