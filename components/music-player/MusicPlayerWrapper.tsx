'use client'

import { useMusicStore } from '@/stores/music-store'
import { MusicPlayer } from './MusicPlayer'

export function MusicPlayerWrapper() {
  // Always show the player (both collapsed and expanded states)
  // This allows users to click the floating widget to open the player
  return <MusicPlayer />
}
