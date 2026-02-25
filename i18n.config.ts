/**
 * 国际化配置
 *
 * 定义支持的语言环境和默认语言环境
 */

import { locales as localeMessages, defaultLocale as defLocale, localeNames, localeFlags, type Locale } from '@/locales'

// 重新导出以便外部使用
export const locales = Object.keys(localeMessages) as Locale[]
export const defaultLocale: Locale = defLocale
export const localesConfig = localeNames
export const localeFlagsConfig = localeFlags

// 类型导出
export type { Locale }
