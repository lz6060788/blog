import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  // 这通常对应于 `[locale]` 段
  let locale = await requestLocale

  // 确保传入的语言环境是有效的
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`@/locales/${locale}/common.json`)).default,
  }
})
