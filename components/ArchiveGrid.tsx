'use client'

import { Post } from '@/lib/types'
import { motion } from 'framer-motion'
import { Clock, Tag } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { Link } from '@/app/i18n/routing'
import { useLocale } from 'next-intl'

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
              <h2 className="text-6xl md:text-8xl font-bold tracking-tighter text-zinc-100">
                {year}
              </h2>
              <div className="flex-1 h-px bg-zinc-200" />
              <span className="text-sm font-mono text-zinc-400">
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
                      className="bg-white rounded-[2rem] p-6 border border-zinc-200/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all h-full"
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Category Badge */}
                      <div className="mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                          <Tag size={12} weight="fill" />
                          {post.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-semibold tracking-tight text-zinc-900 mb-3 line-clamp-2">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-sm text-zinc-500 leading-relaxed mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-4 border-t border-zinc-100">
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
