'use client'

import { motion } from 'framer-motion'
import { CalendarDots } from '@phosphor-icons/react'
import { useTranslations } from 'next-intl'

export default function ArchiveHeader() {
  const t = useTranslations('archive')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10 md:mb-14"
    >
      <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-theme-accent-bg px-3 py-1.5 text-xs font-medium text-theme-accent-primary">
        <CalendarDots size={14} weight="fill" />
        {t('eyebrow')}
      </div>
      <h1 className="text-5xl md:text-7xl tracking-tighter leading-none text-theme-text-canvas mb-5">
        {t('title')}
      </h1>
      <p className="text-lg text-theme-text-secondary leading-relaxed max-w-[65ch]">
        {t('description')}
      </p>
    </motion.div>
  )
}
