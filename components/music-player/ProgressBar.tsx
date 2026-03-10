import React from 'react'
import { formatDuration, formatDurationDisplay } from '@/lib/music/mock-data'
import { ProgressBarProps } from './types'

export function ProgressBar({
  progress,
  currentTime,
  duration,
  onProgressChange,
  onDragStart,
}: ProgressBarProps) {
  return (
    <div className="mb-4">
      <div
        data-progress-bar
        className="relative h-1.5 rounded-full cursor-pointer group bg-theme-muted"
        onClick={onProgressChange}
        onMouseDown={onDragStart}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all bg-theme-text-canvas"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-theme-text-canvas" />
        </div>
      </div>
      <div className="flex justify-between text-[9px] mt-1.5 font-mono text-theme-text-tertiary">
        <span>{formatDurationDisplay(currentTime)}</span>
        <span>{duration ? formatDuration(duration) : '0:00'}</span>
      </div>
    </div>
  )
}
