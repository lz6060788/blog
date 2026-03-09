import React from 'react'
import { Music } from 'lucide-react'
import { CollapsedWidgetProps } from './types'

export function CollapsedWidget({
  isPlaying,
  isMobile,
  position,
  onClick,
}: CollapsedWidgetProps) {
  return (
    <>
      <button
        onClick={onClick}
        className={`music-player-float-btn fixed bottom-6 ${position === 'left' ? 'left-6' : 'right-6'} rounded-full cursor-pointer z-50 hover:scale-110 transition-all duration-300 backdrop-blur-md border ${
          isMobile ? 'w-[56px] h-[56px]' : 'w-16 h-16'
        }`}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Animated sound waves when playing */}
          {isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center gap-0.5">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="music-player-sound-wave w-0.5 rounded-full"
                  style={{
                    animation: `sound 0.8s ease-in-out infinite`,
                    animationDelay: `${i * 0.15}s`,
                    height: '30%'
                  }}
                />
              ))}
            </div>
          )}
          {/* Music Note Icon */}
          <Music
            className={`music-player-icon relative z-10 transition-all duration-300 ${
              isPlaying ? 'scale-110' : 'scale-100'
            } ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`}
          />
          {/* Playing indicator dot */}
          {isPlaying && (
            <div
              className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"
              style={{
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
              }}
            />
          )}
        </div>
      </button>
      <style jsx>{`
        @keyframes sound {
          0%, 100% { height: 30%; }
          50% { height: 100%; }
        }

        /* Floating Button */
        .music-player-float-btn {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 0, 0, 0.15);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15),
                      inset 0 1px 1px rgba(255, 255, 255, 0.9),
                      inset 0 -1px 1px rgba(0, 0, 0, 0.05);
        }
        :global(.dark) .music-player-float-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
                      inset 0 1px 1px rgba(255, 255, 255, 0.15),
                      inset 0 -1px 1px rgba(0, 0, 0, 0.1);
        }
        .music-player-icon {
          color: #000000;
        }
        :global(.dark) .music-player-icon {
          color: #ffffff;
        }
        .music-player-sound-wave {
          background: rgba(0, 0, 0, 0.6);
        }
        :global(.dark) .music-player-sound-wave {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </>
  )
}
