'use client'

import { motion } from 'framer-motion'

export default function ArchiveHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-16"
    >
      <h1 className="text-5xl md:text-7xl tracking-tighter leading-none text-theme-text-canvas mb-4">
        Archive
      </h1>
      <p className="text-lg text-theme-text-secondary leading-relaxed max-w-[65ch]">
        All posts, organized by year. A chronological journey through
        thoughts on design, development, and everything in between.
      </p>
    </motion.div>
  )
}
