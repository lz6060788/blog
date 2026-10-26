import { and, eq, inArray, sql } from 'drizzle-orm'
import { db } from '@/server/db'
import { analyticsPageviews, posts } from '@/server/db/schema'
import { analyticsRange, type AnalyticsPageview, type AnalyticsReport } from '@/lib/analytics'

// New rows take precedence on historical ID collisions. Historical sessions never
// become fingerprint visitors; historical click and engagement rows are ignored.
const pageviews = sql`pageviews as (
  select id, path, created_at from analytics_pageviews
  union all
  select old.id, old.path, old.created_at from analytics_events old
  where old.type = 'pageview' and not exists (select 1 from analytics_pageviews current where current.id = old.id)
)`

export class AnalyticsRepository {
  constructor(private database = db) {}

  async collect(events: AnalyticsPageview[]) {
    if (!events.length) return
    await this.database.transaction(async (tx) => {
      const articleIds = Array.from(new Set(events.filter((event) => event.path.startsWith('/post/')).map((event) => event.path.slice(6))))
      const published = articleIds.length ? await tx.select({ id: posts.id }).from(posts).where(and(eq(posts.published, true), inArray(posts.id, articleIds))) : []
      const publicPaths = new Set(published.map((post) => `/post/${post.id}`))
      const accepted = events.filter((event) => !event.path.startsWith('/post/') || publicPaths.has(event.path))
      // Retries cannot change the first path, timestamp or fingerprint for an event.
      if (accepted.length) await tx.insert(analyticsPageviews).values(accepted).onConflictDoNothing({ target: analyticsPageviews.id })
    })
  }

  async report(_days = 30, now = new Date()): Promise<AnalyticsReport> {
    const range = analyticsRange(30, now)
    const start = range.start.toISOString(), end = range.end.toISOString()
    const [totals, dailyRows, articleRows, articleDailyRows] = await Promise.all([
      this.database.execute<{ articleViews: number; visitors: number; allTimeArticleViews: number; allTimeVisitors: number; visitorSince: string | null }>(sql`
        with ${pageviews}
        select
          (select count(*)::int from pageviews v join posts p on v.path = '/post/' || p.id and p.published = true) as "allTimeArticleViews",
          (select count(distinct visitor_hash)::int from analytics_pageviews) as "allTimeVisitors",
          (select count(*)::int from pageviews v join posts p on v.path = '/post/' || p.id and p.published = true
            where v.created_at >= ${start}::timestamptz and v.created_at < ${end}::timestamptz) as "articleViews",
          (select count(distinct visitor_hash)::int from analytics_pageviews
            where created_at >= ${start}::timestamptz and created_at < ${end}::timestamptz) as visitors,
          (select to_char(min(created_at) at time zone 'Asia/Shanghai', 'YYYY-MM-DD') from analytics_pageviews where visitor_hash is not null) as "visitorSince"
      `),
      this.database.execute<{ date: string; articleViews: number; visitors: number }>(sql`
        with ${pageviews}, article_days as (
          select to_char(v.created_at at time zone 'Asia/Shanghai', 'YYYY-MM-DD') as date, count(*)::int as views
          from pageviews v join posts p on v.path = '/post/' || p.id and p.published = true
          where v.created_at >= ${start}::timestamptz and v.created_at < ${end}::timestamptz group by 1
        ), visitor_days as (
          select to_char(created_at at time zone 'Asia/Shanghai', 'YYYY-MM-DD') as date, count(distinct visitor_hash)::int as visitors
          from analytics_pageviews where created_at >= ${start}::timestamptz and created_at < ${end}::timestamptz group by 1
        )
        select coalesce(a.date, v.date) as date, coalesce(a.views, 0)::int as "articleViews", coalesce(v.visitors, 0)::int as visitors
        from article_days a full join visitor_days v on a.date = v.date
      `),
      this.database.execute<{ id: string; title: string; path: string; views: number; views30d: number }>(sql`
        with ${pageviews}
        select p.id, p.title, '/post/' || p.id as path, count(v.id)::int as views,
          count(v.id) filter (where v.created_at >= ${start}::timestamptz and v.created_at < ${end}::timestamptz)::int as "views30d"
        from posts p left join pageviews v on v.path = '/post/' || p.id
        where p.published = true group by p.id, p.title order by views desc, p.id asc
      `),
      this.database.execute<{ id: string; date: string; views: number }>(sql`
        with ${pageviews}
        select p.id, to_char(v.created_at at time zone 'Asia/Shanghai', 'YYYY-MM-DD') as date, count(*)::int as views
        from pageviews v join posts p on v.path = '/post/' || p.id and p.published = true
        where v.created_at >= ${start}::timestamptz and v.created_at < ${end}::timestamptz group by p.id, 2
      `),
    ])
    const dailyMap = new Map<string, AnalyticsReport['daily'][number]>(dailyRows.rows.map((row) => [row.date, row]))
    const articleDays = new Map(articleDailyRows.rows.map((row) => [`${row.id}\u0000${row.date}`, row.views]))
    return {
      days: 30,
      allTime: { articleViews: totals.rows[0].allTimeArticleViews, visitors: totals.rows[0].allTimeVisitors },
      total: { articleViews: totals.rows[0].articleViews, visitors: totals.rows[0].visitors },
      daily: range.dates.map((date) => dailyMap.get(date) || { date, articleViews: 0, visitors: 0 }),
      articles: articleRows.rows.map((article) => ({ ...article, daily: range.dates.map((date) => ({ date, views: articleDays.get(`${article.id}\u0000${date}`) || 0 })) })),
      visitorSince: totals.rows[0].visitorSince,
    }
  }
}

export const analyticsRepository = new AnalyticsRepository()
