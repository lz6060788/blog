'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Cursor, List, House } from '@phosphor-icons/react'
import { ThemeToggle } from './ThemeToggle'
import { LanguageSwitcher } from './LanguageSwitcher'
import { UserMenu } from './auth/UserMenu'
import { LoginButton } from './auth/LoginButton'
import { useSession } from 'next-auth/react'
import { Link } from '@/app/i18n/routing'
import { useTranslations } from 'next-intl'

export default function Navigation() {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const { data: session, status } = useSession()

  const navLinks = [
    { href: '/', label: t('home'), icon: House },
    { href: '/archive', label: t('archive'), icon: List },
  ]

  // 获取不含 locale 的路径用于活动状态检查
  const getPathnameWithoutLocale = (path: string) => {
    const segments = path.split('/')
    if (segments.length > 1 && (segments[1] === 'en' || segments[1] === 'zh')) {
      return '/' + segments.slice(2).join('/')
    }
    return path
  }

  const currentPathname = getPathnameWithoutLocale(pathname)

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-theme-nav backdrop-blur-md border-b border-theme-border"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 90 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <Cursor size={24} weight="bold" className="text-theme-text-canvas" />
          </motion.div>
          <span className="font-mono text-sm text-theme-text-secondary">alex.blog</span>
        </Link>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <ThemeToggle />
          {status === "loading" ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
          ) : session ? (
            <UserMenu />
          ) : (
            <div className="hidden md:block">
              <LoginButton />
            </div>
          )}
          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = currentPathname === link.href || (link.href !== '/' && currentPathname.startsWith(link.href))

              return (
                <Link
                  key={link.href}
                  href={link.href}
                >
                  <motion.div
                    className="relative px-4 py-2 flex items-center gap-2 text-sm font-medium"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Icon size={18} weight={isActive ? 'fill' : 'regular'} />
                    <span className={isActive ? 'text-theme-text-canvas' : 'text-theme-text-secondary'}>
                      {link.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-theme-text-canvas"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
