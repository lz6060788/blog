import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { randomUUID } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { eq } from 'drizzle-orm'
import * as schema from '../server/db/schema'
import { analyticsPath, analyticsBatchSchema, analyticsRange, referrerDomain, type AnalyticsEvent } from '../lib/analytics'
import { createAnalyticsHandler } from '../server/analytics/ingestion'
import { BlogAnalyticsReporter } from '../lib/analytics-reporter'

// Never load .env or connect to the live application database.
process.env.DATABASE_URL = 'postgres://unused:unused@127.0.0.1:1/unused'
const memory = new PGlite()
const database = drizzle(memory, { schema })
let repository: InstanceType<typeof import('../server/analytics/repository').AnalyticsRepository>
const sessionId = randomUUID()
function event(input: Partial<AnalyticsEvent> = {}): AnalyticsEvent {
  const id = randomUUID()
  return { id, visitId: id, sessionId, type: 'pageview', path: '/', referrer: 'direct', device: 'desktop', durationMs: 0, depth: 0, target: null, ...input }
}

before(async () => {
  for (const file of (await readdir('drizzle')).filter((name) => /^\d+.*\.sql$/.test(name)).sort()) {
    await memory.exec(await readFile(`drizzle/${file}`, 'utf8'))
  }
  const { AnalyticsRepository } = await import('../server/analytics/repository')
  repository = new AnalyticsRepository(database as unknown as typeof import('../server/db').db)
})
after(async () => { await memory.close() })

test('only known public paths and source domains survive; query strings and private routes do not', () => {
  assert.equal(analyticsPath('/zh/post/abc?token=secret#heading'), '/post/abc')
  assert.equal(analyticsPath('/zh/lab/garden?preview=true'), '/lab/garden')
  for (const path of ['/admin', '/zh/admin/posts', '/api/search', '/login', '/unknown', '//evil.test/path']) assert.equal(analyticsPath(path), null)
  assert.equal(referrerDomain('https://search.example/search?email=secret', 'https://blog.example'), 'search.example')
  assert.equal(referrerDomain('https://blog.example/post/secret?token=s', 'https://blog.example'), 'internal')
  assert.equal(analyticsBatchSchema.safeParse({ events: [event({ path: '/?token=secret' })] }).success, false)
  assert.equal(analyticsBatchSchema.safeParse({ events: [{ ...event(), url: 'secret' }] }).success, false)
  assert.equal(analyticsBatchSchema.safeParse({ events: [event({ type: 'engagement' })] }).success, false)
})

test('report windows follow Shanghai day boundaries and reject unsupported ranges', () => {
  const range = analyticsRange(7, new Date('2026-10-22T16:05:00Z'))
  assert.equal(range.start.toISOString(), '2026-10-16T16:00:00.000Z')
  assert.equal(range.end.toISOString(), '2026-10-23T16:00:00.000Z')
  assert.equal(range.dates[6], '2026-10-23')
  assert.equal(analyticsRange(999).days, 30)
})

test('analytics migration metadata adds only its table, with earlier schema defaults preserved', async () => {
  const previous = JSON.parse(await readFile('drizzle/meta/0003_snapshot.json', 'utf8'))
  const current = JSON.parse(await readFile('drizzle/meta/0004_snapshot.json', 'utf8'))
  assert.equal(current.prevId, previous.id)
  for (const [name, table] of Object.entries(previous.tables)) assert.deepEqual(current.tables[name], table)
  assert.ok(current.tables['public.analytics_events'])
  assert.equal(Object.keys(current.tables).length, Object.keys(previous.tables).length + 1)
  const sql = await readFile('drizzle/0004_thick_sinister_six.sql', 'utf8')
  assert.equal(/ALTER TABLE|DROP TABLE/.test(sql), false)
  const journal = JSON.parse(await readFile('drizzle/meta/_journal.json', 'utf8'))
  assert.equal(journal.entries[4].tag, '0004_thick_sinister_six')
})

test('ingestion blocks cross-site, oversized, invalid and mixed-session payloads; excludes signed-in users', async () => {
  let collected = 0, authenticated = false, allowed = true
  const handler = createAnalyticsHandler({ siteOrigin: 'https://blog.example', allowRequest: () => allowed, isAuthenticated: async () => authenticated, collect: async (events) => { collected += events.length } })
  const request = (body: unknown, headers: Record<string, string> = {}) => new Request('https://blog.example/api/analytics/events', { method: 'POST', headers: { origin: 'https://blog.example', 'content-type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) })
  const body = { events: [event()] }
  assert.equal((await handler(request(body, { origin: 'https://attacker.example' }))).status, 403)
  assert.equal((await handler(request(body, { 'sec-fetch-site': 'cross-site' }))).status, 403)
  assert.equal((await handler(request(body, { 'content-type': 'text/plain' }))).status, 415)
  assert.equal((await handler(request('x'.repeat(25000)))).status, 413)
  assert.equal((await handler(request('{'))).status, 400)
  assert.equal((await handler(request({ events: [event(), event({ sessionId: randomUUID() })] }))).status, 400)
  assert.equal((await handler(request({ events: Array.from({ length: 21 }, () => event()) }))).status, 400)
  assert.equal((await handler(request(body, { dnt: '1' }))).status, 204)
  authenticated = true
  assert.equal((await handler(request(body))).status, 204)
  assert.equal(collected, 0)
  authenticated = false
  assert.equal((await handler(request(body))).status, 204)
  assert.equal(collected, 1)
  allowed = false
  assert.equal((await handler(request(body))).status, 429)
})

test('same-origin browser Host works when Next reconstructs an internal URL; other authorities remain rejected', async () => {
  let collected = 0
  const handler = createAnalyticsHandler({ siteOrigin: 'https://blog.example', allowRequest: () => true, isAuthenticated: async () => false, collect: async () => { collected++ } })
  const request = (extra: Record<string, string> = {}) => new Request('http://localhost:3000/api/analytics/events', {
    method: 'POST',
    headers: { origin: 'http://127.0.0.1:3000', host: '127.0.0.1:3000', 'sec-fetch-site': 'same-origin', 'content-type': 'application/json', ...extra },
    body: JSON.stringify({ events: [event()] }),
  })
  assert.equal((await handler(request())).status, 204)
  assert.equal(collected, 1)
  assert.equal((await handler(request({ origin: 'https://attacker.example' }))).status, 403)
  assert.equal((await handler(request({ origin: 'http://127.0.0.1:3001' }))).status, 403)
  assert.equal((await handler(request({ 'sec-fetch-site': 'cross-site' }))).status, 403)
  assert.equal((await handler(request({ 'sec-fetch-site': 'same-site' }))).status, 403)
  assert.equal((await handler(request({ origin: 'null' }))).status, 403)
  assert.equal((await handler(request({ origin: 'http://127.0.0.1:3000/path' }))).status, 403)
  assert.equal(collected, 1)
})

test('SDK reporter sends the whitelist only and preserves a newer checkpoint during an in-flight request', async () => {
  const original = globalThis.fetch
  const sent: string[] = []
  let release: (() => void) | undefined
  globalThis.fetch = async (_input, init) => {
    sent.push(String(init?.body))
    if (sent.length === 1) await new Promise<void>((resolve) => { release = resolve })
    return new Response(null, { status: 204 })
  }
  const reporter = new BlogAnalyticsReporter()
  const read = event({ type: 'engagement', path: '/post/test', durationMs: 1000, depth: 20 })
  try {
    reporter.add({ data: read, url: 'https://blog.example/?token=secret', userAgent: 'secret', referrer: 'https://secret.example?q=secret' } as Parameters<typeof reporter.add>[0])
    const first = reporter.flush()
    reporter.add({ data: { ...read, durationMs: 2000, depth: 40 } })
    release?.()
    await first
    await reporter.flush()
    assert.equal(sent.length, 2)
    assert.equal(sent.some((body) => body.includes('secret')), false)
    assert.equal(JSON.parse(sent[0]).events[0].durationMs, 1000)
    assert.equal(JSON.parse(sent[1]).events[0].durationMs, 2000)
  } finally { reporter.stop(); globalThis.fetch = original }
})

test('migrations, idempotent ingestion, cumulative reading, Shanghai aggregation and true unique counts work in PostgreSQL', async () => {
  const first = event({ path: '/post/read', device: 'mobile', referrer: 'search.example' })
  const second = event({ path: '/post/read', device: 'mobile' })
  const third = event({ sessionId: randomUUID(), path: '/archive' })
  const reading = event({ visitId: first.visitId, type: 'engagement', path: first.path, durationMs: 10000, depth: 25 })
  await repository.collect([first, first]) // network retries must count once
  await repository.collect([second, third, reading, event({ type: 'click', target: 'article' })])
  await repository.collect([{ ...reading, durationMs: 20000, depth: 75 }])
  await repository.collect([{ ...reading, durationMs: 100, depth: 10 }]) // late/out-of-order beacon
  await repository.collect([{ ...reading, sessionId: randomUUID(), durationMs: 999999, depth: 100 }]) // cannot overwrite another session
  const [stored] = await database.select().from(schema.analyticsEvents).where(eq(schema.analyticsEvents.id, reading.id))
  assert.equal(stored.durationMs, 20000)
  assert.equal(stored.depth, 75)
  const report = await repository.report(7)
  assert.deepEqual(report.total, { pageviews: 3, visitors: 2, articleViews: 2, averageReadMs: 20000, averageDepth: 75, clicks: 1 })
  assert.equal(report.daily.length, 7)
  assert.equal(report.daily.reduce((total, day) => total + day.pageviews, 0), 3)
  assert.equal(report.pages[0].path, '/post/read')
  assert.equal(report.pages[0].views, 2)
  assert.equal(report.pages[0].visitors, 1)
  assert.equal(report.devices.find((row) => row.name === 'mobile')?.views, 2)
  assert.equal(report.clicks[0].name, 'article')
  const empty = await repository.report(7, new Date('2000-01-01T00:00:00Z'))
  assert.equal(empty.total.pageviews, 0)
  assert.equal(empty.daily.length, 7)
  assert.equal(empty.pages.length, 0)
})
