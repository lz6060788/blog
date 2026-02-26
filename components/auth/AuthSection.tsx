'use client'

import { motion } from 'framer-motion'
import { authItem } from './AuthLayout'
import { OAuthButtons } from './OAuthButtons'
import { FooterLinks } from './FooterLinks'
import { useTranslations } from 'next-intl'
import { WarningCircle } from '@phosphor-icons/react'

interface AuthSectionProps {
  callbackUrl?: string
  error?: string | null
}

export function AuthSection({ callbackUrl, error }: AuthSectionProps) {
  const t = useTranslations('login')

  return (
    <motion.section
      variants={authItem}
      className="w-full lg:w-[45%] flex items-center justify-center p-6 lg:p-12"
    >
      <motion.div
        variants={authItem}
        className="w-full max-w-md bg-theme-card-bg border border-theme-card shadow-card rounded-[2rem] p-8"
      >
        {/* 欢迎信息 */}
        <div className="mb-8 text-center">
          <motion.h1
            variants={authItem}
            className="text-3xl font-semibold tracking-tight text-theme-text-canvas mb-2"
          >
            {t('welcome')}
          </motion.h1>
          <motion.p
            variants={authItem}
            className="text-theme-text-secondary"
          >
            {t('subtitle')}
          </motion.p>
        </div>

        {/* 错误提示 */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
          >
            <WarningCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                登录失败
              </p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                未授权访问，只有管理员可以登录此博客。
              </p>
            </div>
          </motion.div>
        )}

        {/* OAuth 按钮 */}
        <OAuthButtons callbackUrl={callbackUrl} />

        {/* 页脚链接 */}
        <FooterLinks />
      </motion.div>
    </motion.section>
  )
}
