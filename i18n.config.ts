/**
 * 国际化配置
 *
 * 定义支持的语言环境和默认语言环境
 */

export const locales = ['en', 'zh'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const localesConfig = {
  en: {
    name: 'English',
    flag: '🇺🇸',
  },
  zh: {
    name: '中文',
    flag: '🇨🇳',
  },
} as const
