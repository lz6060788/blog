import { analyticsBatchSchema, MAX_ANALYTICS_BYTES } from '@/lib/analytics'
import { createHash } from 'node:crypto'
import type { AnalyticsPageview } from '@/lib/analytics'

interface IngestionDependencies {
  isAuthenticated: () => Promise<boolean>
  collect: (events: AnalyticsPageview[]) => Promise<void>
  allowRequest: (request: Request) => boolean
  siteOrigin: string
}

class BodyTooLarge extends Error {}

function isAllowedOrigin(request: Request, siteOrigin: string) {
  const origin = request.headers.get('origin')
  const fetchSite = request.headers.get('sec-fetch-site')
  if (!origin || fetchSite === 'cross-site') return false
  let parsed: URL
  try { parsed = new URL(origin) } catch { return false }
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== origin) return false
  if (new Set([siteOrigin, new URL(request.url).origin]).has(origin)) return true
  // Next may reconstruct request.url with an internal localhost authority. Browsers
  // still send the public Host; accept that authority only with same-origin metadata.
  return fetchSite === 'same-origin' && parsed.host === request.headers.get('host')?.trim().toLowerCase()
}

async function readBoundedBody(request: Request) {
  if (Number(request.headers.get('content-length') || 0) > MAX_ANALYTICS_BYTES) throw new BodyTooLarge()
  const reader = request.body?.getReader()
  if (!reader) throw new Error('Missing body')
  let size = 0
  const chunks: Uint8Array[] = []
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > MAX_ANALYTICS_BYTES) { await reader.cancel(); throw new BodyTooLarge() }
      chunks.push(value)
    }
  } finally { reader.releaseLock() }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
  return JSON.parse(new TextDecoder().decode(bytes))
}

export function createAnalyticsHandler(dependencies: IngestionDependencies) {
  return async (request: Request): Promise<Response> => {
    const respond = (status: number) => new Response(null, { status, headers: { 'Cache-Control': 'no-store', ...(status === 429 ? { 'Retry-After': '60' } : {}) } })
    if (!isAllowedOrigin(request, dependencies.siteOrigin)) return respond(403)
    if (request.headers.get('dnt') === '1' || request.headers.get('sec-gpc') === '1') return respond(204)
    if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return respond(415)
    if (!dependencies.allowRequest(request)) return respond(429)
    try {
      const parsed = analyticsBatchSchema.safeParse(await readBoundedBody(request))
      if (!parsed.success || new Set(parsed.data.events.map((event) => event.visitorId)).size !== 1 || new Set(parsed.data.events.map((event) => event.id)).size !== parsed.data.events.length) return respond(400)
      if (await dependencies.isAuthenticated()) return respond(204)
      const namespace = new URL(dependencies.siteOrigin).origin
      await dependencies.collect(parsed.data.events.map(({ id, path, visitorId }) => ({
        id, path,
        visitorHash: visitorId === null ? null : createHash('sha256').update(`${namespace}\u0000${visitorId}`).digest('hex'),
      })))
      return respond(204)
    } catch (error) {
      if (error instanceof BodyTooLarge) return respond(413)
      if (error instanceof SyntaxError) return respond(400)
      // Never log incoming payloads, identifiers or headers.
      console.error('[analytics] Collection unavailable')
      return respond(503)
    }
  }
}
