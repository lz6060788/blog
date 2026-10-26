import assert from 'node:assert/strict'
import { after, before, beforeEach, test } from 'node:test'
import { createHash, randomUUID } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { eq } from 'drizzle-orm'
import * as schema from '../server/db/schema'
import { analyticsPath, analyticsBatchSchema, analyticsRange, type AnalyticsEvent, type AnalyticsPageview } from '../lib/analytics'
import { createAnalyticsHandler } from '../server/analytics/ingestion'

// No .env loading, network access or live application database is needed.
process.env.DATABASE_URL = 'postgres://unused:unused@127.0.0.1:1/unused'
const memory = new PGlite()
const database = drizzle(memory, { schema })
let repository: InstanceType<typeof import('../server/analytics/repository').AnalyticsRepository>
const fingerprint = '0123456789abcdef0123456789abcdef'
const now = new Date('2026-10-26T08:00:00Z')
function event(input: Partial<AnalyticsEvent> = {}): AnalyticsEvent {
  return { id: randomUUID(), path: '/', visitorId: fingerprint, ...input }
}
function pageview(input: Partial<AnalyticsPageview> = {}): AnalyticsPageview {
  return { id: randomUUID(), path: '/post/read', visitorHash: 'a'.repeat(64), ...input }
}
async function stored(path: string, visitorHash: string | null, time: string, id = randomUUID()) {
  await database.insert(schema.analyticsPageviews).values({ id, path, visitorHash, createdAt: new Date(time) })
  return id
}
async function legacy(path: string, time: string, id = randomUUID(), type = 'pageview') {
  await database.insert(schema.analyticsEvents).values({ id, path, visitId: randomUUID(), sessionId: randomUUID(), type, referrer: 'direct', device: 'desktop', createdAt: new Date(time) })
}

before(async () => {
  for (const file of (await readdir('drizzle')).filter((name) => /^\d+.*\.sql$/.test(name)).sort()) {
    await memory.exec(await readFile(`drizzle/${file}`, 'utf8'))
  }
  const { AnalyticsRepository } = await import('../server/analytics/repository')
  repository = new AnalyticsRepository(database as unknown as typeof import('../server/db').db)
  await memory.exec(`insert into users (id, name, email) values ('test-author', 'Author', 'author@example.test')`)
})
beforeEach(async () => {
  await memory.exec(`delete from analytics_pageviews; delete from analytics_events; delete from posts;
    insert into posts (id, title, content, "authorId", published) values
    ('read', 'Article', 'Content', 'test-author', true),
    ('zero', 'Zero', 'Content', 'test-author', true),
    ('draft', 'Draft', 'Content', 'test-author', false);`)
})
after(async () => { await memory.close() })

test('strict pageview contract accepts canonical public paths and optional fingerprint failures only', () => {
  assert.equal(analyticsPath('/zh/music-player-demo'), '/music-player-demo')
  assert.equal(analyticsPath('/zh/post/abc?token=secret#heading'), '/post/abc')
  assert.equal(analyticsPath('/zh/lab/garden?preview=true'), '/lab/garden')
  for (const path of ['/admin', '/zh/admin/posts', '/api/search', '/login', '/unknown', '//evil.test/path']) assert.equal(analyticsPath(path), null)
  for (const invalid of [
    event({ path: '/?token=secret' }), event({ visitorId: 'A'.repeat(32) }),
    { ...event(), url: 'secret' }, { ...event(), sessionId: randomUUID() },
    { ...event(), type: 'click' }, { ...event(), referrer: 'secret' },
    { ...event(), visitorId: undefined }, { ...event(), id: 'not-uuid' },
  ]) assert.equal(analyticsBatchSchema.safeParse({ events: [invalid] }).success, false)
  assert.equal(analyticsBatchSchema.safeParse({ events: [event({ visitorId: null })] }).success, true)
  assert.equal(analyticsBatchSchema.safeParse({ events: [] }).success, false)
})

test('report date windows use Shanghai boundaries', () => {
  const range = analyticsRange(30, now)
  assert.equal(range.start.toISOString(), '2026-09-26T16:00:00.000Z')
  assert.equal(range.end.toISOString(), '2026-10-26T16:00:00.000Z')
  assert.equal(range.dates[0], '2026-09-27')
  assert.equal(range.dates[29], '2026-10-26')
  assert.equal(analyticsRange(999).days, 30)
})

test('migration adds only the narrow table, preserves all earlier tables and chains metadata', async () => {
  const previous = JSON.parse(await readFile('drizzle/meta/0004_snapshot.json', 'utf8'))
  const current = JSON.parse(await readFile('drizzle/meta/0005_snapshot.json', 'utf8'))
  assert.equal(current.prevId, previous.id)
  for (const [name, table] of Object.entries(previous.tables)) assert.deepEqual(current.tables[name], table)
  assert.deepEqual(Object.keys(current.tables['public.analytics_pageviews'].columns), ['id', 'path', 'visitor_hash', 'created_at'])
  assert.equal(Object.keys(current.tables).length, Object.keys(previous.tables).length + 1)
  const sql = await readFile('drizzle/0005_analytics_pageviews.sql', 'utf8')
  assert.equal(/ALTER TABLE|DROP TABLE|INSERT INTO|UPDATE |DELETE FROM/.test(sql), false)
  const journal = JSON.parse(await readFile('drizzle/meta/_journal.json', 'utf8'))
  assert.equal(journal.entries[5].tag, '0005_analytics_pageviews')
})

test('ingestion enforces source, privacy, size, auth, rate and a single fingerprint with unique event IDs', async () => {
  const collected: AnalyticsPageview[][] = []
  let authenticated = false, allowed = true
  const handler = createAnalyticsHandler({ siteOrigin: 'https://blog.example', allowRequest: () => allowed, isAuthenticated: async () => authenticated, collect: async (events) => { collected.push(events) } })
  const request = (body: unknown, headers: Record<string, string> = {}) => new Request('https://blog.example/api/analytics/events', { method: 'POST', headers: { origin: 'https://blog.example', 'content-type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) })
  const single = event(), body = { events: [single] }
  assert.equal((await handler(request(body, { origin: 'https://attacker.example' }))).status, 403)
  assert.equal((await handler(request(body, { 'sec-fetch-site': 'cross-site' }))).status, 403)
  assert.equal((await handler(request(body, { 'content-type': 'text/plain' }))).status, 415)
  assert.equal((await handler(request('x'.repeat(25000)))).status, 413)
  assert.equal((await handler(request(body, { 'content-length': '25000' }))).status, 413)
  assert.equal((await handler(request('{'))).status, 400)
  assert.equal((await handler(request({ events: [single, single] }))).status, 400)
  assert.equal((await handler(request({ events: [event(), event({ visitorId: 'f'.repeat(32) })] }))).status, 400)
  assert.equal((await handler(request({ events: [event(), event({ visitorId: null })] }))).status, 400)
  assert.equal((await handler(request({ events: Array.from({ length: 21 }, () => event()) }))).status, 400)
  assert.equal((await handler(request(body, { dnt: '1' }))).status, 204)
  assert.equal((await handler(request(body, { 'sec-gpc': '1' }))).status, 204)
  authenticated = true
  assert.equal((await handler(request(body))).status, 204)
  assert.equal(collected.length, 0)
  authenticated = false
  assert.equal((await handler(request(body))).status, 204)
  assert.deepEqual(collected[0], [{ id: single.id, path: '/', visitorHash: createHash('sha256').update(`https://blog.example\u0000${fingerprint}`).digest('hex') }])
  assert.equal(JSON.stringify(collected).includes(fingerprint), false)
  assert.equal((await handler(request({ events: [event({ visitorId: null }), event({ visitorId: null })] }))).status, 204)
  assert.equal(collected[1].every((row) => row.visitorHash === null), true)
  allowed = false
  const rate = await handler(request(body))
  assert.equal(rate.status, 429)
  assert.equal(rate.headers.get('retry-after'), '60')
})

test('same-origin Host accepts a reconstructed internal URL but rejects other authorities', async () => {
  let collected = 0
  const handler = createAnalyticsHandler({ siteOrigin: 'https://blog.example', allowRequest: () => true, isAuthenticated: async () => false, collect: async () => { collected++ } })
  const request = (extra: Record<string, string> = {}) => new Request('http://localhost:3000/api/analytics/events', {
    method: 'POST', headers: { origin: 'http://127.0.0.1:3000', host: '127.0.0.1:3000', 'sec-fetch-site': 'same-origin', 'content-type': 'application/json', ...extra }, body: JSON.stringify({ events: [event()] }),
  })
  assert.equal((await handler(request())).status, 204)
  const rejected: Record<string, string>[] = [{ origin: 'https://attacker.example' }, { origin: 'http://127.0.0.1:3001' }, { 'sec-fetch-site': 'cross-site' }, { 'sec-fetch-site': 'same-site' }, { origin: 'null' }, { origin: 'http://127.0.0.1:3000/path' }]
  for (const extra of rejected) assert.equal((await handler(request(extra))).status, 403)
  assert.equal(collected, 1)
})

test('ingestion namespaces fingerprints by configured origin', async () => {
  const hashes: (string | null)[] = []
  for (const siteOrigin of ['https://one.example', 'https://two.example']) {
    const handler = createAnalyticsHandler({ siteOrigin, allowRequest: () => true, isAuthenticated: async () => false, collect: async (rows) => { hashes.push(rows[0].visitorHash) } })
    await handler(new Request(`${siteOrigin}/api/analytics/events`, { method: 'POST', headers: { origin: siteOrigin, 'content-type': 'application/json' }, body: JSON.stringify({ events: [event()] }) }))
  }
  assert.notEqual(hashes[0], hashes[1])
})

test('collection is immutable and retry-safe; unpublished and missing article paths are ignored', async () => {
  const first = pageview()
  await repository.collect([first, first])
  await repository.collect([{ ...first, path: '/archive', visitorHash: 'b'.repeat(64) }])
  await repository.collect([pageview({ path: '/post/missing' }), pageview({ path: '/post/draft' }), pageview({ path: '/archive', visitorHash: null })])
  const rows = await database.select().from(schema.analyticsPageviews)
  assert.equal(rows.length, 2)
  assert.deepEqual(rows.find((row) => row.id === first.id)?.visitorHash, first.visitorHash)
  assert.equal(rows.find((row) => row.id === first.id)?.path, '/post/read')
  assert.equal(rows.some((row) => row.path === '/post/missing' || row.path === '/post/draft'), false)
})

test('30-day report deduplicates fingerprints across events and days while keeping all article PVs', async () => {
  await stored('/post/read', 'a', '2026-10-24T10:00:00Z')
  await stored('/post/read', 'a', '2026-10-24T11:00:00Z')
  await stored('/archive', 'a', '2026-10-25T10:00:00Z')
  await stored('/', 'b', '2026-10-25T11:00:00Z')
  await stored('/post/read', null, '2026-10-25T12:00:00Z')
  await legacy('/post/read', '2026-10-25T12:00:00Z')
  await legacy('/post/read', '2026-08-01T12:00:00Z')
  await legacy('/post/read', '2026-10-25T12:00:00Z', randomUUID(), 'engagement')
  await legacy('/post/missing', '2026-10-25T12:00:00Z')
  await legacy('/post/draft', '2026-10-25T12:00:00Z')
  const collision = await stored('/post/read', 'a', '2026-10-25T12:00:00Z')
  await legacy('/post/read', '2026-10-25T12:00:00Z', collision)
  const report = await repository.report(7, now)
  assert.equal(report.days, 30)
  assert.deepEqual(report.total, { articleViews: 5, visitors: 2 })
  assert.equal(report.daily.length, 30)
  assert.equal(report.daily.find((day) => day.date === '2026-10-24')?.visitors, 1)
  assert.equal(report.daily.find((day) => day.date === '2026-10-25')?.visitors, 2)
  assert.equal(report.daily.reduce((sum, day) => sum + day.visitors, 0), 3)
  assert.equal(report.visitorSince, '2026-10-24')
  assert.deepEqual(report.articles.map(({ id, views, views30d }) => ({ id, views, views30d })), [{ id: 'read', views: 6, views30d: 5 }, { id: 'zero', views: 0, views30d: 0 }])
  for (const article of report.articles) assert.equal(article.daily.length, 30)
  assert.equal(report.articles[0].daily.reduce((sum, day) => sum + day.views, 0), 5)
})

test('null fingerprints and legacy sessions do not count as visitors; dates include start and exclude end', async () => {
  await stored('/post/read', 'outside', '2026-09-26T15:59:59.999Z')
  await stored('/post/read', 'inside', '2026-09-26T16:00:00Z')
  await stored('/post/read', null, '2026-10-26T15:59:59.999Z')
  await stored('/post/read', 'future', '2026-10-26T16:00:00Z')
  await legacy('/post/read', '2026-10-26T12:00:00Z')
  const report = await repository.report(90, now)
  assert.deepEqual(report.total, { articleViews: 3, visitors: 1 })
  assert.equal(report.daily[0].articleViews, 1)
  assert.equal(report.daily[29].articleViews, 2)
  assert.equal(report.articles[0].views, 5)
  assert.equal(report.visitorSince, '2026-09-26')
})

test('no events returns all published articles with zeros; no articles still permits site visitors', async () => {
  const empty = await repository.report(30, now)
  assert.deepEqual(empty.total, { articleViews: 0, visitors: 0 })
  assert.deepEqual(empty.allTime, { articleViews: 0, visitors: 0 })
  assert.equal(empty.articles.length, 2)
  assert.equal(empty.visitorSince, null)
  assert.equal(empty.articles.every((article) => article.views === 0 && article.daily.every((day) => day.views === 0)), true)
  await memory.exec('delete from posts')
  await stored('/', 'site-visitor', '2026-10-25T12:00:00Z')
  const report = await repository.report(30, now)
  assert.deepEqual(report.total, { articleViews: 0, visitors: 1 })
  assert.deepEqual(report.articles, [])
})

test('legacy-only and failed-fingerprint reads retain PV without inventing visitors', async () => {
  await legacy('/post/read', '2026-10-25T12:00:00Z')
  await stored('/post/read', null, '2026-10-25T12:01:00Z')
  const report = await repository.report(30, now)
  assert.deepEqual(report.total, { articleViews: 2, visitors: 0 })
  assert.deepEqual(report.allTime, { articleViews: 2, visitors: 0 })
  assert.equal(report.visitorSince, null)
  assert.equal(report.daily.every((day) => day.visitors === 0), true)
  await database.update(schema.posts).set({ published: false }).where(eq(schema.posts.id, 'read'))
  const unpublished = await repository.report(30, now)
  assert.equal(unpublished.total.articleViews, 0)
  assert.equal(unpublished.allTime.articleViews, 0)
  assert.equal(unpublished.articles.some((article) => article.id === 'read'), false)
})

test('all-time totals deduplicate across windows and preserve the full article history', async () => {
  await stored('/post/read', 'returning', '2026-08-01T12:00:00Z')
  await stored('/post/read', 'returning', '2026-10-25T12:00:00Z')
  await stored('/archive', 'past-only', '2026-08-02T12:00:00Z')
  await stored('/', 'recent-only', '2026-10-25T12:00:00Z')
  await stored('/post/read', null, '2026-08-01T12:01:00Z')
  await stored('/post/zero', null, '2026-10-25T12:01:00Z')
  await legacy('/post/read', '2026-08-01T12:02:00Z')
  await legacy('/post/draft', '2026-08-01T12:02:00Z')
  const collision = await stored('/post/read', 'returning', '2026-08-01T12:03:00Z')
  await legacy('/post/read', '2026-08-01T12:03:00Z', collision)
  const report = await repository.report(30, now)
  assert.deepEqual(report.allTime, { articleViews: 6, visitors: 3 })
  assert.deepEqual(report.total, { articleViews: 2, visitors: 2 })
  assert.equal(report.allTime.articleViews, report.articles.reduce((sum, article) => sum + article.views, 0))
  assert.equal(report.total.articleViews, report.articles.reduce((sum, article) => sum + article.views30d, 0))
  assert.equal(report.visitorSince, '2026-08-01')
})
