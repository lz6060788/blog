'use client'

import { MilkdownPreview } from '@/components/editor/milkdown'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface ArticleContentProps {
  content: string
  initialTheme?: 'light' | 'dark'
}

export function ArticleContent({ content, initialTheme = 'light' }: ArticleContentProps) {
  const { theme, systemTheme } = useTheme()
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(initialTheme)

  // 同步主题状态
  useEffect(() => {
    if (theme === 'system') {
      setCurrentTheme((systemTheme as 'light' | 'dark') || 'light')
    } else {
      setCurrentTheme((theme as 'light' | 'dark') || 'light')
    }
  }, [theme, systemTheme])

  return (
    <div className="cherry-preview-wrapper" suppressHydrationWarning>
      <MilkdownPreview
        content={content}
        theme={currentTheme}
      />
    </div>
  )
}
