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
      <div className="music-player-playlist border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="music-player-section-label text-[9px] font-medium tracking-wider uppercase">
            Playlist
          </span>
          <span className="music-player-section-count text-[9px]">{playlist.length} songs</span>
        </div>
        <div className="h-[90px] overflow-y-auto scrollbar-hide">
          {playlist.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="music-player-empty-text text-center text-[11px]">
                暂无歌曲
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {playlist.map((song, i) => (
                <button
                  key={song.id}
                  onClick={() => onSongSelect(i)}
                  className={`music-player-song-item w-full flex items-center gap-3 py-2 px-2 rounded-xl transition-all ${
                    currentSongId === song.id ? 'music-player-song-active' : ''
                  }`}
                >
                  <span className="music-player-song-number text-[10px] font-mono w-4">
                    {(i + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="flex-1 text-left min-w-0">
                    <p className="music-player-song-item-title text-[11px] truncate leading-tight transition-colors">
                      {song.title}
                    </p>
                    <p className="music-player-song-item-artist text-[10px] truncate">{song.artist}</p>
                  </div>
                  {currentSongId === song.id && isPlaying && (
                    <div className="flex items-end gap-0.5 h-3">
                      {[0, 1, 2].map((j) => (
                        <div
                          key={j}
                          className="music-player-sound-wave-small w-0.5 rounded-full"
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

        /* Scrollbar hide */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Playlist */
        .music-player-playlist {
          border-color: rgba(0, 0, 0, 0.1);
        }
        :global(.dark) .music-player-playlist {
          border-color: rgba(255, 255, 255, 0.1);
        }
        .music-player-empty-text {
          color: var(--text-muted);
        }
        .music-player-song-item {
          color: var(--text-secondary);
        }
        .music-player-song-item:hover {
          background: rgba(0, 0, 0, 0.04);
        }
        :global(.dark) .music-player-song-item:hover {
          background: rgba(255, 255, 255, 0.04);
        }
        .music-player-song-item.music-player-song-active {
          background: rgba(0, 0, 0, 0.06);
        }
        :global(.dark) .music-player-song-item.music-player-song-active {
          background: rgba(255, 255, 255, 0.06);
        }
        .music-player-song-number {
          color: var(--text-muted);
        }
        .music-player-song-item-title {
          color: var(--text-secondary);
        }
        .music-player-song-item.music-player-song-active .music-player-song-item-title {
          color: var(--text-canvas);
        }
        .music-player-song-item-artist {
          color: var(--text-muted);
        }
        .music-player-sound-wave-small {
          background: rgba(0, 0, 0, 0.6);
        }
        :global(.dark) .music-player-sound-wave-small {
          background: rgba(255, 255, 255, 0.6);
        }

        /* Section Labels */
        .music-player-section-label {
          color: var(--text-tertiary);
        }
        .music-player-section-count {
          color: var(--text-tertiary);
        }
      `}</style>
    </>
  )
}
