'use client'

import { motion } from 'framer-motion'
import { ArticleHeader } from '@/components/article-header'
import { ArticleContent } from '@/components/article-content'
import { ArticleFooter } from '@/components/article-footer'

interface ArticleWrapperProps {
  title: string
  excerpt: string
  category: string
  readTime: number
  date: string
  tags: string[]
  content: string
}

export function ArticleWrapper({
  title,
  excerpt,
  category,
  readTime,
  date,
  tags,
  content,
}: ArticleWrapperProps) {
  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-24 pb-16"
    >
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <ArticleHeader
          title={title}
          excerpt={excerpt}
          category={category}
          readTime={readTime}
          date={date}
          tags={tags}
        />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="prose prose-zinc prose-lg max-w-none"
        >
          <div className="bg-theme-card-bg rounded-[2rem] p-8 md:p-12 border border-theme-card shadow-card">
            <ArticleContent content={content} initialTheme="light" />
          </div>
        </motion.div>

        {/* Footer */}
        <ArticleFooter />
      </div>
    </motion.article>
  )
}
