import { auth } from '@/server/auth'
import { getSiteUrl } from '@/lib/seo'
import { createAnalyticsHandler } from '@/server/analytics/ingestion'
import { allowAnalyticsRequest } from '@/server/analytics/rate-limit'
import { analyticsRepository } from '@/server/analytics/repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const POST = createAnalyticsHandler({
  siteOrigin: getSiteUrl(),
  isAuthenticated: async () => Boolean(await auth()),
  allowRequest: allowAnalyticsRequest,
  collect: (events) => analyticsRepository.collect(events),
})
