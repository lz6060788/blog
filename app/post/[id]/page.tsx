'use client'

import { useParams, useRouter } from 'next/navigation'
import { posts } from '@/lib/data'
import Navigation from '@/components/Navigation'
import { motion } from 'framer-motion'
import { Clock, Tag, ArrowLeft } from '@phosphor-icons/react'
import { format } from 'date-fns'
import Link from 'next/link'

export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const post = posts.find((p) => p.id === params.id)

  if (!post) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-zinc-900 mb-4">
              Post not found
            </h1>
            <Link
              href="/"
              className="text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Return home
            </Link>
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
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-900 transition-colors mb-8 group"
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium">
                <Tag size={14} weight="fill" />
                {post.category}
              </span>
              <div className="flex items-center gap-1.5 text-zinc-400 text-sm font-mono">
                <Clock size={14} />
                {post.readTime} min read
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl tracking-tighter leading-none text-zinc-900 mb-6">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-zinc-500 leading-relaxed mb-6">
              {post.excerpt}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-zinc-400 pt-6 border-t border-zinc-200">
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
            <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-zinc-200/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
              <div className="space-y-6 text-zinc-700 leading-relaxed">
                {post.content.split('\n').map((paragraph, index) => {
                  // Handle headings
                  if (paragraph.startsWith('# ')) {
                    return (
                      <h2
                        key={index}
                        className="text-2xl font-semibold text-zinc-900 mt-8 mb-4"
                      >
                        {paragraph.replace('# ', '')}
                      </h2>
                    )
                  }
                  if (paragraph.startsWith('## ')) {
                    return (
                      <h3
                        key={index}
                        className="text-xl font-semibold text-zinc-900 mt-6 mb-3"
                      >
                        {paragraph.replace('## ', '')}
                      </h3>
                    )
                  }

                  // Handle code blocks
                  if (paragraph.startsWith('```')) {
                    return null
                  }
                  if (paragraph.startsWith('    ') || paragraph.startsWith('\t')) {
                    return (
                      <pre
                        key={index}
                        className="bg-zinc-900 text-zinc-100 rounded-xl p-4 overflow-x-auto"
                      >
                        <code>{paragraph.trim()}</code>
                      </pre>
                    )
                  }

                  // Handle lists
                  if (paragraph.match(/^\d+\./)) {
                    return (
                      <li key={index} className="ml-4">
                        {paragraph.replace(/^\d+\.\s*/, '')}
                      </li>
                    )
                  }
                  if (paragraph.startsWith('- ')) {
                    return (
                      <li key={index} className="ml-4">
                        {paragraph.replace('- ', '')}
                      </li>
                    )
                  }

                  // Handle regular paragraphs
                  if (paragraph.trim()) {
                    return (
                      <p
                        key={index}
                        className="text-zinc-700 leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    )
                  }

                  return null
                })}
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-12 pt-8 border-t border-zinc-200"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors group"
            >
              <ArrowLeft size={16} />
              <span>Back to all posts</span>
            </Link>
          </motion.footer>
        </div>
      </motion.article>
    </>
  )
}
