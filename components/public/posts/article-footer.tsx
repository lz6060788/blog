'use client'

import { ArrowLeft } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { Link as IntlLink } from '@/app/i18n/routing'

export function ArticleFooter() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="mt-12 pt-8 border-t border-theme-border"
    >
      <IntlLink
        href="/"
        className="inline-flex items-center gap-2 text-theme-text-tertiary hover:text-theme-text-canvas transition-colors group"
      >
        <ArrowLeft size={16} />
        <span>Back to all posts</span>
      </IntlLink>
    </motion.footer>
  )
}
