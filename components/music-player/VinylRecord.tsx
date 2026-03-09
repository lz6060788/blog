import React from 'react'
import { Pause } from 'lucide-react'
import { VinylRecordProps } from './types'

export function VinylRecord({
  isPlaying,
  title,
  artist,
  glowIntensity,
}: VinylRecordProps) {
  return (
    <>
      <div className="relative flex-shrink-0">
        <div className="relative w-[100px] h-[100px]">
          {/* Breathing Glow Effect */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              zIndex: 5,
              background: `radial-gradient(circle, rgba(16, 185, 129, 0) 0%, rgba(16, 185, 129, 0) 60%, rgba(16, 185, 129, ${glowIntensity}) 70%, rgba(16, 185, 129, 0) 100%)`,
              animation: isPlaying ? 'glow-pulse 4s ease-in-out infinite' : 'none',
              filter: 'blur(8px)',
              transition: 'background 0.5s ease-in-out'
            }}
          />

          {/* Vinyl Disc */}
          <div
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              animation: isPlaying ? 'spin 12s linear infinite' : 'none',
              zIndex: 10
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black"></div>
            <div className="absolute inset-2 rounded-full border border-white/5"></div>
            <div className="absolute inset-4 rounded-full border border-white/5"></div>
            <div className="absolute inset-[32%] rounded-full overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white/90 font-bold text-sm" style={{ fontSize: '10px', lineHeight: 1 }}>
                {title.charAt(0)}
              </span>
            </div>
          </div>

          {/* Pause Overlay */}
          {!isPlaying && (
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 20
              }}
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Pause className="w-3 h-3 text-white" />
              </div>
            </div>
          )}

          {/* Tonearm */}
          <svg
            className="absolute -top-2 -right-2 w-16 h-16 pointer-events-none"
            style={{
              transformOrigin: '90% 90%',
              transform: isPlaying ? 'rotate(-25deg)' : 'rotate(-45deg)',
              transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              zIndex: 25
            }}
            viewBox="0 0 64 64"
          >
            <circle cx="56" cy="56" r="5" fill="url(#tonearmGradient)" />
            <path
              d="M 56 56 Q 32 50 22 32"
              stroke="url(#tonearmGradient)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="22" cy="32" r="2.5" fill="url(#tonearmGradient)" />
            <defs>
              <linearGradient id="tonearmGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.5" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Song Info */}
        <div className="mt-3 text-center">
          <h4 className="music-player-song-title font-medium text-sm tracking-tight">
            {title}
          </h4>
          <p className="music-player-song-artist text-xs mt-1">{artist}</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes glow-pulse {
          0%, 100% {
            opacity: 0.4;
            transform: scale(0.97);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.03);
          }
        }

        /* Song Info */
        .music-player-song-title {
          color: var(--text-canvas);
        }
        .music-player-song-artist {
          color: var(--text-secondary);
        }
      `}</style>
    </>
  )
}
