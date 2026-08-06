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
          className="mb-12 pt-6 md:mb-16 md:pt-10"
        >
          <div className="mb-6 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.16em] text-theme-accent-primary">
            <span className="h-px w-8 bg-theme-accent-primary" />
            <div className="inline-flex items-center gap-2">
              <Icon size={14} weight="fill" />
              {t(kind)}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,30rem)] lg:items-end lg:gap-12">
            <h1 className="break-words text-5xl leading-[0.95] tracking-tighter text-theme-text-canvas sm:text-6xl md:text-7xl">
              {kind === 'tag' && <span className="mr-1 text-theme-accent-primary">#</span>}
              {name}
            </h1>
            <div className="lg:pb-1">
              <p className="max-w-[58ch] text-base leading-relaxed text-theme-text-secondary sm:text-lg">
                {description || fallbackDescription}
              </p>
            </div>
          </div>

          <div className="mt-9 flex items-center gap-4 border-t border-theme-border pt-4">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-theme-text-tertiary">
              {t('postCount', { count: posts.length })}
            </p>
            <span className="h-1 w-1 rounded-full bg-theme-accent-primary" />
            <Link href="/archive" className="text-xs text-theme-text-tertiary transition-colors hover:text-theme-accent-primary">
              {t('browseArchive')}
            </Link>
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
