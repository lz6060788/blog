import type { Metadata } from 'next'
import { Outfit, JetBrains_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/app/i18n/routing'
import { ThemeProvider } from '@/components/ThemeProvider'
import '../globals.css'

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

export const metadata: Metadata = {
  title: 'Personal Blog',
  description: 'A minimalist personal blog with asymmetric design',
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // 确保传入的语言环境是有效的
  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  // 获取翻译消息
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${outfit.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="bg-theme-bg-canvas text-theme-text-canvas antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
