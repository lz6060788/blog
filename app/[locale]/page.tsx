import Navigation from '@/components/Navigation'
import AuthorCard from '@/components/AuthorCard'
import TimelineList from '@/components/TimelineList'
import { author, posts } from '@/lib/data'
import { getTranslations } from 'next-intl/server'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const t = await getTranslations('home')

  return (
    <>
      <Navigation />

      <main className="min-h-screen pt-24 pb-16">
        {/* Hero Section - Asymmetric Split */}
        <section className="max-w-7xl mx-auto px-6 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Author Card */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <AuthorCard author={author} />
            </div>

            {/* Right: Content */}
            <div className="lg:col-span-8 lg:pl-8">
              {/* Hero Text */}
              <div className="mb-12">
                <h1 className="text-4xl md:text-6xl tracking-tighter leading-none text-theme-text-canvas mb-6">
                  Thoughts on
                  <br />
                  <span className="text-theme-text-tertiary">{t('title')}</span>
                </h1>
                <p className="text-lg text-theme-text-secondary leading-relaxed max-w-[65ch]">
                  {t('description')}
                </p>
              </div>

              {/* Timeline */}
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-sm font-mono text-theme-text-tertiary uppercase tracking-wider">
                    {t('latestPosts')}
                  </h2>
                  <div className="flex-1 h-px bg-theme-border" />
                </div>
                <TimelineList posts={posts} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
