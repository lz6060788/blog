import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  // 这通常对应于 `[locale]` 段
  let locale = await requestLocale

  // 确保传入的语言环境是有效的
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  // 加载所有命名空间的翻译文件
  const [common, nav, home] = await Promise.all([
    import(`@/locales/${locale}/common.json`),
    import(`@/locales/${locale}/nav.json`),
    import(`@/locales/${locale}/home.json`),
  ])

  // 合并所有翻译消息
  const messages = {
    ...common.default,
    ...nav.default,
    ...home.default,
  }

  return {
    locale,
    messages,
  }
})
