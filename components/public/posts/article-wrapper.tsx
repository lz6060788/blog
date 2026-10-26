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
    <article className="article-reading-page min-h-screen pb-20 pt-28 sm:pt-36" data-article-reader>
      <div className="article-reading-column">
        {/* 封面图片 */}
        {coverImageUrl && (
          <div className="mb-12 overflow-hidden rounded-xl" style={{ maxHeight: '55vh' }}>
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
      </div>
      <div className="article-reading-layout">
        <div className="article-reading-column">
          {/* Content */}
          <div id="article-body" className="min-w-0" data-article-content>
            <ArticleContent content={content} />
          </div>

          {/* Footer */}
          <ArticleFooter
            previousPost={previousPost}
            nextPost={nextPost}
            relatedPosts={relatedPosts}
          />
        </div>
        <ArticleReaderTools contentKey={`${title}-${content.length}`} />
      </div>
    </article>
  )
}
