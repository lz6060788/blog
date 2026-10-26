'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getSession } from 'next-auth/react'
import { analyticsPath } from '@/lib/analytics'
import { BlogAnalyticsReporter } from '@/lib/analytics-reporter'
import { getAnalyticsVisitor } from '@/lib/analytics-visitor'

function privateBrowsingPreference() {
  if (navigator.doNotTrack === '1' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true) return true
  try {
    return localStorage.getItem('blog.analytics.disabled') === 'true'
  } catch {
    return false
  }
}

/** The SDK sends one page entry; fingerprint components never enter its payload. */
export function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const path = analyticsPath(pathname)
    if (!path) return
    let cancelled = false
    let cleanup: (() => void) | undefined

    void (async () => {
      try {
        if (privateBrowsingPreference() || await getSession() || cancelled) return
        const visitor = getAnalyticsVisitor()
        const { Tracker } = await import('@irises/front-tracker-sdk')
        if (cancelled || privateBrowsingPreference()) return
        const reporter = new BlogAnalyticsReporter()
        const tracker = new Tracker({ appId: 'irises-blog', reporter, plugins: [], debug: false })
        const id = crypto.randomUUID()
        let submitted = false
        const submit = (visitorId: string | null) => {
          if (submitted || privateBrowsingPreference()) return
          submitted = true
          tracker.submit('action', { id, path, visitorId })
          void reporter.flush()
        }

        const flush = () => {
          if (privateBrowsingPreference()) reporter.stop()
          else {
            // A quick navigation must still count a read even before identification.
            submit(null)
            void reporter.flush(true)
          }
        }
        const visibility = () => { if (document.hidden) flush() }
        document.addEventListener('visibilitychange', visibility)
        window.addEventListener('pagehide', flush)
        cleanup = () => {
          flush()
          reporter.stop()
          document.removeEventListener('visibilitychange', visibility)
          window.removeEventListener('pagehide', flush)
        }
        const visitorId = await visitor
        if (!cancelled) submit(visitorId)
      } catch {
        // Restricted browser APIs or unavailable analytics never interrupt reading.
      }
    })()

    return () => { cancelled = true; cleanup?.() }
  }, [pathname])

  return null
}
