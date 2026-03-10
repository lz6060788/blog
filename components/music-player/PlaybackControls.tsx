import React from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { PlaybackControlsProps } from './types'

export function PlaybackControls({
  isPlaying,
  volume,
  onPlayPause,
  onPrev,
  onNext,
  onVolumeChange,
  onVolumeDragStart,
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <button className="text-theme-text-secondary hover:text-theme-text-canvas transition-colors">
        <SkipBack className="w-4 h-4" onClick={onPrev} />
      </button>
      <button
        onClick={onPlayPause}
        className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-105 transition-transform bg-theme-text-canvas text-theme-text-reversed"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
        )}
      </button>
      <button className="text-theme-text-secondary hover:text-theme-text-canvas transition-colors">
        <SkipForward className="w-4 h-4" onClick={onNext} />
      </button>

      <div className="flex items-center gap-2 flex-1 ml-auto">
        <Volume2 className="w-3.5 h-3.5 text-theme-text-secondary" />
        <div
          data-volume-bar
          className="flex-1 h-1.5 rounded-full cursor-pointer group bg-theme-muted"
          onClick={onVolumeChange}
          onMouseDown={onVolumeDragStart}
        >
          <div
            className="h-full rounded-full relative transition-all bg-theme-text-secondary"
            style={{ width: `${volume}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-theme-text-canvas" />
          </div>
        </div>
        <span className="text-[9px] font-mono w-6 text-right text-theme-text-tertiary">{Math.round(volume)}%</span>
      </div>
    </div>
  )
}
