'use client'

import { motion } from 'framer-motion'
import { authItem } from './AuthLayout'
import { OAuthButtons } from './OAuthButtons'
import { FooterLinks } from './FooterLinks'
import { useTranslations } from 'next-intl'

interface AuthSectionProps {
  callbackUrl?: string
}

export function AuthSection({ callbackUrl }: AuthSectionProps) {
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

        {/* OAuth 按钮 */}
        <OAuthButtons callbackUrl={callbackUrl} />

        {/* 页脚链接 */}
        <FooterLinks />
      </motion.div>
    </motion.section>
  )
}
