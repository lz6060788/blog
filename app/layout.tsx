import { cookies } from 'next/headers'
import { routing } from './i18n/routing'
import './globals.css'
import './styles/base.css'
import './styles/themes.css'
import './styles/components/index.css'
import { ToastProvider } from '@/components/providers/toast-provider'
import { LazyMusicPlayer } from '@/components/music-player/LazyMusicPlayer'
import type { Metadata } from 'next'
import { absoluteUrl, getSiteUrl } from '@/lib/seo'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: siteConfig.blog.name,
  title: siteConfig.blog.name,
  description: siteConfig.blog.description,
  alternates: {
    types: {
      'application/rss+xml': absoluteUrl('/rss.xml'),
    },
  },
  openGraph: {
    type: 'website',
    siteName: siteConfig.blog.name,
    title: siteConfig.blog.name,
    description: siteConfig.blog.description,
    url: getSiteUrl(),
  },
}

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
        <LazyMusicPlayer />
      </body>
    </html>
  )
}
