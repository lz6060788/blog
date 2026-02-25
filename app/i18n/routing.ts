import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'
import { locales, defaultLocale } from '@/locales'

export const routing = defineRouting({
  // 支持的语言环境列表
  locales: Object.keys(locales) as Array<keyof typeof locales>,

  // 默认语言环境
  defaultLocale,

  // 当默认语言环境是 en 时，不显示 /en 前缀
  localePrefix: 'as-needed',
})

// 为 Route Locale Configurator 创建工具函数
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing)
