'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { locales, type Locale } from '@/i18n.config'
import { useState, useEffect } from 'react'
import { localesConfig } from '@/i18n.config'

/**
 * 语言切换器组件
 *
 * 允许用户在英语和中文之间切换
 * 遵循 frontend-design 美学规范
 */
export function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-9 h-9" />
    )
  }

  const switchLocale = (newLocale: Locale) => {
    // 保存偏好到 localStorage
    localStorage.setItem('blog-locale', newLocale)

    // 获取不含当前 locale 的路径
    const segments = pathname.split('/')
    // 移除开头的 locale 段（如果是有效的 locale）
    if (segments.length > 1 && (segments[1] === 'en' || segments[1] === 'zh')) {
      segments[1] = newLocale === 'en' ? '' : newLocale
    } else {
      segments.splice(1, 0, newLocale === 'en' ? '' : newLocale)
    }

    const newPathname = segments.join('/').replace(/\/+/g, '/')
    router.push(newPathname)
  }

  return (
    <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 rounded-full p-1 border border-zinc-200 dark:border-zinc-800 shadow-sm">
      {locales.map((loc) => {
        const config = localesConfig[loc]
        const isActive = locale === loc
        return (
          <button
            key={loc}
            onClick={() => switchLocale(loc)}
            className={`
              relative w-7 h-7 flex items-center justify-center rounded-full
              transition-all duration-200 text-sm
              ${isActive
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'
              }
            `}
            title={`${config.flag} ${config.name}`}
            aria-label={config.name}
          >
            {config.flag}
          </button>
        )
      })}
    </div>
  )
}
