import { Navigation } from '@/components/layout/header'
import { ArchiveExplorer, ArchiveHeader } from '@/components/public/archive'
import { getPublishedPosts } from '@/server/db/queries/posts'
import type { Metadata } from 'next'
import { absoluteUrl, languageAlternates, localizedPath, localeToOpenGraph } from '@/lib/seo'

export const revalidate = 300

export function generateMetadata({
  params,
}: {
  params: { locale: string }
}): Metadata {
  const isChinese = params.locale === 'zh'
  const title = isChinese ? '文章归档' : 'Archive'
  const description = isChinese
    ? '按时间浏览 Irises Blog 的全部技术文章。'
    : 'Browse all technical articles from Irises Blog by publication date.'
  const url = absoluteUrl(localizedPath(params.locale, '/archive'))

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates('/archive'),
    },
    openGraph: {
      title,
      description,
      url,
      locale: localeToOpenGraph(params.locale),
    },
  }
}

export default async function ArchivePage() {
  // 从数据库获取已发布文章列表
  const posts = await getPublishedPosts()

  return (
    <>
      <Navigation />

      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Page Header */}
          <ArchiveHeader />

          {/* Year and month archive explorer */}
          <ArchiveExplorer posts={posts} />
        </div>
      </main>
    </>
  )
}
