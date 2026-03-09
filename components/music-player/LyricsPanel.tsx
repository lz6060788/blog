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
    <>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="music-player-section-label text-[9px] font-medium tracking-wider uppercase">
            Lyrics
          </span>
          {lyricLines.length > 0 && (
            <span className="music-player-section-count text-[9px]">{lyricLines.length} lines</span>
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
                  className={`music-player-lyric-line transition-all leading-relaxed px-2 ${
                    i === currentLyricIndex ? 'music-player-lyric-active font-medium' : ''
                  }`}
                >
                  {line.text}
                </p>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-center text-white/15 text-[11px]">No lyrics available</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        /* Scrollbar hide */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Section Labels */
        .music-player-section-label {
          color: var(--text-tertiary);
        }
        .music-player-section-count {
          color: var(--text-tertiary);
        }

        /* Lyrics */
        .music-player-lyric-line {
          color: var(--text-muted);
        }
        .music-player-lyric-line.music-player-lyric-active {
          color: var(--text-canvas);
        }
      `}</style>
    </>
  )
}
