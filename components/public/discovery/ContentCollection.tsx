'use client'

import { motion } from 'framer-motion'
import { ArrowRight, FolderOpen, Hash } from '@phosphor-icons/react'
import { useTranslations } from 'next-intl'
import { Link } from '@/app/i18n/routing'
import { ArticleGrid } from '@/components/public/article-grid'
import type { PostSummary } from '@/lib/types'

interface ContentCollectionProps {
  kind: 'category' | 'tag'
  name: string
  description?: string | null
  posts: PostSummary[]
}

export function ContentCollection({ kind, name, description, posts }: ContentCollectionProps) {
  const t = useTranslations('collection')
  const Icon = kind === 'category' ? FolderOpen : Hash
  const fallbackDescription = kind === 'category'
    ? t('categoryDescription', { name })
    : t('tagDescription', { name })

  return (
    <main className="min-h-screen pb-16 pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12 overflow-hidden rounded-[2rem] border border-theme-card bg-theme-card-bg px-6 py-9 shadow-card sm:px-10 sm:py-12 md:mb-16"
        >
          <div className="pointer-events-none absolute -right-6 -top-10 font-mono text-[9rem] leading-none text-theme-text-disabled/25 sm:text-[12rem]">
            {kind === 'category' ? 'C' : '#'}
          </div>
          <div className="relative max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-theme-accent-bg px-3 py-1.5 text-xs font-medium text-theme-accent-primary">
              <Icon size={14} weight="fill" />
              {t(kind)}
            </div>
            <h1 className="break-words text-5xl leading-none tracking-tighter text-theme-text-canvas sm:text-6xl md:text-7xl">
              {kind === 'tag' && <span className="mr-1 text-theme-accent-primary">#</span>}
              {name}
            </h1>
            <p className="mt-5 max-w-[65ch] text-base leading-relaxed text-theme-text-secondary sm:text-lg">
              {description || fallbackDescription}
            </p>
            <p className="mt-5 font-mono text-xs uppercase tracking-[0.16em] text-theme-text-tertiary">
              {t('postCount', { count: posts.length })}
            </p>
          </div>
        </motion.header>

        {posts.length > 0 ? (
          <ArticleGrid posts={posts} />
        ) : (
          <div className="rounded-[2rem] border border-dashed border-theme-border px-6 py-20 text-center">
            <p className="text-theme-text-secondary">{t('noPosts')}</p>
            <Link
              href="/archive"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-theme-accent-primary hover:underline"
            >
              {t('browseArchive')} <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
