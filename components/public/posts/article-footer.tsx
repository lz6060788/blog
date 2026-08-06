'use client'

import { ArrowLeft, ArrowRight, Clock } from '@phosphor-icons/react'
import { Link as IntlLink } from '@/app/i18n/routing'
import { useTranslations } from 'next-intl'
import type { PostSummary } from '@/lib/types'

interface ArticleFooterProps {
  previousPost?: PostSummary
  nextPost?: PostSummary
  relatedPosts: PostSummary[]
}

export function ArticleFooter({
  previousPost,
  nextPost,
  relatedPosts,
}: ArticleFooterProps) {
  const t = useTranslations('article')
  const hasNavigation = previousPost || nextPost

  return (
    <footer className="mt-12 space-y-10 border-t border-theme-border pt-10">
      {hasNavigation && (
        <section aria-labelledby="article-navigation-heading">
          <p id="article-navigation-heading" className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-theme-text-tertiary">
            {t('continueReading')}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {previousPost && (
              <IntlLink
                href={`/post/${previousPost.id}`}
                className="group rounded-2xl border border-theme-border bg-theme-card-bg p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-theme-accent-primary/40 hover:shadow-card"
              >
                <span className="mb-3 flex items-center gap-2 text-sm text-theme-text-tertiary">
                  <ArrowLeft size={16} />
                  {t('previousPost')}
                </span>
                <span className="line-clamp-2 text-lg font-medium leading-snug text-theme-text-canvas transition-colors group-hover:text-theme-accent-primary">
                  {previousPost.title}
                </span>
              </IntlLink>
            )}
            {nextPost && (
              <IntlLink
                href={`/post/${nextPost.id}`}
                className={`group rounded-2xl border border-theme-border bg-theme-card-bg p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-theme-accent-primary/40 hover:shadow-card md:text-right ${previousPost ? '' : 'md:col-start-2'}`}
              >
                <span className="mb-3 flex items-center gap-2 text-sm text-theme-text-tertiary md:justify-end">
                  {t('nextPost')}
                  <ArrowRight size={16} />
                </span>
                <span className="line-clamp-2 text-lg font-medium leading-snug text-theme-text-canvas transition-colors group-hover:text-theme-accent-primary">
                  {nextPost.title}
                </span>
              </IntlLink>
            )}
          </div>
        </section>
      )}

      {relatedPosts.length > 0 && (
        <section aria-labelledby="related-posts-heading">
          <h2 id="related-posts-heading" className="mb-4 text-2xl font-semibold tracking-tight text-theme-text-canvas">
            {t('relatedPosts')}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedPosts.map((post) => (
              <IntlLink
                key={post.id}
                href={`/post/${post.id}`}
                className="group rounded-2xl border border-theme-border bg-theme-surface p-5 transition-colors hover:border-theme-accent-primary/40 hover:bg-theme-card-bg"
              >
                <span className="mb-3 block text-xs font-medium text-theme-accent-primary">
                  {post.category}
                </span>
                <span className="line-clamp-3 block font-medium leading-snug text-theme-text-canvas transition-colors group-hover:text-theme-accent-primary">
                  {post.title}
                </span>
                <span className="mt-4 flex items-center gap-1.5 text-xs text-theme-text-tertiary">
                  <Clock size={14} />
                  {t('minutesRead', { count: post.readTime })}
                </span>
              </IntlLink>
            ))}
          </div>
        </section>
      )}

      <div className="border-t border-theme-border pt-8">
        <IntlLink
          href="/archive"
          className="inline-flex items-center gap-2 text-theme-text-tertiary transition-colors hover:text-theme-text-canvas"
        >
          <ArrowLeft size={16} />
          <span>{t('backToAllPosts')}</span>
        </IntlLink>
      </div>
    </footer>
  )
}
