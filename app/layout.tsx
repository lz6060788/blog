import { cookies } from 'next/headers'
import { routing } from './i18n/routing'
import './globals.css'
// Cherry Markdown 样式（仅在需要编辑器的页面加载）
import 'cherry-markdown/dist/cherry-markdown.css'
import { ToastProvider } from '@/components/providers/toast-provider'
import { MusicPlayerWrapper } from '@/components/music-player/MusicPlayerWrapper'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 获取当前 locale，默认为 'en'
  const cookieStore = cookies()
  const localeCookie = cookieStore.get('NEXT_LOCALE')
  const locale = localeCookie?.value || routing.defaultLocale

  return (
    <html lang={locale} className="theme-light" suppressHydrationWarning>
      <body className="bg-theme-canvas text-theme-text-canvas antialiased">
        <ToastProvider />
        {children}
        <MusicPlayerWrapper />
      </body>
    </html>
  )
}
