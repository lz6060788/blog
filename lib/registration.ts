export const ICP_REGISTRATION_URL = 'https://beian.miit.gov.cn/'
export const PUBLIC_SECURITY_REGISTRATION_URL = 'https://beian.mps.gov.cn/'

const publicSecurityHosts = new Set([
  'beian.mps.gov.cn',
  'www.beian.gov.cn',
  'beian.gov.cn',
])

/** Only official, secure registration links can be saved or rendered. */
export function normalizePublicSecurityRegistrationUrl(value: string): string | null {
  if (!value.trim()) return ''

  try {
    const url = new URL(value.trim())
    if (
      url.protocol !== 'https:' ||
      !publicSecurityHosts.has(url.hostname) ||
      url.username ||
      url.password ||
      url.port
    ) {
      return null
    }

    return url.toString()
  } catch {
    return null
  }
}
