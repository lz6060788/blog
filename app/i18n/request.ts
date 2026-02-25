import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'
import { locales } from '@/locales'

export default getRequestConfig(async ({ requestLocale }) => {
  // 这通常对应于 `[locale]` 段
  let locale = await requestLocale

  // 确保传入的语言环境是有效的
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  // 从 TypeScript 文件导入消息
  const messages = locales[locale as keyof typeof locales]

  return {
    locale,
    messages,
  }
})
