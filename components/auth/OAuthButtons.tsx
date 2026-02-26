'use client'

import { motion } from 'framer-motion'
import { authItem } from './AuthLayout'
import { OAuthButton } from './OAuthButton'

interface OAuthButtonsProps {
  callbackUrl?: string
}

// 支持的 OAuth 提供商列表
// 注意：实际可用的 provider 由后端 NextAuth 配置决定
// 如果某个 provider 未配置，NextAuth 会返回错误
const PROVIDERS: Array<'github' | 'google'> = ['github', 'google']

export function OAuthButtons({ callbackUrl }: OAuthButtonsProps) {
  return (
    <motion.div
      variants={authItem}
      className="space-y-3"
    >
      {PROVIDERS.map((provider) => (
        <OAuthButton
          key={provider}
          provider={provider}
          callbackUrl={callbackUrl}
        />
      ))}
    </motion.div>
  )
}
