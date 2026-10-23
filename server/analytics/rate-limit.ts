import { createHash } from 'node:crypto'

// Per-process burst protection; the reverse proxy should also limit this public endpoint.
// Source addresses are hashed in memory and never inserted into analytics storage.
const windows = new Map<string, { count: number; expires: number }>()

export function allowAnalyticsRequest(request: Request) {
  const now = Date.now()
  if (windows.size >= 2000) {
    windows.forEach((value, key) => { if (value.expires <= now) windows.delete(key) })
    if (windows.size >= 2000) return false
  }
  const address = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  const key = createHash('sha256').update(address.slice(0, 128)).digest('hex')
  const existing = windows.get(key)
  if (!existing || existing.expires <= now) { windows.set(key, { count: 1, expires: now + 60000 }); return true }
  return ++existing.count <= 120
}
