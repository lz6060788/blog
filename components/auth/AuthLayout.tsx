'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

// 动画 variants 对象（container + item 模式）
export const authContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

export const authItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <motion.div
      variants={authContainer}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-theme-bg-canvas flex"
    >
      {children}
    </motion.div>
  )
}
