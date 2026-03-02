import { Navigation } from '@/components/layout/header'
import { ArchiveGrid, ArchiveHeader } from '@/components/public/archive'
import { getPublishedPosts } from '@/server/db/queries/posts'

export default async function ArchivePage() {
  // 从数据库获取已发布文章列表
  const posts = await getPublishedPosts()

  return (
    <>
      <Navigation />

      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Page Header */}
          <ArchiveHeader />

          {/* Archive Grid */}
          <ArchiveGrid posts={posts} />
        </div>
      </main>
    </>
  )
}
