import { notFound } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { ArticleWrapper } from '@/components/article-wrapper'
import { getPost, getAllPublishedPostIds } from '@/server/db/queries/posts'
import type { Metadata } from 'next'

// ISR 配置：每 1 小时重新验证一次
export const revalidate = 3600

// 生成静态参数（用于 SSG）
export async function generateStaticParams() {
  const posts = await getAllPublishedPostIds()

  // 为每个 locale 生成文章路径
  return posts.flatMap((id) => [
    { locale: 'en', id },
    { locale: 'zh', id },
  ])
}

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
