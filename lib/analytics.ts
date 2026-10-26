import { z } from 'zod'

export const ANALYTICS_ENDPOINT = '/api/analytics/events'
export const MAX_ANALYTICS_BYTES = 24 * 1024
export const MAX_ANALYTICS_BATCH = 20

/** Only public, known route shapes enter analytics. Queries and fragments never do. */
export function analyticsPath(value: string): string | null {
  const path = value.split(/[?#]/, 1)[0].replace(/^\/(en|zh)(?=\/|$)/, '').replace(/\/+$/, '') || '/'
  if (['/', '/archive', '/series', '/lab/garden', '/music-player-demo'].includes(path)) return path
  if (/^\/(post|category|tag|series)\/[a-zA-Z0-9_\-\u3400-\u9fff%]{1,160}$/.test(path)) return path
  return null
}

const id = z.string().uuid()
export const analyticsEventSchema = z.object({
  id,
  path: z.string().max(200).refine((value) => analyticsPath(value) === value, 'Invalid public path'),
  visitorId: z.string().regex(/^[0-9a-f]{32}$/).nullable(),
}).strict()

export const analyticsBatchSchema = z.object({ events: z.array(analyticsEventSchema).min(1).max(MAX_ANALYTICS_BATCH) }).strict()
export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>

/** Server-only storage contract. The browser identifier is never persisted. */
export interface AnalyticsPageview { id: string; path: string; visitorHash: string | null }

export function analyticsRange(days: number, now = new Date()) {
  const count = [7, 30, 90].includes(days) ? days : 30
  // Reports use the blog's documented timezone, independent of the host timezone.
  const offset = 8 * 60 * 60 * 1000
  const end = new Date(Math.floor((now.getTime() + offset) / 86400000) * 86400000 - offset + 86400000)
  const start = new Date(end.getTime() - count * 86400000)
  const dates = Array.from({ length: count }, (_, index) => new Date(start.getTime() + offset + index * 86400000).toISOString().slice(0, 10))
  return { days: count, start, end, dates }
}

export interface AnalyticsReport {
  days: 30
  allTime: { articleViews: number; visitors: number }
  total: { articleViews: number; visitors: number }
  daily: { date: string; articleViews: number; visitors: number }[]
  articles: { id: string; title: string; path: string; views: number; views30d: number; daily: { date: string; views: number }[] }[]
  visitorSince: string | null
}
