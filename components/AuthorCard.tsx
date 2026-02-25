'use client'

import { Author } from '@/lib/types'
import { motion } from 'framer-motion'
import { MapPin, Envelope, GithubLogo, TwitterLogo } from '@phosphor-icons/react'
import Image from 'next/image'

interface AuthorCardProps {
  author: Author
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

export default function AuthorCard({ author }: AuthorCardProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="sticky top-24"
    >
      <motion.div
        variants={item}
        className="bg-theme-card-bg rounded-[2rem] p-8 border border-theme-card shadow-card"
      >
        {/* Avatar */}
        <motion.div
          variants={item}
          className="relative w-32 h-32 mx-auto mb-6"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-full h-full rounded-full overflow-hidden border-4 border-theme-bg-surface-alt"
          >
            <Image
              src={author.avatar}
              alt={author.name}
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-theme-accent-secondary rounded-full border-4 border-theme-bg-surface"
          />
        </motion.div>

        {/* Name & Bio */}
        <motion.div variants={item} className="text-center mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-theme-text-canvas mb-2">
            {author.name}
          </h2>
          <p className="text-sm text-theme-text-secondary leading-relaxed max-w-[50ch] mx-auto">
            {author.bio}
          </p>
        </motion.div>

        {/* Info Grid */}
        <motion.div variants={item} className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-theme-bg-surface-alt rounded-2xl p-4">
            <MapPin size={20} className="text-theme-text-tertiary mb-2" />
            <p className="text-xs font-mono text-theme-text-secondary">位置</p>
            <p className="text-sm font-medium text-theme-text-canvas">{author.location}</p>
          </div>
          <div className="bg-theme-bg-surface-alt rounded-2xl p-4">
            <Envelope size={20} className="text-theme-text-tertiary mb-2" />
            <p className="text-xs font-mono text-theme-text-secondary">星座</p>
            <p className="text-sm font-medium text-theme-text-canvas">{author.zodiac}</p>
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div variants={item} className="flex justify-center gap-2">
          {author.social.github && (
            <motion.a
              href={`https://${author.social.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 flex items-center justify-center bg-theme-bg-surface-alt rounded-full hover:bg-theme-text-canvas hover:text-theme-bg-surface transition-colors group"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <GithubLogo
                size={20}
                className="text-theme-text-tertiary group-hover:text-theme-bg-surface transition-colors"
              />
            </motion.a>
          )}
          {author.social.twitter && (
            <motion.a
              href={`https://${author.social.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 flex items-center justify-center bg-theme-bg-surface-alt rounded-full hover:bg-theme-text-canvas hover:text-theme-bg-surface transition-colors group"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <TwitterLogo
                size={20}
                className="text-theme-text-tertiary group-hover:text-theme-bg-surface transition-colors"
              />
            </motion.a>
          )}
          <motion.a
            href={`mailto:${author.email}`}
            className="w-12 h-12 flex items-center justify-center bg-theme-bg-surface-alt rounded-full hover:bg-theme-text-canvas hover:text-theme-bg-surface transition-colors group"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Envelope
              size={20}
              className="text-theme-text-tertiary group-hover:text-theme-bg-surface transition-colors"
            />
          </motion.a>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
