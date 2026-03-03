'use client'

import { motion } from 'framer-motion'
import { ArticleHeader } from './article-header'
import { ArticleContent } from './article-content'
import { ArticleFooter } from './article-footer'
import { ArticleCover } from '@/components/article'

interface ArticleWrapperProps {
  title: string
  excerpt: string
  category: string
  readTime: number
  date: string
  tags: string[]
  content: string
  coverImageUrl?: string | null
}

export function ArticleWrapper({
  title,
  excerpt,
  category,
  readTime,
  date,
  tags,
  content,
  coverImageUrl,
}: ArticleWrapperProps) {
  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-24 pb-16"
    >
      <div className="max-w-4xl mx-auto px-6">
        {/* 封面图片 */}
        {coverImageUrl && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8 rounded-2xl overflow-hidden shadow-lg"
            style={{ maxHeight: '60vh' }}
          >
            <ArticleCover
              src={coverImageUrl}
              alt={title}
              priority
              lazy={false}
              className="w-full"
            />
          </motion.div>
        )}

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
