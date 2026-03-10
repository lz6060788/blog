import React from 'react'
import { X } from 'lucide-react'
import { ExpandedPlayerProps } from './types'
import { VinylRecord } from './VinylRecord'
import { LyricsPanel } from './LyricsPanel'
import { ProgressBar } from './ProgressBar'
import { PlaybackControls } from './PlaybackControls'
import { PlaylistPanel } from './PlaylistPanel'

interface ExpandedPlayerPropsExtended extends ExpandedPlayerProps {
  // Vinyl data
  isPlaying: boolean
  title: string
  artist: string
  // Lyrics data
  lyricLines: Array<{ time: number; text: string }>
  currentLyricIndex: number
  lyricsContainerRef: React.RefObject<HTMLDivElement>
  lyricItemsRef: React.MutableRefObject<Map<number, HTMLParagraphElement>>
  // Progress data
  progress: number
  currentTime: number
  duration: number
  isProgressDragging: boolean
  onProgressChange: (e: React.MouseEvent<HTMLDivElement>) => void
  onProgressDragStart: () => void
  // Playback controls
  volume: number
  isVolumeDragging: boolean
  onPlayPause: () => void
  onPrev: () => void
  onNext: () => void
  onVolumeChange: (e: React.MouseEvent<HTMLDivElement>) => void
  onVolumeDragStart: () => void
  // Playlist data
  playlist: Array<{
    id: string
    title: string
    artist: string
  }>
  currentSongId?: string
  onSongSelect: (index: number) => void
}

export function ExpandedPlayer({
  isMobile,
  position,
  glowIntensity,
  isClosing,
  onClose,
  onAnimationEnd,
  // Vinyl
  isPlaying,
  title,
  artist,
  // Lyrics
  lyricLines,
  currentLyricIndex,
  lyricsContainerRef,
  lyricItemsRef,
  // Progress
  progress,
  currentTime,
  duration,
  isProgressDragging,
  onProgressChange,
  onProgressDragStart,
  // Controls
  volume,
  isVolumeDragging,
  onPlayPause,
  onPrev,
  onNext,
  onVolumeChange,
  onVolumeDragStart,
  // Playlist
  playlist,
  currentSongId,
  onSongSelect,
}: ExpandedPlayerPropsExtended) {
  return (
    <>
      <div
        className={`fixed bottom-6 ${position === 'left' ? 'left-6' : 'right-6'} z-50 ${
          isMobile ? 'w-[90vw] max-w-[380px]' : 'w-[480px]'
        }`}
        style={{
          animation: isClosing
            ? 'slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
            : 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden' as const,
        }}
        onAnimationEnd={() => {
          if (isClosing && onAnimationEnd) {
            onAnimationEnd()
          }
        }}
      >
        <div className="relative">
          {/* Main Container */}
          <div
            className="rounded-3xl overflow-hidden backdrop-blur-xl border bg-theme-surface/95 border-theme-border shadow-card"
            data-theme-panel="true"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] font-medium tracking-wider uppercase text-theme-text-tertiary">
                  Now Playing
                </span>
                <button
                  onClick={() => {
                    onClose()
                  }}
                  className="p-1 transition-colors text-theme-text-secondary hover:text-theme-text-canvas"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Top Section: Vinyl + Song Info + Lyrics */}
              <div className="flex gap-5 mb-5">
                <VinylRecord
                  isPlaying={isPlaying}
                  title={title}
                  artist={artist}
                  glowIntensity={glowIntensity}
                />
                <LyricsPanel
                  lyricLines={lyricLines}
                  currentLyricIndex={currentLyricIndex}
                  lyricsContainerRef={lyricsContainerRef}
                  lyricItemsRef={lyricItemsRef}
                />
              </div>

              {/* Progress Bar */}
              <ProgressBar
                progress={progress}
                currentTime={currentTime}
                duration={duration}
                isDragging={isProgressDragging}
                onProgressChange={onProgressChange}
                onDragStart={onProgressDragStart}
              />

              {/* Controls Row */}
              <PlaybackControls
                isPlaying={isPlaying}
                volume={volume}
                isVolumeDragging={isVolumeDragging}
                onPlayPause={onPlayPause}
                onPrev={onPrev}
                onNext={onNext}
                onVolumeChange={onVolumeChange}
                onVolumeDragStart={onVolumeDragStart}
              />

              {/* Playlist */}
              <PlaylistPanel
                playlist={playlist}
                currentSongId={currentSongId}
                isPlaying={isPlaying}
                onSongSelect={onSongSelect}
              />
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: ${position === 'left'
              ? 'translateX(-100px) scale(0.95)'
              : 'translateX(100px) scale(0.95)'};
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: ${position === 'left'
              ? 'translateX(-100px) scale(0.95)'
              : 'translateX(100px) scale(0.95)'};
          }
        }
      `}</style>
    </>
  )
}
