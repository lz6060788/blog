'use client'

import { useParams, useRouter } from 'next/navigation'
import { posts } from '@/lib/data'
import Navigation from '@/components/Navigation'
import { motion } from 'framer-motion'
import { Clock, Tag, ArrowLeft } from '@phosphor-icons/react'
import { format } from 'date-fns'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Link as IntlLink } from '@/app/i18n/routing'
import { CherryPreview } from '@/components/cherry-preview'
import { useTheme } from 'next-themes'

export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations()
  const { theme } = useTheme()
  const post = posts.find((p) => p.id === params.id)

  if (!post) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-theme-text-canvas mb-4">
              Post not found
            </h1>
            <IntlLink
              href="/"
              className="text-theme-text-secondary hover:text-theme-text-canvas transition-colors"
            >
              Return home
            </IntlLink>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />

      <motion.article
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen pt-24 pb-16"
      >
        <div className="max-w-4xl mx-auto px-6">
          {/* Back Button */}
          <motion.button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-theme-text-tertiary hover:text-theme-text-canvas transition-colors mb-8 group"
            whileHover={{ x: -4 }}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </motion.button>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            {/* Category */}
            <div className="flex items-center gap-4 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-accent-bg text-theme-accent-primary text-sm font-medium">
                <Tag size={14} weight="fill" />
                {post.category}
              </span>
              <div className="flex items-center gap-1.5 text-theme-text-tertiary text-sm font-mono">
                <Clock size={14} />
                {post.readTime} min read
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl tracking-tighter leading-none text-theme-text-canvas mb-6">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-theme-text-secondary leading-relaxed mb-6">
              {post.excerpt}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-theme-text-tertiary pt-6 border-t border-theme-border">
              <span>{format(new Date(post.date), 'MMMM d, yyyy')}</span>
              <span>·</span>
              <div className="flex gap-2">
                {post.tags.map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
            </div>
          </motion.header>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="prose prose-zinc prose-lg max-w-none"
          >
            <div className="bg-theme-card-bg rounded-[2rem] p-8 md:p-12 border border-theme-card shadow-card">
              <CherryPreview
                content={post.content}
                theme={(theme as 'light' | 'dark') || 'light'}
                className="cherry-preview-wrapper"
              />
            </div>
          </motion.div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-12 pt-8 border-t border-theme-border"
          >
            <IntlLink
              href="/"
              className="inline-flex items-center gap-2 text-theme-text-tertiary hover:text-theme-text-canvas transition-colors group"
            >
              <ArrowLeft size={16} />
              <span>Back to all posts</span>
            </IntlLink>
          </motion.footer>
        </div>
      </motion.article>
    </>
  )
}
