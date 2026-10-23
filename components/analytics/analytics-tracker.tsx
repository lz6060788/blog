'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getSession } from 'next-auth/react'
import { analyticsPath, referrerDomain, type AnalyticsEvent } from '@/lib/analytics'
import { BlogAnalyticsReporter } from '@/lib/analytics-reporter'

const SESSION_KEY = 'blog.analytics.session'

function privateBrowsingPreference() {
  return navigator.doNotTrack === '1' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true || localStorage.getItem('blog.analytics.disabled') === 'true'
}

function anonymousSession() {
  const now = Date.now()
  try {
    const cached = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null')
    const sessionId = cached && typeof cached.id === 'string' && /^[0-9a-f-]{36}$/.test(cached.id) && now - cached.at < 30 * 60 * 1000 ? cached.id : crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id: sessionId, at: now }))
    return sessionId as string
  } catch { return crypto.randomUUID() }
}

/** Public routes only. No DOM text, form contents, link URLs or SDK baseInfo leave the browser. */
export function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const path = analyticsPath(pathname)
    if (!path) return
    let cancelled = false
    let cleanup: (() => void) | undefined

    void (async () => {
      try {
        if (privateBrowsingPreference()) return
        // Exclude every signed-in visitor, including the author previewing a public post.
        if (await getSession() || cancelled) return
        const { Tracker } = await import('@irises/front-tracker-sdk')
        if (cancelled) return
        const reporter = new BlogAnalyticsReporter()
        // The SDK singleton has no destroy API. A scoped instance avoids stale route data and timers.
        const tracker = new Tracker({ appId: 'irises-blog', reporter, plugins: [], debug: false })
        const sessionId = anonymousSession()
        const visitId = crypto.randomUUID()
        const readId = crypto.randomUUID()
        const base = {
          path, sessionId, visitId,
          referrer: referrerDomain(document.referrer, location.origin),
          device: (innerWidth < 768 ? 'mobile' : innerWidth < 1024 ? 'tablet' : 'desktop') as AnalyticsEvent['device'],
        }
        const submit = (event: Partial<AnalyticsEvent> & Pick<AnalyticsEvent, 'type' | 'id'>) => {
          if (cancelled) return
          if (privateBrowsingPreference()) { reporter.stop(); return }
          tracker.submit('action', { ...base, durationMs: 0, depth: 0, target: null, ...event })
        }
        submit({ id: visitId, type: 'pageview' })
        void reporter.flush()

        let durationMs = 0
        let depth = 0
        let visibleSince = document.hidden ? null : performance.now()
        const article = path.startsWith('/post/')
        const readDepth = () => {
          const content = document.querySelector('[data-article-content]') || document.querySelector('article')
          if (!content) return
          const bounds = content.getBoundingClientRect()
          depth = Math.max(depth, Math.min(100, Math.max(0, Math.round((innerHeight - bounds.top) / Math.max(bounds.height, 1) * 100))))
        }
        const checkpoint = () => {
          if (!article) return
          const now = performance.now()
          if (visibleSince !== null) durationMs = Math.min(14400000, durationMs + Math.max(0, now - visibleSince))
          visibleSince = document.hidden ? null : now
          readDepth()
          if (durationMs > 0) submit({ id: readId, type: 'engagement', durationMs: Math.round(durationMs), depth })
        }
        const visibility = () => { checkpoint(); if (document.hidden) void reporter.flush(true) }
        const pagehide = () => { checkpoint(); void reporter.flush(true) }
        let lastClick = 0
        const click = (event: MouseEvent) => {
          if (!(event.target instanceof Element) || Date.now() - lastClick < 700) return
          const anchor = event.target.closest('a[href]')
          if (!(anchor instanceof HTMLAnchorElement)) return
          let target: AnalyticsEvent['target'] = null
          try {
            const url = new URL(anchor.href)
            if (!['http:', 'https:'].includes(url.protocol)) return
            const destination = analyticsPath(url.pathname)
            if (url.origin !== location.origin) target = 'external'
            else if (destination?.startsWith('/post/')) target = 'article'
            else if (destination && destination !== path) target = 'navigation'
          } catch { return }
          if (target) { lastClick = Date.now(); submit({ id: crypto.randomUUID(), type: 'click', target }) }
        }
        const timer = setInterval(() => { checkpoint(); void reporter.flush() }, 15000)
        document.addEventListener('visibilitychange', visibility)
        document.addEventListener('click', click, { passive: true })
        window.addEventListener('pagehide', pagehide)
        if (article) window.addEventListener('scroll', readDepth, { passive: true })
        cleanup = () => {
          checkpoint()
          void reporter.flush(true)
          reporter.stop()
          clearInterval(timer)
          document.removeEventListener('visibilitychange', visibility)
          document.removeEventListener('click', click)
          window.removeEventListener('pagehide', pagehide)
          window.removeEventListener('scroll', readDepth)
        }
      } catch { /* Analytics must never interrupt reading or fail on restricted storage. */ }
    })()

    return () => { cleanup?.(); cancelled = true }
  }, [pathname])

  return null
}
