'use client'

import { Post } from '@/lib/types'
import { motion } from 'framer-motion'
import { Clock, Tag } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { Link } from '@/app/i18n/routing'

interface ArchiveGridProps {
  posts: Post[]
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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

export default function ArchiveGrid({ posts }: ArchiveGridProps) {
  const groupedPosts = posts.reduce((acc, post) => {
    const year = new Date(post.date).getFullYear()
    if (!acc[year]) acc[year] = []
    acc[year].push(post)
    return acc
  }, {} as Record<number, Post[]>)

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-16"
    >
      {Object.entries(groupedPosts)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([year, yearPosts]) => (
          <motion.div key={year} variants={item}>
            {/* Year Header */}
            <motion.div
              className="flex items-baseline gap-6 mb-8"
              variants={item}
            >
              <h2 className="text-6xl md:text-8xl font-bold tracking-tighter text-theme-text-disabled">
                {year}
              </h2>
              <div className="flex-1 h-px bg-theme-border" />
              <span className="text-sm font-mono text-theme-text-tertiary">
                {yearPosts.length} {yearPosts.length === 1 ? '篇文章' : '篇文章'}
              </span>
            </motion.div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {yearPosts.map((post) => (
                <motion.div
                  key={post.id}
                  variants={item}
                  whileHover={{ y: -4 }}
                >
                  <Link href={`/post/${post.id}`} className="block h-full">
                    <motion.div
                      className="bg-theme-card-bg rounded-[2rem] p-6 border border-theme-card shadow-card hover:shadow-lg transition-all h-full"
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Category Badge */}
                      <div className="mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-accent-bg text-theme-accent-primary text-xs font-medium">
                          <Tag size={12} weight="fill" />
                          {post.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-semibold tracking-tight text-theme-text-canvas mb-3 line-clamp-2">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-sm text-theme-text-secondary leading-relaxed mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center justify-between text-xs font-mono text-theme-text-tertiary pt-4 border-t border-theme-border-muted">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} />
                          {post.readTime} min
                        </div>
                        <span>{format(new Date(post.date), 'MMM d')}</span>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
    </motion.div>
  )
}
