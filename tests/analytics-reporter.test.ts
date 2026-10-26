import assert from 'node:assert/strict'
import test from 'node:test'
import { randomUUID } from 'node:crypto'
import { BlogAnalyticsReporter } from '../lib/analytics-reporter'
import { createVisitorResolver } from '../lib/analytics-visitor'

const event = () => ({ id: randomUUID(), path: '/post/read', visitorId: 'a'.repeat(32) })

test('SDK reporter sends only the narrow pageview contract and keeps entries added in flight', async () => {
  const original = globalThis.fetch
  const sent: string[] = []
  let release: (() => void) | undefined
  globalThis.fetch = async (_input, init) => {
    sent.push(String(init?.body))
    if (sent.length === 1) await new Promise<void>((resolve) => { release = resolve })
    return new Response(null, { status: 204 })
  }
  const reporter = new BlogAnalyticsReporter()
  const firstEvent = event()
  const secondEvent = { ...event(), visitorId: null }
  try {
    reporter.add({ data: firstEvent, url: 'https://secret.example?token=secret', userAgent: 'secret', components: { canvas: 'secret' } } as Parameters<typeof reporter.add>[0])
    reporter.add({ data: { ...event(), device: 'desktop' } })
    const firstRequest = reporter.flush()
    reporter.add({ data: secondEvent })
    release?.()
    await firstRequest
    await reporter.flush()
    assert.equal(sent.length, 2)
    assert.equal(sent.some((body) => body.includes('secret')), false)
    assert.deepEqual(JSON.parse(sent[0]), { events: [firstEvent] })
    assert.deepEqual(JSON.parse(sent[1]), { events: [secondEvent] })
  } finally {
    reporter.stop()
    globalThis.fetch = original
  }
})

test('reporter retries unavailable ingestion with the same immutable event ID', async () => {
  const original = globalThis.fetch
  const sent: string[] = []
  globalThis.fetch = async (_input, init) => {
    sent.push(String(init?.body))
    return new Response(null, { status: sent.length === 1 ? 503 : 204 })
  }
  const reporter = new BlogAnalyticsReporter()
  try {
    reporter.add({ data: event() })
    await reporter.flush()
    await reporter.flush()
    await reporter.flush()
    assert.equal(sent.length, 2)
    assert.equal(sent[0], sent[1])
  } finally {
    reporter.stop()
    globalThis.fetch = original
  }
})

test('fingerprint resolution is shared across concurrent route entries without storing raw components', async () => {
  let calls = 0
  const resolve = createVisitorResolver(async () => { calls++; return 'b'.repeat(32) })
  assert.deepEqual(await Promise.all([resolve(), resolve(), resolve()]), Array(3).fill('b'.repeat(32)))
  assert.equal(calls, 1)
})

test('fingerprint errors, invalid identifiers and deadlines yield no visitor instead of a random identity', async () => {
  assert.equal(await createVisitorResolver(async () => { throw new Error('blocked') })(), null)
  assert.equal(await createVisitorResolver(() => { throw new Error('unavailable') })(), null)
  assert.equal(await createVisitorResolver(async () => 'invalid')(), null)
  let finish: (value: string) => void = () => {}
  const resolve = createVisitorResolver(() => new Promise<string>((done) => { finish = done }), 2)
  assert.equal(await resolve(), null)
  finish('c'.repeat(32))
  assert.equal(await resolve(), 'c'.repeat(32))
})
