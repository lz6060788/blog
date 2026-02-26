'use client'

import { motion } from 'framer-motion'
import { authItem } from './AuthLayout'
import { BrandMessaging } from './BrandMessaging'

export function VisualSection() {
  return (
    <motion.section
      variants={authItem}
      className="hidden lg:flex lg:w-[55%] bg-theme-bg-surface flex-col justify-center items-center p-12 relative overflow-hidden"
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-theme-bg-surface to-theme-bg-surface-alt opacity-50" />

      {/* 品牌内容 */}
      <div className="relative z-10 text-center max-w-lg">
        <BrandMessaging />
      </div>

      {/* 装饰性圆圈 */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 right-20 w-32 h-32 rounded-full bg-theme-accent-bg blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-20 left-20 w-40 h-40 rounded-full bg-theme-accent-bg-subtle blur-3xl"
      />
    </motion.section>
  )
}
