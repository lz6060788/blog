import { en } from './en'
import { zh } from './zh'
import type { Messages, Locale } from './types'

export const locales: Record<Locale, Messages> = {
  en,
  zh,
}

export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
}

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  zh: '🇨🇳',
}

export * from './types'
