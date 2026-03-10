'use client'

import React, { useState, useEffect } from 'react'
import { useMusicStore } from '@/stores/music-store'
import { mockSongs } from '@/lib/music/mock-data'
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
    // Load songs from API instead of mock data
    fetch('/api/music/songs')
      .then(res => res.json())
      .then(data => {
        const songs = data.data || []
        if (songs.length > 0) {
          setPlaylist(songs)
        } else {
          // Fallback to mock data if no songs in database
          setPlaylist(mockSongs)
        }
      })
      .catch(err => {
        console.error('Failed to load songs, using mock data:', err)
        setPlaylist(mockSongs)
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
      {!isExpanded && displaySong && (
        <CollapsedWidget
          isPlaying={isPlaying}
          isMobile={isMobile}
          position={position}
          onClick={toggleExpand}
        />
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
