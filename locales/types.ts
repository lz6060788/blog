/**
 * 翻译消息类型定义
 */

export interface CommonMessages {
  siteName: string
  siteDescription: string
}

export interface NavMessages {
  home: string
  archive: string
}

export interface HomeMessages {
  greeting: string
  title: string
  description: string
  latestPosts: string
}

export interface LoginMessages {
  welcome: string
  subtitle: string
  github: string
  google: string
  brand: {
    title: string
    subtitle: string
  }
  footer: {
    terms: string
    privacy: string
    backToHome: string
  }
}

export interface Messages {
  common: CommonMessages
  nav: NavMessages
  home: HomeMessages
  login: LoginMessages
}

export type Locale = 'en' | 'zh'

export const locales: Locale[] = ['en', 'zh']

export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
}

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  zh: '🇨🇳',
}
