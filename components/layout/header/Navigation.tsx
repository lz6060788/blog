'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Cursor, List, House } from '@phosphor-icons/react'
import { ThemeToggle } from './ThemeToggle'
import { LanguageSwitcher } from './LanguageSwitcher'
import { Link } from '@/app/i18n/routing'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { GlobalSearch } from '@/components/search'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const NavigationAuth = dynamic(
  () => import('./NavigationAuth').then((module) => module.NavigationAuth),
  {
    ssr: false,
    loading: () => <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />,
  },
)

interface NavigationProps {
  blogName: string
}

export default function Navigation({ blogName }: NavigationProps) {
  const pathname = usePathname()
  const t = useTranslations('nav')

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex min-w-0 items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 90 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <Cursor size={24} weight="bold" className="text-theme-text-canvas" />
          </motion.div>
          <span className="truncate font-mono text-sm text-theme-text-secondary">{blogName}</span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <GlobalSearch />
          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher />
            <ThemeToggle />
            <NavigationAuth />
            <div className="flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = currentPathname === link.href || (link.href !== '/' && currentPathname.startsWith(link.href))

                return (
                  <Link key={link.href} href={link.href}>
                    <motion.div
                      className="relative px-3 py-2 flex items-center gap-2 text-sm font-medium"
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

          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label={t('menu')}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-theme-border bg-theme-surface text-theme-text-secondary shadow-sm transition-colors hover:border-theme-accent-primary hover:text-theme-text-canvas lg:hidden"
              >
                <List size={19} />
              </button>
            </SheetTrigger>
            <SheetContent className="flex w-[min(88vw,22rem)] flex-col bg-theme-card-bg p-6">
              <SheetHeader className="border-b border-theme-border pb-6 text-left">
                <SheetTitle className="font-mono text-base text-theme-text-canvas">{blogName}</SheetTitle>
              </SheetHeader>
              <nav className="mt-4 space-y-2">
                {navLinks.map((link) => {
                  const Icon = link.icon
                  const isActive = currentPathname === link.href || (link.href !== '/' && currentPathname.startsWith(link.href))
                  return (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-theme-accent-bg text-theme-accent-primary'
                            : 'text-theme-text-secondary hover:bg-theme-surface-alt hover:text-theme-text-canvas'
                        }`}
                      >
                        <Icon size={19} weight={isActive ? 'fill' : 'regular'} />
                        {link.label}
                      </Link>
                    </SheetClose>
                  )
                })}
              </nav>
              <div className="mt-auto border-t border-theme-border pt-6">
                <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-theme-text-tertiary">
                  {t('settings')}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <LanguageSwitcher />
                  <ThemeToggle />
                  <NavigationAuth />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  )
}
