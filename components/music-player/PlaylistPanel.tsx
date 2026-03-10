import React from 'react'
import { PlaylistPanelProps } from './types'

export function PlaylistPanel({
  playlist,
  currentSongId,
  isPlaying,
  onSongSelect,
}: PlaylistPanelProps) {
  return (
    <>
      <div className="border-t border-theme-border-muted pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-medium tracking-wider uppercase text-theme-text-tertiary">
            Playlist
          </span>
          <span className="text-[9px] text-theme-text-tertiary">{playlist.length} songs</span>
        </div>
        <div className="h-[90px] overflow-y-auto scrollbar-hide">
          {playlist.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-center text-[11px] text-theme-text-tertiary">暂无歌曲</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {playlist.map((song, i) => (
                <button
                  key={song.id}
                  onClick={() => onSongSelect(i)}
                  className={`w-full flex items-center gap-3 py-2 px-2 rounded-xl transition-all text-theme-text-secondary hover:bg-theme-surface-alt ${
                    currentSongId === song.id ? 'bg-theme-surface-alt' : ''
                  }`}
                >
                  <span className="text-[10px] font-mono w-4 text-theme-text-tertiary">
                    {(i + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-[11px] truncate leading-tight transition-colors text-theme-text-secondary">
                      {song.title}
                    </p>
                    <p className="text-[10px] truncate text-theme-text-tertiary">{song.artist}</p>
                  </div>
                  {currentSongId === song.id && isPlaying && (
                    <div className="flex items-end gap-0.5 h-3">
                      {[0, 1, 2].map((j) => (
                        <div
                          key={j}
                          className="music-player-sound-wave-small w-0.5 rounded-full bg-theme-text-secondary"
                          style={{
                            animation: 'sound 0.8s ease-in-out infinite',
                            animationDelay: `${j * 0.15}s`
                          }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes sound {
          0%, 100% { height: 30%; }
          50% { height: 100%; }
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  )
}
