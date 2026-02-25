import { routing } from './i18n/routing'
import { notFound } from 'next/navigation'

// 此文件用于 next-intl 路由
// 实际布局在 [locale]/layout.tsx 中

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
