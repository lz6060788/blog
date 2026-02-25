'use client'

import { Post } from '@/lib/types'
import { motion } from 'framer-motion'
import Link from 'next/link'
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
      <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-zinc-200/50" />

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
                <div className="w-14 h-14 rounded-full bg-white border-4 border-zinc-100 flex items-center justify-center group-hover:border-zinc-900 transition-colors">
                  <span className="text-xs font-mono font-bold text-zinc-400 group-hover:text-zinc-900 transition-colors">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
              </motion.div>

              {/* Card */}
              <Link href={`/post/${post.id}`} className="flex-1 block">
                <motion.div
                  className="bg-white rounded-[2rem] p-8 border border-zinc-200/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-shadow h-full"
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Meta Row */}
                  <div className="flex items-center gap-4 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                      <Tag size={12} weight="fill" />
                      {post.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono">
                      <Clock size={12} />
                      {post.readTime} min read
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-semibold tracking-tight text-zinc-900 mb-3 group-hover:text-zinc-600 transition-colors">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-base text-zinc-500 leading-relaxed mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg bg-zinc-50 text-zinc-500 text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Date */}
                  <div className="text-xs font-mono text-zinc-400">
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
