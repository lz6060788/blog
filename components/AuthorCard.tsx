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
        className="bg-white rounded-[2rem] p-8 border border-zinc-200/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]"
      >
        {/* Avatar */}
        <motion.div
          variants={item}
          className="relative w-32 h-32 mx-auto mb-6"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-full h-full rounded-full overflow-hidden border-4 border-zinc-100"
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
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-400 rounded-full border-4 border-white"
          />
        </motion.div>

        {/* Name & Bio */}
        <motion.div variants={item} className="text-center mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 mb-2">
            {author.name}
          </h2>
          <p className="text-sm text-zinc-500 leading-relaxed max-w-[50ch] mx-auto">
            {author.bio}
          </p>
        </motion.div>

        {/* Info Grid */}
        <motion.div variants={item} className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-zinc-50 rounded-2xl p-4">
            <MapPin size={20} className="text-zinc-400 mb-2" />
            <p className="text-xs font-mono text-zinc-500">位置</p>
            <p className="text-sm font-medium text-zinc-900">{author.location}</p>
          </div>
          <div className="bg-zinc-50 rounded-2xl p-4">
            <Envelope size={20} className="text-zinc-400 mb-2" />
            <p className="text-xs font-mono text-zinc-500">星座</p>
            <p className="text-sm font-medium text-zinc-900">{author.zodiac}</p>
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div variants={item} className="flex justify-center gap-2">
          {author.social.github && (
            <motion.a
              href={`https://${author.social.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 flex items-center justify-center bg-zinc-50 rounded-full hover:bg-zinc-900 transition-colors group"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <GithubLogo
                size={20}
                className="text-zinc-400 group-hover:text-white transition-colors"
              />
            </motion.a>
          )}
          {author.social.twitter && (
            <motion.a
              href={`https://${author.social.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 flex items-center justify-center bg-zinc-50 rounded-full hover:bg-zinc-900 transition-colors group"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <TwitterLogo
                size={20}
                className="text-zinc-400 group-hover:text-white transition-colors"
              />
            </motion.a>
          )}
          <motion.a
            href={`mailto:${author.email}`}
            className="w-12 h-12 flex items-center justify-center bg-zinc-50 rounded-full hover:bg-zinc-900 transition-colors group"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Envelope
              size={20}
              className="text-zinc-400 group-hover:text-white transition-colors"
            />
          </motion.a>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
