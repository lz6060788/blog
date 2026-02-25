import Navigation from '@/components/Navigation'
import AuthorCard from '@/components/AuthorCard'
import TimelineList from '@/components/TimelineList'
import { author, posts } from '@/lib/data'

export default function HomePage() {
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
                <h1 className="text-4xl md:text-6xl tracking-tighter leading-none text-zinc-900 mb-6">
                  Thoughts on
                  <br />
                  <span className="text-zinc-400">Design & Code</span>
                </h1>
                <p className="text-lg text-zinc-500 leading-relaxed max-w-[65ch]">
                  Exploring the intersection of creativity and technology.
                  Writing about frontend development, UI design, and the craft
                  of building digital experiences.
                </p>
              </div>

              {/* Timeline */}
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-sm font-mono text-zinc-400 uppercase tracking-wider">
                    Recent Posts
                  </h2>
                  <div className="flex-1 h-px bg-zinc-200" />
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
