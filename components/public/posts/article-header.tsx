'use client'

import { Clock, Stack, Tag } from '@phosphor-icons/react'
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
    <header className="mb-12">
      {/* Category */}
      <div className="flex items-center gap-4 mb-6">
        {categorySlug ? (
          <Link href={`/category/${categorySlug}`} className="inline-flex items-center gap-1.5 rounded-full bg-theme-accent-bg px-3 py-1 text-sm font-medium text-theme-accent-primary transition-transform hover:-translate-y-0.5">
            <Tag size={14} weight="fill" />
            {category}
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-theme-accent-bg px-3 py-1 text-sm font-medium text-theme-accent-primary">
            <Tag size={14} weight="fill" />
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
      <h1 className="text-4xl md:text-6xl tracking-tighter leading-none text-theme-text-canvas mb-6">
        {title}
      </h1>

      {/* Excerpt */}
      <p className="text-xl text-theme-text-secondary leading-relaxed mb-6">
        {excerpt}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-theme-text-tertiary pt-6 border-t border-theme-border">
        <span>{formatDateLong(date, locale)}</span>
        <span>·</span>
        <div className="flex gap-2">
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
