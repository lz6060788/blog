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
    <>
      <div className="flex items-center gap-4 mb-4">
        <button className="music-player-control-btn transition-colors">
          <SkipBack className="w-4 h-4" onClick={onPrev} />
        </button>
        <button
          onClick={onPlayPause}
          className="music-player-play-btn w-9 h-9 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
        >
          {isPlaying ? (
            <Pause className="music-player-play-icon w-4 h-4" />
          ) : (
            <Play className="music-player-play-icon w-4 h-4 ml-0.5" fill="currentColor" />
          )}
        </button>
        <button className="music-player-control-btn transition-colors">
          <SkipForward className="w-4 h-4" onClick={onNext} />
        </button>

        {/* Volume */}
        <div className="flex items-center gap-2 flex-1 ml-auto">
          <Volume2 className="music-player-volume-icon w-3.5 h-3.5" />
          <div
            data-volume-bar
            className="music-player-volume-bg flex-1 h-1.5 rounded-full cursor-pointer group"
            onClick={onVolumeChange}
            onMouseDown={onVolumeDragStart}
          >
            <div
              className="music-player-volume-fill h-full rounded-full relative transition-all"
              style={{ width: `${volume}%` }}
            >
              <div className="music-player-volume-thumb absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <span className="music-player-volume-label text-[9px] font-mono w-6 text-right">{Math.round(volume)}%</span>
        </div>
      </div>

      <style jsx>{`
        /* Controls */
        .music-player-control-btn {
          color: rgba(0, 0, 0, 0.4);
        }
        :global(.dark) .music-player-control-btn {
          color: rgba(255, 255, 255, 0.4);
        }
        .music-player-control-btn:hover {
          color: rgba(0, 0, 0, 0.8);
        }
        :global(.dark) .music-player-control-btn:hover {
          color: rgba(255, 255, 255, 0.8);
        }
        .music-player-play-btn {
          background: #171717;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        :global(.dark) .music-player-play-btn {
          background: #fafafa;
          box-shadow: 0 2px 10px rgba(255, 255, 255, 0.2);
        }
        .music-player-play-icon {
          color: #ffffff;
        }
        :global(.dark) .music-player-play-icon {
          color: #171717;
        }

        /* Volume */
        .music-player-volume-icon {
          color: rgba(0, 0, 0, 0.4);
        }
        :global(.dark) .music-player-volume-icon {
          color: rgba(255, 255, 255, 0.4);
        }
        .music-player-volume-bg {
          background: rgba(0, 0, 0, 0.1);
        }
        :global(.dark) .music-player-volume-bg {
          background: rgba(255, 255, 255, 0.12);
        }
        .music-player-volume-fill {
          background: rgba(0, 0, 0, 0.5);
        }
        :global(.dark) .music-player-volume-fill {
          background: rgba(255, 255, 255, 0.5);
        }
        .music-player-volume-thumb {
          background: rgba(0, 0, 0, 0.7);
        }
        :global(.dark) .music-player-volume-thumb {
          background: rgba(255, 255, 255, 0.7);
        }
        .music-player-volume-label {
          color: var(--text-muted);
        }
      `}</style>
    </>
  )
}
