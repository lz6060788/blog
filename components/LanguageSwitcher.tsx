'use client'

import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { locales, type Locale, localeFlags, localeNames } from '@/locales'
import { useState, useEffect } from 'react'
import { useRouter } from '@/app/i18n/routing'

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
    // 保存偏好到 localStorage
    localStorage.setItem('blog-locale', newLocale)

    // 获取不含 locale 的路径
    const segments = pathname.split('/').filter(Boolean)

    // 如果第一段是 locale，移除它
    if (segments.length > 0 && (segments[0] === 'en' || segments[0] === 'zh')) {
      segments.shift()
    }

    // 构建新路径
    const newPath = segments.length > 0 ? `/${segments.join('/')}` : '/'

    // 使用 router.replace 切换语言环境，传入不含 locale 的路径
    router.replace(newPath, { locale: newLocale })
  }

  return (
    <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 rounded-full p-1 border border-zinc-200 dark:border-zinc-800 shadow-sm">
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
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'
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
