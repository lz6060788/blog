'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/app/i18n/routing'
import { locales, type Locale, localeFlags, localeNames } from '@/locales'
import { useState, useEffect } from 'react'

/**
 * 语言切换器组件
 *
 * 允许用户在英语和中文之间切换
 * 遵循 frontend-design 美学规范
 */
export function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
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
    // 保存偏好到 localStorage (可选，next-intl 中间件会自动处理 cookie)
    localStorage.setItem('blog-locale', newLocale)

    // 使用 next-intl 的 router 切换语言，它会自动处理路径前缀
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <div className="flex items-center gap-1 bg-theme-bg-surface rounded-full p-1 border border-theme-border shadow-sm">
      {(Object.keys(locales) as Locale[]).map((loc) => {
        const flag = localeFlags[loc]
        const isActive = locale === loc

        return (
          <button
            key={loc}
            onClick={() => switchLocale(loc)}
            className={`
              relative w-7 h-7 flex items-center justify-center rounded-full
              transition-all duration-200 text-sm
              ${isActive
                ? 'bg-theme-text-canvas text-theme-bg-surface'
                : 'text-theme-text-tertiary hover:text-theme-text-secondary'
              }
            `}
            title={`${flag} ${localeNames[loc]}`}
            aria-label={localeNames[loc]}
          >
            {flag}
          </button>
        )
      })}
    </div>
  )
}
