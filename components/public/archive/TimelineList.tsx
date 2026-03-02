'use client'

import { Post } from '@/lib/types'
import { motion } from 'framer-motion'
import { Link } from '@/app/i18n/routing'
import { Clock, Tag } from '@phosphor-icons/react'
import { format } from 'date-fns'

interface TimelineListProps {
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
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  },
}

export default function TimelineList({ posts }: TimelineListProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative"
    >
      {/* Timeline Line */}
      <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-theme-border" style={{ opacity: 0.5 }} />

      <div className="space-y-8">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            variants={item}
            className="relative flex gap-6 group"
          >
            {/* Timeline Dot */}
            <motion.div
              className="relative z-10 flex-shrink-0"
              whileHover={{ scale: 1.2 }}
            >
              <div className="w-14 h-14 rounded-full bg-theme-bg-surface border-4 border-theme-bg-surface-alt flex items-center justify-center group-hover:border-theme-text-canvas transition-colors">
                <span className="text-xs font-mono font-bold text-theme-text-tertiary group-hover:text-theme-text-canvas transition-colors">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
            </motion.div>

            {/* Card */}
            <Link href={`/post/${post.id}`} className="flex-1 block">
              <motion.div
                className="bg-theme-card-bg rounded-[2rem] p-8 border border-theme-card shadow-card group-hover:shadow-lg transition-shadow h-full"
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Meta Row */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-accent-bg text-theme-accent-primary text-xs font-medium">
                    <Tag size={12} weight="fill" />
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-theme-text-tertiary text-xs font-mono">
                    <Clock size={12} />
                    {post.readTime} min read
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-semibold tracking-tight text-theme-text-canvas mb-3 group-hover:text-theme-text-secondary transition-colors">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-base text-theme-text-secondary leading-relaxed mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-theme-bg-surface-alt text-theme-text-secondary text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Date */}
                <div className="text-xs font-mono text-theme-text-tertiary">
                  {format(new Date(post.date), 'MMMM d, yyyy')}
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
