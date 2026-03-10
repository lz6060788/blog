import React from 'react'
import { LyricsPanelProps } from './types'

export function LyricsPanel({
  lyricLines,
  currentLyricIndex,
  lyricsContainerRef,
  lyricItemsRef,
}: LyricsPanelProps & {
  lyricsContainerRef: React.RefObject<HTMLDivElement>
  lyricItemsRef: React.MutableRefObject<Map<number, HTMLParagraphElement>>
}) {
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-medium tracking-wider uppercase text-theme-text-tertiary">Lyrics</span>
        {lyricLines.length > 0 && (
          <span className="text-[9px] text-theme-text-tertiary">{lyricLines.length} lines</span>
        )}
      </div>
      <div
        ref={lyricsContainerRef}
        className="h-[140px] overflow-y-auto overflow-x-hidden scrollbar-hide scroll-smooth"
      >
        {lyricLines.length > 0 ? (
          <div className="text-[11px] space-y-2 py-2">
            {lyricLines.map((line, i) => (
              <p
                key={i}
                ref={(el) => {
                  if (el) {
                    lyricItemsRef.current.set(i, el)
                  }
                }}
                className={`transition-all leading-relaxed px-2 text-theme-text-tertiary ${
                  i === currentLyricIndex ? 'text-theme-text-canvas font-medium' : ''
                }`}
              >
                {line.text}
              </p>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-center text-theme-text-tertiary text-[11px]">No lyrics available</p>
          </div>
        )}
      </div>
    </div>
  )
}
