'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from '@phosphor-icons/react'

/**
 * 主题切换组件
 *
 * 提供浅色、深色和自动三种主题模式选择
 * 遵循 frontend-design 美学规范
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // 避免服务端渲染不匹配
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-9 h-9" />
    )
  }

  const themes = [
    { value: 'light', icon: Sun, label: '浅色' },
    { value: 'dark', icon: Moon, label: '深色' },
    { value: 'system', icon: Monitor, label: '自动' },
  ] as const

  return (
    <div className="flex items-center gap-1 bg-theme-bg-surface rounded-full p-1 border border-theme-border shadow-sm">
      {themes.map(({ value, icon: Icon, label }) => {
        const isActive = theme === value
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`
              relative w-7 h-7 flex items-center justify-center rounded-full
              transition-all duration-200
              ${isActive
                ? 'bg-theme-text-canvas text-theme-bg-surface'
                : 'text-theme-text-tertiary hover:text-theme-text-secondary'
              }
            `}
            title={label}
            aria-label={label}
          >
            <Icon size={14} weight={isActive ? 'fill' : 'regular'} />
          </button>
        )
      })}
    </div>
  )
}
