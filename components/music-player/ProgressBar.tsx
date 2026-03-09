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
    <>
      <div className="mb-4">
        <div
          data-progress-bar
          className="music-player-progress-bg relative h-1.5 rounded-full cursor-pointer group"
          onClick={onProgressChange}
          onMouseDown={onDragStart}
        >
          <div
            className="music-player-progress-fill absolute left-0 top-0 h-full rounded-full transition-all"
            style={{ width: `${progress}%` }}
          >
            <div className="music-player-progress-thumb absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_rgba(0,0,0,0.15)]" />
          </div>
        </div>
        <div className="music-player-time-labels flex justify-between text-[9px] mt-1.5 font-mono">
          <span>{formatDurationDisplay(currentTime)}</span>
          <span>{duration ? formatDuration(duration) : '0:00'}</span>
        </div>
      </div>

      <style jsx>{`
        /* Progress Bar */
        .music-player-progress-bg {
          background: rgba(0, 0, 0, 0.1);
        }
        :global(.dark) .music-player-progress-bg {
          background: rgba(255, 255, 255, 0.12);
        }
        .music-player-progress-fill {
          background: linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.8) 100%);
        }
        :global(.dark) .music-player-progress-fill {
          background: linear-gradient(90deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.9) 100%);
        }
        .music-player-progress-thumb {
          background: #171717;
        }
        :global(.dark) .music-player-progress-thumb {
          background: #ffffff;
        }
        .music-player-time-labels {
          color: var(--text-muted);
        }
      `}</style>
    </>
  )
}
