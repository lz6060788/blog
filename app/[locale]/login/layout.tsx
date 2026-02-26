import { ReactNode } from 'react'

export const metadata = {
  title: '登录',
  description: '登录到博客以访问更多功能',
}

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
