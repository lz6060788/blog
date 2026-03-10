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
        className={`fixed bottom-6 ${position === 'left' ? 'left-6' : 'right-6'} rounded-full cursor-pointer z-50 hover:scale-110 transition-all duration-300 backdrop-blur-md border bg-theme-surface/80 border-theme-border shadow-card ${
          isMobile ? 'w-[56px] h-[56px]' : 'w-16 h-16'
        }`}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center gap-0.5">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="music-player-sound-wave w-0.5 rounded-full bg-theme-text-secondary"
                  style={{
                    animation: 'sound 0.8s ease-in-out infinite',
                    animationDelay: `${i * 0.15}s`,
                    height: '30%'
                  }}
                />
              ))}
            </div>
          )}
          <Music
            className={`relative z-10 transition-all duration-300 text-theme-text-canvas ${
              isPlaying ? 'scale-110' : 'scale-100'
            } ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`}
          />
          {isPlaying && (
            <div className="absolute top-3 right-3 w-2 h-2 bg-theme-success-primary rounded-full animate-pulse" />
          )}
        </div>
      </button>
      <style jsx>{`
        @keyframes sound {
          0%, 100% { height: 30%; }
          50% { height: 100%; }
        }
      `}</style>
    </>
  )
}
