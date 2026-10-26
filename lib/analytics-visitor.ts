/** Cache only in this page's memory. New tabs compute the same browser fingerprint. */
export function createVisitorResolver(load: () => Promise<string>, timeoutMs = 3000) {
  let pending: Promise<string | null> | undefined
  return async (): Promise<string | null> => {
    pending ??= Promise.resolve().then(load).then((id) => /^[a-f0-9]{32}$/.test(id) ? id : null).catch(() => null)
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      return await Promise.race([
        pending,
        new Promise<null>((resolve) => { timer = setTimeout(() => resolve(null), timeoutMs) }),
      ])
    } finally {
      clearTimeout(timer)
    }
  }
}

export const getAnalyticsVisitor = createVisitorResolver(async () => {
  const { load } = await import('@fingerprintjs/fingerprintjs')
  // Self-hosted package; disable the library's optional installation telemetry.
  const agent = await load({ monitoring: false, debug: false })
  const result = await agent.get()
  return result.visitorId
})
