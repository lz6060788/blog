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
    <article className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* 封面图片 */}
        {coverImageUrl && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-lg" style={{ maxHeight: '60vh' }}>
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
        />

        {/* Content */}
        <div className="prose prose-zinc prose-lg max-w-none">
          <div className="bg-theme-card-bg rounded-[2rem] p-8 md:p-12 border border-theme-card shadow-card">
            <ArticleContent content={content} />
          </div>
        </div>

        {/* Footer */}
        <ArticleFooter />
      </div>
    </article>
  )
}
