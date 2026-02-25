'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ComponentProps } from 'react'

/**
 * 主题提供程序
 *
 * 包装 next-themes 的 ThemeProvider，设置默认主题为浅色
 */
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
