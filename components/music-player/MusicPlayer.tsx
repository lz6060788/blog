'use client'

import React, { useState, useEffect } from 'react'
import { Music, X } from 'lucide-react'
import { useMusicStore } from '@/stores/music-store'
import { parseLrc } from '@/lib/music/mock-data'
import { MusicPlayerProps, LyricLine } from './types'
import { CollapsedWidget } from './CollapsedWidget'
import { ExpandedPlayer } from './ExpandedPlayer'
import { useLyricsSync, useProgressBar, useVolumeControl, useMobileDetection } from './hooks'

export function MusicPlayer({
  glowColor = '#ffffff',
  glowIntensity = 0.6,
  position = 'right'
}: MusicPlayerProps = {}) {
  const [mounted, setMounted] = useState(false)
  const [lyricLines, setLyricLines] = useState<LyricLine[]>([])
  const [isClosing, setIsClosing] = useState(false)
  const isMobile = useMobileDetection()

  const {
    isPlaying,
    currentSong,
    progress,
    volume,
    playlist,
    isExpanded,
    audio,
    toggle,
    play,
    pause,
    next,
    prev,
    setProgress,
    setVolume,
    setPlaylist,
    playSongAtIndex,
    toggleExpand,
    initializeAudio
  } = useMusicStore()

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset closing state when expanded
  useEffect(() => {
    if (isExpanded) {
      setIsClosing(false)
    }
  }, [isExpanded])

  useEffect(() => {
    initializeAudio()
    // Load songs from API
    fetch('/api/music/songs')
      .then(res => res.json())
      .then(data => {
        const songs = data.data || []
        setPlaylist(songs) // 使用空数组或实际数据，不再回退到虚假数据
      })
      .catch(err => {
        console.error('Failed to load songs:', err)
        setPlaylist([]) // 失败时也使用空数组
      })
    return () => {
      if (isPlaying) pause()
    }
  }, [])

  useEffect(() => {
    if (currentSong?.lyrics) {
      setLyricLines(parseLrc(currentSong.lyrics))
    } else {
      setLyricLines([])
    }
  }, [currentSong])

  // Use custom hooks
  const { currentLyricIndex, lyricsContainerRef, lyricItemsRef } = useLyricsSync(lyricLines, audio)
  const { isDragging: isProgressDragging, handleProgressChange, startDrag: startProgressDrag } = useProgressBar(setProgress)
  const { isDragging: isVolumeDragging, handleVolumeChange, startDrag: startVolumeDrag } = useVolumeControl(setVolume)

  const handlePlayPause = () => {
    if (!currentSong && playlist.length > 0) {
      play(playlist[0])
    } else {
      toggle()
    }
  }

  const handleClose = () => {
    setIsClosing(true)
  }

  // Handle animation end - toggle expand state after slideOut completes
  const handleAnimationEnd = () => {
    if (isClosing) {
      setIsClosing(false)
      toggleExpand()
    }
  }

  const displaySong = currentSong || playlist[0]
  if (!mounted) return null

  return (
    <React.Fragment>
      {/* Collapsed Widget */}
      {!isExpanded && (
        <CollapsedWidget
          isPlaying={isPlaying && !!displaySong}
          isMobile={isMobile}
          position={position}
          onClick={toggleExpand}
          ariaLabel={displaySong ? '打开音乐播放器' : '音乐播放器（暂无曲目）'}
        />
      )}

      {/* Empty library panel: keep the player interactive even before music is added. */}
      {isExpanded && !displaySong && (
        <section
          className={`fixed bottom-6 ${position === 'left' ? 'left-6' : 'right-6'} z-50 w-[min(20rem,calc(100vw-3rem))] rounded-2xl border border-theme-border bg-theme-surface/95 p-5 shadow-card backdrop-blur-md`}
          aria-label="音乐播放器"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-theme-muted text-theme-text-canvas">
                <Music className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-theme-text-canvas">音乐播放器</p>
                <p className="mt-1 text-xs text-theme-text-tertiary">音乐库中还没有可播放的曲目</p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleExpand}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-theme-text-secondary transition-colors hover:bg-theme-muted hover:text-theme-text-canvas"
              aria-label="收起音乐播放器"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {/* Expanded Player */}
      {isExpanded && displaySong && (
        <ExpandedPlayer
          isMobile={isMobile}
          position={position}
          glowIntensity={glowIntensity}
          isClosing={isClosing}
          onClose={handleClose}
          onAnimationEnd={handleAnimationEnd}
          // Vinyl
          isPlaying={isPlaying}
          title={displaySong.title}
          artist={displaySong.artist}
          // Lyrics
          lyricLines={lyricLines}
          currentLyricIndex={currentLyricIndex}
          lyricsContainerRef={lyricsContainerRef}
          lyricItemsRef={lyricItemsRef}
          // Progress
          progress={progress}
          currentTime={audio?.currentTime || 0}
          duration={displaySong.duration || 0}
          isProgressDragging={isProgressDragging}
          onProgressChange={handleProgressChange}
          onProgressDragStart={startProgressDrag}
          // Controls
          volume={volume}
          isVolumeDragging={isVolumeDragging}
          onPlayPause={handlePlayPause}
          onPrev={prev}
          onNext={next}
          onVolumeChange={handleVolumeChange}
          onVolumeDragStart={startVolumeDrag}
          // Playlist
          playlist={playlist}
          currentSongId={currentSong?.id}
          onSongSelect={playSongAtIndex}
        />
      )}

      <style jsx>{`
        /* Scrollbar hide */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </React.Fragment>
  )
}
