import { defaultLocale, locales, type Locale } from '@/i18n.config'

const FALLBACK_SITE_URL = 'https://blog.theirises.cn'

export function getSiteUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || FALLBACK_SITE_URL

  try {
    return new URL(configuredUrl).origin
  } catch {
    return FALLBACK_SITE_URL
  }
}

export function absoluteUrl(pathOrUrl = '/'): string {
  try {
    return new URL(pathOrUrl).toString()
  } catch {
    const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
    return new URL(path, `${getSiteUrl()}/`).toString()
  }
}

export function localizedPath(locale: string, path = '/'): string {
  const normalizedPath = path === '' ? '/' : path.startsWith('/') ? path : `/${path}`
  if (locale === defaultLocale) return normalizedPath
  return normalizedPath === '/' ? `/${locale}` : `/${locale}${normalizedPath}`
}

export function languageAlternates(path = '/'): Record<string, string> {
  return Object.fromEntries(
    locales.map((locale) => [locale, absoluteUrl(localizedPath(locale, path))]),
  ) as Record<Locale, string>
}

export function localeToOpenGraph(locale: string): string {
  return locale === 'zh' ? 'zh_CN' : 'en_US'
}

export function safeDate(value?: string | null): Date | undefined {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}
