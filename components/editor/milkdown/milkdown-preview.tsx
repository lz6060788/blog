import { getLocale } from 'next-intl/server'
import { getPublishedPosts } from '@/server/db/queries/posts'
import { renderArticleMarkdown } from '@/lib/article-markdown'

export interface MilkdownPreviewProps {
  content: string
  className?: string
}

export const renderMarkdownToHtml = async (content: string) => {
  const ids = new Set(Array.from(content.matchAll(/\]\(post:([0-9a-f-]{36})\)/gi), (match) => match[1]))
  const [locale, publishedPosts] = await Promise.all([
    getLocale(),
    ids.size ? getPublishedPosts() : Promise.resolve([]),
  ])
  const internalPosts = new Map(publishedPosts.filter((post) => ids.has(post.id)).map((post) => [post.id, {
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    readTime: post.readTime,
  }]))
  return renderArticleMarkdown(content, { locale, internalPosts })
}

export async function MilkdownPreview({ content, className = '' }: MilkdownPreviewProps) {
  const html = await renderMarkdownToHtml(content)
  return (
    <div className={`markdown-article-wrapper ${className}`}>
      <div className="markdown-article" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
