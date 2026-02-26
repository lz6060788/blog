'use client'

import { motion } from 'framer-motion'
import { GithubLogo, GoogleLogo } from '@phosphor-icons/react'
import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

interface OAuthButtonProps {
  provider: 'github' | 'google'
  callbackUrl?: string
}

const providerConfig = {
  github: {
    id: 'github' as const,
    labelKey: 'github',
    icon: GithubLogo,
    className: 'bg-theme-btn-bg-primary text-theme-btn-text-primary hover:bg-theme-btn-bg-primary-hover',
  },
  google: {
    id: 'google' as const,
    labelKey: 'google',
    icon: GoogleLogo,
    className: 'bg-theme-btn-ghost text-theme-btn-text-ghost hover:bg-theme-btn-bg-ghost-hover border border-theme-border',
  },
}

export function OAuthButton({ provider, callbackUrl }: OAuthButtonProps) {
  const t = useTranslations('login')
  const [isLoading, setIsLoading] = useState(false)
  const config = providerConfig[provider]
  const Icon = config.icon

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await signIn(config.id, { callbackUrl: callbackUrl || '/' })
    } catch (error) {
      console.error('OAuth sign-in error:', error)
      setIsLoading(false)
    }
  }

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      onClick={handleClick}
      disabled={isLoading}
      className={`
        w-full px-4 py-3 rounded-2xl flex items-center justify-center gap-3
        font-sans text-sm font-medium transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent-primary focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${config.className}
      `}
      aria-label={t(config.labelKey)}
    >
      <Icon size={20} weight="bold" className="flex-shrink-0" />
      <span>{t(config.labelKey)}</span>
      {isLoading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
        />
      )}
    </motion.button>
  )
}
