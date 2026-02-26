import { cookies } from 'next/headers'
import { routing } from './i18n/routing'
import { Outfit, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/providers/toast-provider'

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
})

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
    <html lang={locale} className={`${outfit.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="bg-theme-bg-canvas text-theme-text-canvas antialiased">
        <ToastProvider />
        {children}
      </body>
    </html>
  )
}
