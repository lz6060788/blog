import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/app/i18n/routing'
import { ThemeProvider } from '@/components/ThemeProvider'
import { getSettings } from '@/server/db/queries/settings'
import { localeToOpenGraph } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const settings = await getSettings()

  return {
    title: {
      default: settings.blogName,
      template: `%s | ${settings.blogName}`,
    },
    description: settings.blogDescription,
    openGraph: {
      siteName: settings.blogName,
      description: settings.blogDescription,
      locale: localeToOpenGraph(params.locale),
    },
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const { locale } = params

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
      themes={["light", "dark"]}
      value={{ light: "theme-light", dark: "theme-dark" }}
      disableTransitionOnChange={false}
    >
      <NextIntlClientProvider messages={messages} locale={locale}>
        {children}
      </NextIntlClientProvider>
    </ThemeProvider>
  )
}
