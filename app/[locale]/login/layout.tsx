import { ReactNode } from 'react'
import type { Metadata } from 'next'
import { SessionProvider } from '@/components/auth/SessionProvider'

export const metadata: Metadata = {
  title: '登录',
  description: '登录到博客以访问更多功能',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      noimageindex: true,
    },
  },
}

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
