'use client'

import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { locales, type Locale, localeFlags, localeNames } from '@/locales'
import { useState, useEffect } from 'react'
import { Link } from '@/app/i18n/routing'

/**
 * 语言切换器组件
 *
 * 允许用户在英语和中文之间切换
 * 遵循 frontend-design 美学规范
 */
export function LanguageSwitcher() {
  const locale = useLocale() as Locale
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

  // 保存偏好到 localStorage
  const handleLocaleChange = (newLocale: Locale) => {
    localStorage.setItem('blog-locale', newLocale)
  }

  return (
    <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 rounded-full p-1 border border-zinc-200 dark:border-zinc-800 shadow-sm">
      {(Object.keys(locales) as Locale[]).map((loc) => {
        const flag = localeFlags[loc]
        const isActive = locale === loc

        return (
          <Link
            key={loc}
            href={pathname}
            locale={loc}
            onClick={() => handleLocaleChange(loc)}
            className={`
              relative w-7 h-7 flex items-center justify-center rounded-full
              transition-all duration-200 text-sm
              ${isActive
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'
              }
            `}
            title={`${flag} ${localeNames[loc]}`}
            aria-label={localeNames[loc]}
            scroll={false}
          >
            {flag}
          </Link>
        )
      })}
    </div>
  )
}
