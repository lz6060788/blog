import { notFound } from 'next/navigation'
import { Navigation } from '@/components/layout/header'
import { ArticleWrapper } from '@/components/public/posts'
import { getPost, getAllPublishedPostIds, getPublishedPosts } from '@/server/db/queries/posts'
import type { Metadata } from 'next'
import { getSettings } from '@/server/db/queries/settings'
import { absoluteUrl, languageAlternates, localizedPath, localeToOpenGraph } from '@/lib/seo'

export const revalidate = 300

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
  const [post, settings] = await Promise.all([getPost(id), getSettings()])

  if (!post) {
    return {
      title: params.locale === 'zh' ? '文章未找到' : 'Post not found',
    }
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: absoluteUrl(localizedPath(params.locale, `/post/${id}`)),
      languages: languageAlternates(`/post/${id}`),
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: absoluteUrl(localizedPath(params.locale, `/post/${id}`)),
      siteName: settings.blogName,
      locale: localeToOpenGraph(params.locale),
      publishedTime: post.date,
      modifiedTime: post.updatedAt,
      section: post.category,
      tags: post.tags,
      images: post.coverImageUrl ? [absoluteUrl(post.coverImageUrl)] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.coverImageUrl ? [absoluteUrl(post.coverImageUrl)] : undefined,
    },
  }
}

export default async function PostPage({
  params,
}: {
  params: { id: string; locale: string }
}) {
  const { id } = params
  const [post, settings, publishedPosts] = await Promise.all([
    getPost(id),
    getSettings(),
    getPublishedPosts(),
  ])

  // 文章不存在时返回 404
  if (!post) {
    notFound()
  }

  const navigationPosts = post.seriesId
    ? publishedPosts
        .filter((publishedPost) => publishedPost.seriesId === post.seriesId)
        .sort((a, b) => (a.seriesOrder ?? Number.MAX_SAFE_INTEGER) - (b.seriesOrder ?? Number.MAX_SAFE_INTEGER))
    : publishedPosts
  const currentIndex = navigationPosts.findIndex((publishedPost) => publishedPost.id === post.id)
  const previousPost = currentIndex > 0 ? navigationPosts[currentIndex - 1] : undefined
  const nextPost = currentIndex >= 0 ? navigationPosts[currentIndex + 1] : undefined
  const navigationIds = new Set([previousPost?.id, nextPost?.id].filter(Boolean))
  const relatedPosts = publishedPosts
    .filter((candidate) => candidate.id !== post.id && !navigationIds.has(candidate.id))
    .map((candidate, index) => ({
      candidate,
      index,
      score:
        (candidate.categoryId && candidate.categoryId === post.categoryId ? 4 : 0) +
        candidate.tags.filter((tag) => post.tags.includes(tag)).length * 2,
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 3)
    .map(({ candidate }) => candidate)

  const articleUrl = absoluteUrl(localizedPath(params.locale, `/post/${id}`))
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImageUrl ? [absoluteUrl(post.coverImageUrl)] : undefined,
    datePublished: post.date,
    dateModified: post.updatedAt || post.date,
    mainEntityOfPage: articleUrl,
    author: {
      '@type': 'Person',
      name: settings.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: settings.blogName,
    },
    articleSection: post.category,
    keywords: post.tags.join(', '),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <Navigation />
      <ArticleWrapper
        title={post.title}
        excerpt={post.excerpt}
        category={post.category}
        readTime={post.readTime}
        date={post.date}
        tags={post.tags}
        categorySlug={post.categoryObj?.slug}
        tagObjs={post.tagObjs}
        series={post.seriesObj ? {
          name: post.seriesObj.name,
          slug: post.seriesObj.slug,
          position: currentIndex + 1,
          total: navigationPosts.length,
        } : undefined}
        content={post.content}
        coverImageUrl={post.coverImageUrl}
        previousPost={previousPost}
        nextPost={nextPost}
        relatedPosts={relatedPosts}
      />
    </>
  )
}
