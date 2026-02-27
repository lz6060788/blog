'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import AuthLayout from '@/components/auth/AuthLayout'
import { VisualSection } from '@/components/auth/VisualSection'
import { AuthSection } from '@/components/auth/AuthSection'
import { authContainer } from '@/components/auth/AuthLayout'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isClient, setIsClient] = useState(false)

  // 获取 callbackUrl 和错误信息
  const callbackUrl = searchParams.get('callbackUrl') || undefined
  const error = searchParams.get('error')

  // 客户端标记（确保水合一致）
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 设置页面标题
  useEffect(() => {
    document.title = '登录 - 管理后台'
  }, [])

  // 已登录用户重定向到后台
  useEffect(() => {
    if (status === 'authenticated' && isClient) {
      router.push(callbackUrl || '/admin')
    }
  }, [status, isClient, router, callbackUrl])

  // 加载状态
  if (status === 'loading' || !isClient) {
    return (
      <div className="min-h-screen bg-theme-bg-canvas flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-theme-accent-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-theme-text-secondary text-sm">加载中...</p>
        </div>
      </div>
    )
  }

  // 未登录显示登录页面
  return (
    <AuthLayout>
      {/* 移动端视觉区域 */}
      <div className="lg:hidden w-full bg-theme-bg-surface flex-col justify-center items-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-theme-bg-surface to-theme-bg-surface-alt opacity-50" />
        <div className="relative z-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 flex items-center justify-center bg-theme-bg-surface-alt rounded-full">
              <span className="font-mono text-2xl">⚡</span>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-theme-text-canvas mb-2">
            欢迎回来
          </h1>
          <p className="text-theme-text-secondary text-sm">
            登录以继续访问
          </p>
        </div>
      </div>

      {/* 桌面端视觉区域 */}
      <VisualSection />

      {/* 功能区域 */}
      <AuthSection callbackUrl={callbackUrl} error={error} />
    </AuthLayout>
  )
}
