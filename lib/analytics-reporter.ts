import { ANALYTICS_ENDPOINT, analyticsEventSchema, type AnalyticsEvent } from './analytics'

/** SDK baseInfo contains raw URLs and UA. Deliberately copy only validated event.data. */
export class BlogAnalyticsReporter {
  private queue: AnalyticsEvent[] = []
  private inFlight = false
  private stopped = false
  private retries = 0
  private timer: ReturnType<typeof setInterval> | undefined

  install() { this.timer = setInterval(() => { void this.flush() }, 5000) }

  add(envelope: { data: Record<string, unknown> }) {
    if (this.stopped) return
    const parsed = analyticsEventSchema.safeParse(envelope.data)
    if (!parsed.success) return
    // Coalesce cumulative read checkpoints before sending.
    this.queue = this.queue.filter((event) => event.id !== parsed.data.id)
    this.queue.push(parsed.data)
    this.queue = this.queue.slice(-60)
  }

  async flush(beacon = false) {
    if (this.stopped || !this.queue.length) return
    const events = this.queue.slice(0, 20)
    const body = JSON.stringify({ events })
    if (beacon && typeof navigator.sendBeacon === 'function') {
      if (navigator.sendBeacon(ANALYTICS_ENDPOINT, new Blob([body], { type: 'application/json' }))) {
        this.remove(events)
        return
      }
    }
    if (this.inFlight) return
    this.inFlight = true
    try {
      const response = await fetch(ANALYTICS_ENDPOINT, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
        credentials: 'same-origin', keepalive: true,
      })
      if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 429)) {
        this.remove(events)
        this.retries = 0
      } else if (++this.retries >= 3) { this.remove(events); this.retries = 0 }
    } catch {
      if (++this.retries >= 3) { this.remove(events); this.retries = 0 }
    } finally { this.inFlight = false }
  }

  private remove(sent: AnalyticsEvent[]) {
    // Preserve a newer cumulative checkpoint added while this request was in flight.
    this.queue = this.queue.filter((event) => !sent.includes(event))
  }

  stop() {
    clearInterval(this.timer)
    this.stopped = true
    this.queue = []
  }
}
