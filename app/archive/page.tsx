import Navigation from '@/components/Navigation'
import ArchiveGrid from '@/components/ArchiveGrid'
import { posts } from '@/lib/data'
import ArchiveHeader from '@/components/ArchiveHeader'

export default function ArchivePage() {
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
