import { cookies } from 'next/headers'
import { routing } from './i18n/routing'
import './globals.css'
import { ToastProvider } from '@/components/providers/toast-provider'
import { MusicPlayerWrapper } from '@/components/music-player/MusicPlayerWrapper'
import { SessionProvider } from '@/components/auth/SessionProvider'

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
        <SessionProvider>
          <ToastProvider />
          {children}
          <MusicPlayerWrapper />
        </SessionProvider>
      </body>
    </html>
  )
}
