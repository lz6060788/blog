import { notFound } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { ArticleWrapper } from '@/components/article-wrapper'
import { getPost } from '@/server/db/queries/posts'
import type { Metadata } from 'next'

// 生成 SEO 元数据
export async function generateMetadata(
  { params }: { params: Promise<{ id: string; locale: string }> }
): Promise<Metadata> {
  const { id } = await params
  const post = await getPost(id)

  if (!post) {
    return {
      title: '文章未找到 - Blog',
    }
  }

  return {
    title: `${post.title} - Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
    },
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id } = await params
  const post = await getPost(id)

  // 文章不存在时返回 404
  if (!post) {
    notFound()
  }

  return (
    <>
      <Navigation />
      <ArticleWrapper
        title={post.title}
        excerpt={post.excerpt}
        category={post.category}
        readTime={post.readTime}
        date={post.date}
        tags={post.tags}
        content={post.content}
      />
    </>
  )
}
