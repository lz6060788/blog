import { and, eq, gte, lt, sql } from 'drizzle-orm'
import { db } from '@/server/db'
import { analyticsEvents, posts } from '@/server/db/schema'
import { analyticsRange, type AnalyticsEvent, type AnalyticsReport } from '@/lib/analytics'

export class AnalyticsRepository {
  constructor(private database = db) {}

  async collect(events: AnalyticsEvent[]) {
    await this.database.transaction(async (tx) => {
      // Idempotent IDs make fetch/beacon retries safe. Only cumulative engagement can grow.
      for (const event of events) {
        await tx.insert(analyticsEvents).values(event).onConflictDoUpdate({
          target: analyticsEvents.id,
          set: {
            durationMs: sql`greatest(${analyticsEvents.durationMs}, excluded.duration_ms)`,
            depth: sql`greatest(${analyticsEvents.depth}, excluded.depth)`,
          },
          setWhere: and(
            eq(analyticsEvents.type, 'engagement'), sql`excluded.type = 'engagement'`,
            sql`${analyticsEvents.sessionId} = excluded.session_id`, sql`${analyticsEvents.visitId} = excluded.visit_id`,
            sql`${analyticsEvents.path} = excluded.path`,
          ),
        })
      }
    })
  }

  async report(days: number, now = new Date()): Promise<AnalyticsReport> {
    const range = analyticsRange(days, now)
    const where = and(gte(analyticsEvents.createdAt, range.start), lt(analyticsEvents.createdAt, range.end))
    const views = and(where, eq(analyticsEvents.type, 'pageview'))
    const [totals, dailyRows, pageRows, referrers, devices, clicks] = await Promise.all([
      this.database.select({
        pageviews: sql<number>`count(*) filter (where type = 'pageview')::int`,
        visitors: sql<number>`count(distinct session_id) filter (where type = 'pageview')::int`,
        articleViews: sql<number>`count(*) filter (where type = 'pageview' and path like '/post/%')::int`,
        averageReadMs: sql<number>`coalesce(round(avg(duration_ms) filter (where type = 'engagement')), 0)::int`,
        averageDepth: sql<number>`coalesce(round(avg(depth) filter (where type = 'engagement')), 0)::int`,
        clicks: sql<number>`count(*) filter (where type = 'click')::int`,
      }).from(analyticsEvents).where(where),
      this.database.select({
        date: sql<string>`to_char(created_at at time zone 'Asia/Shanghai', 'YYYY-MM-DD')`,
        pageviews: sql<number>`count(*)::int`, visitors: sql<number>`count(distinct session_id)::int`,
      }).from(analyticsEvents).where(views).groupBy(sql`to_char(created_at at time zone 'Asia/Shanghai', 'YYYY-MM-DD')`),
      this.database.select({
        path: analyticsEvents.path, title: sql<string | null>`max(${posts.title})`,
        views: sql<number>`count(*) filter (where ${analyticsEvents.type} = 'pageview')::int`,
        visitors: sql<number>`count(distinct ${analyticsEvents.sessionId}) filter (where ${analyticsEvents.type} = 'pageview')::int`,
        averageReadMs: sql<number>`coalesce(round(avg(${analyticsEvents.durationMs}) filter (where ${analyticsEvents.type} = 'engagement')), 0)::int`,
        averageDepth: sql<number>`coalesce(round(avg(${analyticsEvents.depth}) filter (where ${analyticsEvents.type} = 'engagement')), 0)::int`,
      }).from(analyticsEvents).leftJoin(posts, and(eq(posts.published, true), sql`${analyticsEvents.path} = '/post/' || ${posts.id}`))
        .where(where).groupBy(analyticsEvents.path).having(sql`count(*) filter (where ${analyticsEvents.type} = 'pageview') > 0`)
        .orderBy(sql`count(*) filter (where ${analyticsEvents.type} = 'pageview') desc`).limit(10),
      this.database.select({ name: analyticsEvents.referrer, views: sql<number>`count(*)::int` }).from(analyticsEvents).where(views).groupBy(analyticsEvents.referrer).orderBy(sql`count(*) desc`).limit(8),
      this.database.select({ name: analyticsEvents.device, views: sql<number>`count(*)::int` }).from(analyticsEvents).where(views).groupBy(analyticsEvents.device).orderBy(sql`count(*) desc`),
      this.database.select({ name: sql<string>`target`, count: sql<number>`count(*)::int` }).from(analyticsEvents).where(and(where, eq(analyticsEvents.type, 'click'))).groupBy(analyticsEvents.target).orderBy(sql`count(*) desc`),
    ])
    const dailyMap = new Map(dailyRows.map((row) => [row.date, row]))
    return { days: range.days, total: totals[0], daily: range.dates.map((date) => dailyMap.get(date) || { date, pageviews: 0, visitors: 0 }), pages: pageRows, referrers, devices, clicks }
  }
}

export const analyticsRepository = new AnalyticsRepository()
