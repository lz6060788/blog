import { ArticleHeader } from './article-header'
import { ArticleContent } from './article-content'
import { ArticleFooter } from './article-footer'
import { ArticleCover } from '@/components/article'
import { ArticleReaderTools } from './article-reader-tools'
import type { PostSummary, Tag } from '@/lib/types'

interface ArticleWrapperProps {
  title: string
  excerpt: string
  category: string
  readTime: number
  date: string
  tags: string[]
  categorySlug?: string
  tagObjs?: Tag[]
  series?: { name: string; slug: string; position: number; total: number }
  content: string
  coverImageUrl?: string | null
  previousPost?: PostSummary
  nextPost?: PostSummary
  relatedPosts: PostSummary[]
}

export function ArticleWrapper({
  title,
  excerpt,
  category,
  readTime,
  date,
  tags,
  categorySlug,
  tagObjs,
  series,
  content,
  coverImageUrl,
  previousPost,
  nextPost,
  relatedPosts,
}: ArticleWrapperProps) {
  return (
    <article className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-6">
        {/* 封面图片 */}
        {coverImageUrl && (
          <div className="mb-8 overflow-hidden rounded-2xl shadow-lg" style={{ maxHeight: '60vh' }}>
            <ArticleCover
              src={coverImageUrl}
              alt={title}
              priority
              lazy={false}
              className="w-full"
            />
          </div>
        )}

        {/* Header */}
        <ArticleHeader
          title={title}
          excerpt={excerpt}
          category={category}
          readTime={readTime}
          date={date}
          tags={tags}
          categorySlug={categorySlug}
          tagObjs={tagObjs}
          series={series}
        />

        {/* Content */}
        <div className="max-w-none">
          <div className="rounded-[2rem] border border-theme-card bg-theme-card-bg p-5 shadow-card sm:p-8 md:p-12">
            <ArticleContent content={content} />
          </div>
        </div>

        {/* Footer */}
        <ArticleFooter
          previousPost={previousPost}
          nextPost={nextPost}
          relatedPosts={relatedPosts}
        />
      </div>
      <ArticleReaderTools />
    </article>
  )
}
