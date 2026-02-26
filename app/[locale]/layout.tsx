import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/app/i18n/routing'
import { ThemeProvider } from '@/components/ThemeProvider'
import { SessionProvider } from '@/components/auth/SessionProvider'

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
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange={false}
    >
      <SessionProvider>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
