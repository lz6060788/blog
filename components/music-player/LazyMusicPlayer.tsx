'use client'

import dynamic from 'next/dynamic'

const MusicPlayerWrapper = dynamic(
  () => import('./MusicPlayerWrapper').then((module) => module.MusicPlayerWrapper),
  { ssr: false },
)

export function LazyMusicPlayer() {
  return <MusicPlayerWrapper />
}
