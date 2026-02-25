'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Cursor, List, House } from '@phosphor-icons/react'

const navLinks = [
  { href: '/', label: 'Home', icon: House },
  { href: '/archive', label: 'Archive', icon: List },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-zinc-50/80 backdrop-blur-md border-b border-zinc-200/50"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 90 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <Cursor size={24} weight="bold" className="text-zinc-900" />
          </motion.div>
          <span className="font-mono text-sm text-zinc-600">alex.blog</span>
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href

            return (
              <Link key={link.href} href={link.href}>
                <motion.div
                  className="relative px-4 py-2 flex items-center gap-2 text-sm font-medium"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Icon size={18} weight={isActive ? 'fill' : 'regular'} />
                  <span className={isActive ? 'text-zinc-900' : 'text-zinc-500'}>
                    {link.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </div>
      </div>
    </motion.nav>
  )
}
