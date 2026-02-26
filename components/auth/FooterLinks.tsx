'use client'

import { motion } from 'framer-motion'
import { authItem } from './AuthLayout'
import { useTranslations } from 'next-intl'
import { Link } from '@/app/i18n/routing'

export function FooterLinks() {
  const t = useTranslations('login')

  return (
    <motion.div
      variants={authItem}
      className="mt-8 pt-6 border-t border-theme-border-muted text-center"
    >
      <div className="flex items-center justify-center gap-4 text-sm text-theme-text-secondary">
        <Link
          href="/terms"
          className="hover:text-theme-text-canvas transition-colors"
        >
          {t('footer.terms')}
        </Link>
        <span className="text-theme-border-subtle">•</span>
        <Link
          href="/privacy"
          className="hover:text-theme-text-canvas transition-colors"
        >
          {t('footer.privacy')}
        </Link>
      </div>

      <Link
        href="/"
        className="mt-4 inline-block text-sm text-theme-text-tertiary hover:text-theme-text-secondary transition-colors"
      >
        {t('footer.backToHome')}
      </Link>
    </motion.div>
  )
}
