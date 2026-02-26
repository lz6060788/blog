'use client'

import { motion } from 'framer-motion'
import { authItem } from './AuthLayout'
import { Cursor } from '@phosphor-icons/react'
import { useTranslations } from 'next-intl'

export function BrandMessaging() {
  const t = useTranslations('login')

  return (
    <motion.div
      variants={authItem}
      className="space-y-6"
    >
      {/* Logo 图标 */}
      <motion.div
        variants={authItem}
        className="flex justify-center mb-8"
        whileHover={{ rotate: 90 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <Cursor size={64} weight="bold" className="text-theme-text-canvas" />
      </motion.div>

      {/* 主标题 */}
      <motion.h1
        variants={authItem}
        className="text-5xl font-semibold tracking-tight text-theme-text-canvas mb-4"
      >
        {t('brand.title')}
      </motion.h1>

      {/* 副标题 */}
      <motion.p
        variants={authItem}
        className="text-xl text-theme-text-secondary leading-relaxed"
      >
        {t('brand.subtitle')}
      </motion.p>

      {/* 装饰性标签 */}
      <motion.div
        variants={authItem}
        className="flex items-center justify-center gap-2 mt-8"
      >
        <span className="font-mono text-xs text-theme-text-tertiary uppercase tracking-wider">
          /login
        </span>
        <div className="w-12 h-px bg-theme-border-subtle" />
      </motion.div>
    </motion.div>
  )
}
