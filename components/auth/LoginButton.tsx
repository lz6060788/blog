"use client"

import { motion } from "framer-motion"
import { GithubLogo } from "@phosphor-icons/react"
import { useTranslations } from "next-intl"
import { Link } from "@/app/i18n/routing"

export function LoginButton() {
  const t = useTranslations('login')

  return (
    <Link href="/login">
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="
          px-6 py-2.5 rounded-xl flex items-center gap-2
          font-sans text-sm font-medium transition-colors
          bg-theme-btn-ghost text-theme-btn-text-ghost
          hover:bg-theme-btn-bg-ghost-hover
          border border-theme-border
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent-primary focus-visible:ring-offset-2
        "
      >
        <GithubLogo size={18} weight="bold" />
        <span>{t('github')}</span>
      </motion.button>
    </Link>
  )
}
