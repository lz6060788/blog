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
  onProgressChange: (e: React.MouseEvent<HTMLDivElement>) => void
  onProgressDragStart: () => void
  // Playback controls
  volume: number
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
  onProgressChange,
  onProgressDragStart,
  // Controls
  volume,
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
        }}
        onAnimationEnd={() => {
          if (isClosing) {
            onClose()
          }
        }}
      >
        <div className="relative">
          {/* Main Container */}
          <div
            className="music-player-panel rounded-3xl overflow-hidden backdrop-blur-xl border"
            data-theme-panel="true"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <span className="music-player-header-label text-[10px] font-medium tracking-wider uppercase">
                  Now Playing
                </span>
                <button
                  onClick={() => {
                    onClose()
                  }}
                  className="music-player-close-btn p-1 transition-colors"
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
                onProgressChange={onProgressChange}
                onDragStart={onProgressDragStart}
              />

              {/* Controls Row */}
              <PlaybackControls
                isPlaying={isPlaying}
                volume={volume}
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

        /* Main Panel */
        .music-player-panel {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15),
                      inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }
        :global(.dark) .music-player-panel {
          background: rgba(24, 24, 27, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        /* Header */
        .music-player-header-label {
          color: rgba(0, 0, 0, 0.7);
        }
        :global(.dark) .music-player-header-label {
          color: rgba(255, 255, 255, 0.6);
        }
        .music-player-close-btn {
          color: rgba(0, 0, 0, 0.5);
        }
        :global(.dark) .music-player-close-btn {
          color: rgba(255, 255, 255, 0.5);
        }
        .music-player-close-btn:hover {
          color: rgba(0, 0, 0, 0.8);
        }
        :global(.dark) .music-player-close-btn:hover {
          color: rgba(255, 255, 255, 0.8);
        }

        /* Theme Panel Dark Mode Override */
        :global(.dark) [data-theme-panel="true"] {
          background: rgba(24, 24, 27, 0.95) !important;
          border-color: rgba(255, 255, 255, 0.12) !important;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
        }
      `}</style>
    </>
  )
}
