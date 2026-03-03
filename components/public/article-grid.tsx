'use client'

import { Post } from '@/lib/types'
import { motion } from 'framer-motion'
import { ArticleCoverCard } from '@/components/article'

interface ArticleGridProps {
  posts: Post[]
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  },
}

export function ArticleGrid({ posts }: ArticleGridProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {posts.map((post) => (
        <motion.div
          key={post.id}
          variants={item}
          className="group"
        >
          <ArticleCoverCard
            articleId={post.id}
            slug={post.id}
            coverUrl={post.coverImageUrl}
            title={post.title}
            excerpt={post.excerpt}
            priority={false}
            clickable="link"
          />

          {/* Article Info */}
          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-semibold tracking-tight text-theme-text-canvas group-hover:text-theme-accent-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
            <p className="text-sm text-theme-text-secondary line-clamp-2">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-3 text-xs text-theme-text-tertiary">
              <span className="px-2 py-1 rounded bg-theme-bg-surface-alt font-medium">
                {post.category}
              </span>
              <span>•</span>
              <span>{post.readTime} min read</span>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
