'use client'

import { Clock, Tag } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'

interface ArticleHeaderProps {
  title: string
  excerpt: string
  category: string
  readTime: number
  date: string
  tags: string[]
}

export function ArticleHeader({
  title,
  excerpt,
  category,
  readTime,
  date,
  tags,
}: ArticleHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      {/* Category */}
      <div className="flex items-center gap-4 mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-accent-bg text-theme-accent-primary text-sm font-medium">
          <Tag size={14} weight="fill" />
          {category}
        </span>
        <div className="flex items-center gap-1.5 text-theme-text-tertiary text-sm font-mono">
          <Clock size={14} />
          {readTime} min read
        </div>
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
        <span>{format(new Date(date), 'MMMM d, yyyy')}</span>
        <span>·</span>
        <div className="flex gap-2">
          {tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      </div>
    </motion.header>
  )
}
