import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n.config'

export default createMiddleware({
  // 支持的语言环境列表
  locales,

  // 默认语言环境
  defaultLocale,

  // 语言环境前缀策略
  localePrefix: 'as-needed',
})

export const config = {
  // 匹配所有路径除了 api、_next、_vercel 等
  matcher: [
    // 匹配所有路径
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // 包括根路径
    '/',
  ],
}
