import { z } from 'zod'

export const ANALYTICS_ENDPOINT = '/api/analytics/events'
export const MAX_ANALYTICS_BYTES = 24 * 1024
export const MAX_ANALYTICS_BATCH = 20

/** Only public, known route shapes enter analytics. Queries and fragments never do. */
export function analyticsPath(value: string): string | null {
  const path = value.split(/[?#]/, 1)[0].replace(/^\/(en|zh)(?=\/|$)/, '').replace(/\/+$/, '') || '/'
  if (['/', '/archive', '/series', '/lab/garden'].includes(path)) return path
  if (/^\/(post|category|tag|series)\/[a-zA-Z0-9_\-\u3400-\u9fff%]{1,160}$/.test(path)) return path
  return null
}

const id = z.string().uuid()
export const analyticsEventSchema = z.object({
  id,
  visitId: id,
  sessionId: id,
  type: z.enum(['pageview', 'engagement', 'click']),
  path: z.string().max(200).refine((value) => analyticsPath(value) === value, 'Invalid public path'),
  referrer: z.string().max(120).regex(/^(direct|internal|[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?)$/),
  device: z.enum(['mobile', 'tablet', 'desktop']),
  durationMs: z.number().int().min(0).max(4 * 60 * 60 * 1000).default(0),
  depth: z.number().int().min(0).max(100).default(0),
  target: z.enum(['article', 'navigation', 'external']).nullable().default(null),
}).strict().superRefine((event, context) => {
  if (event.type === 'engagement' && !event.path.startsWith('/post/')) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Reading events require an article' })
  }
  if (event.type !== 'engagement' && (event.durationMs !== 0 || event.depth !== 0)) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Unexpected reading metrics' })
  }
  if ((event.type === 'click') !== (event.target !== null)) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Unexpected click target' })
  }
})

export const analyticsBatchSchema = z.object({ events: z.array(analyticsEventSchema).min(1).max(MAX_ANALYTICS_BATCH) }).strict()
export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>

export function referrerDomain(referrer: string, origin: string): string {
  if (!referrer) return 'direct'
  try {
    const url = new URL(referrer)
    if (url.origin === origin) return 'internal'
    return /^[a-z0-9][a-z0-9.-]{0,119}$/.test(url.hostname) ? url.hostname : 'direct'
  } catch { return 'direct' }
}

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
  days: number
  total: { pageviews: number; visitors: number; articleViews: number; averageReadMs: number; averageDepth: number; clicks: number }
  daily: { date: string; pageviews: number; visitors: number }[]
  pages: { path: string; title: string | null; views: number; visitors: number; averageReadMs: number; averageDepth: number }[]
  referrers: { name: string; views: number }[]
  devices: { name: string; views: number }[]
  clicks: { name: string; count: number }[]
}
