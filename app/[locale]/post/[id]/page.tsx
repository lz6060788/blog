import { notFound } from 'next/navigation'
import { Navigation } from '@/components/layout/header'
import { ArticleWrapper } from '@/components/public/posts'
import { getPost, getAllPublishedPostIds } from '@/server/db/queries/posts'
import type { Metadata } from 'next'

// 生成静态参数（用于 SSG）
export async function generateStaticParams() {
  try {
    const posts = await getAllPublishedPostIds()

    // 为每个 locale 生成文章路径
    return posts.flatMap((id) => [
      { locale: 'en', id },
      { locale: 'zh', id },
    ])
  } catch {
    // 首次部署且数据库尚未初始化时，避免构建阶段因缺表失败
    return []
  }
}

// 生成 SEO 元数据
export async function generateMetadata(
  { params }: { params: { id: string; locale: string } }
): Promise<Metadata> {
  const { id } = params
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
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  }
}

export default async function PostPage({
  params,
}: {
  params: { id: string; locale: string }
}) {
  const { id } = params
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
        coverImageUrl={post.coverImageUrl}
      />
    </>
  )
}
