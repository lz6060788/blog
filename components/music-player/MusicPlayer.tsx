'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, X, Music } from 'lucide-react'
import { useMusicStore } from '@/stores/music-store'
import { mockSongs } from '@/lib/music/mock-data'
import { formatDuration, formatDurationDisplay, parseLrc } from '@/lib/music/mock-data'

interface MusicPlayerProps {
  glowColor?: string
  glowIntensity?: number
  position?: 'left' | 'right'
}

export function MusicPlayer({
  glowColor = '#ffffff',
  glowIntensity = 0.6,
  position = 'right'
}: MusicPlayerProps = {}) {
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [lyricLines, setLyricLines] = useState<Array<{ time: number; text: string }>>([])
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0)
  const lyricsContainerRef = useRef<HTMLDivElement>(null)
  const lyricItemsRef = useRef<Map<number, HTMLParagraphElement>>(new Map())
  const [isDraggingProgress, setIsDraggingProgress] = useState(false)
  const [isDraggingVolume, setIsDraggingVolume] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const {
    isPlaying,
    currentSong,
    progress,
    volume,
    playlist,
    isExpanded,
    audio,
    toggle,
    play,
    pause,
    next,
    prev,
    seek,
    setVolume,
    setProgress,
    setPlaylist,
    playSongAtIndex,
    toggleExpand,
    initializeAudio
  } = useMusicStore()

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset closing state when expanded
  useEffect(() => {
    if (isExpanded) {
      setIsClosing(false)
    }
  }, [isExpanded])

  useEffect(() => {
    initializeAudio()
    // Load songs from API instead of mock data
    fetch('/api/music/songs')
      .then(res => res.json())
      .then(data => {
        const songs = data.data || []
        if (songs.length > 0) {
          setPlaylist(songs)
        } else {
          // Fallback to mock data if no songs in database
          setPlaylist(mockSongs)
        }
      })
      .catch(err => {
        console.error('Failed to load songs, using mock data:', err)
        setPlaylist(mockSongs)
      })
    return () => {
      if (isPlaying) pause()
    }
  }, [])

  useEffect(() => {
    if (currentSong?.lyrics) {
      setLyricLines(parseLrc(currentSong.lyrics))
    } else {
      setLyricLines([])
    }
    setCurrentLyricIndex(0)
  }, [currentSong])

  // 歌词滚动和高亮
  useEffect(() => {
    if (lyricLines.length === 0 || !audio) return

    const currentTime = audio.currentTime
    const index = lyricLines.findIndex(
      (line, i) => currentTime >= line.time && (!lyricLines[i + 1] || currentTime < lyricLines[i + 1].time)
    )

    if (index !== currentLyricIndex) {
      setCurrentLyricIndex(index)

      // 滚动到当前歌词 - 使用 requestAnimationFrame 确保 DOM 更新后再滚动
      if (index >= 0 && lyricsContainerRef.current) {
        requestAnimationFrame(() => {
          const currentItem = lyricItemsRef.current.get(index)
          const container = lyricsContainerRef.current
          if (currentItem && container) {
            const containerRect = container.getBoundingClientRect()
            const itemRect = currentItem.getBoundingClientRect()
            const containerScrollTop = container.scrollTop

            // Calculate the position of the item relative to the scrollable content
            const relativeItemTop = itemRect.top - containerRect.top + containerScrollTop
            const containerHeight = container.clientHeight
            const itemHeight = itemRect.height

            // Target position: item should be centered in the visible area
            const scrollTarget = relativeItemTop - containerHeight / 2 + itemHeight / 2

            container.scrollTo({
              top: scrollTarget,
              behavior: 'smooth'
            })
          }
        })
      }
    }
  }, [audio?.currentTime, lyricLines])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handlePlayPause = () => {
    if (!currentSong && playlist.length > 0) {
      play(playlist[0])
    } else {
      toggle()
    }
  }

  const handleProgressChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newProgress = (clickX / rect.width) * 100
    setProgress(newProgress)
  }

  const handleProgressDrag = (clientX: number) => {
    if (!lyricsContainerRef.current) return
    const progressBars = document.querySelectorAll('[data-progress-bar]')
    progressBars.forEach((bar) => {
      const rect = bar.getBoundingClientRect()
      if (clientX >= rect.left && clientX <= rect.right) {
        const clickX = clientX - rect.left
        const newProgress = (clickX / rect.width) * 100
        setProgress(newProgress)
      }
    })
  }

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newVolume = Math.max(0, Math.min(100, (clickX / rect.width) * 100))
    setVolume(newVolume)
  }

  const handleVolumeDrag = (clientX: number) => {
    const volumeBars = document.querySelectorAll('[data-volume-bar]')
    volumeBars.forEach((bar) => {
      const rect = bar.getBoundingClientRect()
      if (clientX >= rect.left && clientX <= rect.right) {
        const clickX = clientX - rect.left
        const newVolume = Math.max(0, Math.min(100, (clickX / rect.width) * 100))
        setVolume(newVolume)
      }
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingProgress) {
        handleProgressDrag(e.clientX)
      }
      if (isDraggingVolume) {
        handleVolumeDrag(e.clientX)
      }
    }

    const handleMouseUp = () => {
      setIsDraggingProgress(false)
      setIsDraggingVolume(false)
    }

    if (isDraggingProgress || isDraggingVolume) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDraggingProgress, isDraggingVolume])

  const displaySong = currentSong || playlist[0]
  // Always show the player (at least the collapsed widget)
  // if (!displaySong && !isExpanded) return null

  return (
    <React.Fragment>
      {/* Collapsed Widget */}
      {!isExpanded && displaySong && (
        <button
          onClick={toggleExpand}
          className={`fixed bottom-6 ${position === 'left' ? 'left-6' : 'right-6'} rounded-full cursor-pointer z-50 hover:scale-110 transition-all duration-300 backdrop-blur-md border ${
            isMobile ? 'w-[56px] h-[56px]' : 'w-16 h-16'
          } bg-black/5 dark:bg-white/10 border-neutral-900/15 dark:border-white/20`}
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.9), inset 0 -1px 1px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Animated sound waves when playing */}
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center gap-0.5">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 rounded-full bg-neutral-900/60 dark:bg-white/50"
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
              className={`relative z-10 transition-all duration-300 ${
                isPlaying ? 'scale-110' : 'scale-100'
              } ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`}
              style={{ color: 'rgb(24, 24, 27)' }}
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
      )}

      {/* Expanded Player */}
      {isExpanded && (
        <div
          className={`fixed bottom-6 ${position === 'left' ? 'left-6' : 'right-6'} z-50 ${
            isMobile ? 'w-[90vw] max-w-[380px]' : 'w-[480px]'
          }`}
          style={{
            animation: isClosing
              ? 'slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
              : 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onAnimationEnd={() => {
            if (isClosing) {
              setIsClosing(false)
              toggleExpand()
            }
          }}
        >
          <div className="relative">
            {/* Main Container */}
            <div
              className="rounded-3xl overflow-hidden backdrop-blur-xl border"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderColor: 'rgba(0, 0, 0, 0.1)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
              }}
              data-theme-panel="true"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[10px] font-medium tracking-wider uppercase text-neutral-500/70 dark:text-neutral-400/60">
                    Now Playing
                  </span>
                  <button
                    onClick={() => {
                      setIsClosing(true)
                    }}
                    className="p-1 transition-colors text-neutral-500/50 hover:text-neutral-800 dark:text-neutral-400/50 dark:hover:text-neutral-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Top Section: Vinyl + Song Info */}
                <div className="flex gap-5 mb-5">
                  {/* Vinyl Record with Tonearm */}
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
                            {displaySong.title.charAt(0)}
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
                      <h4 className="font-medium text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
                        {displaySong.title}
                      </h4>
                      <p className="text-xs mt-1 text-neutral-500/80 dark:text-neutral-400/70">{displaySong.artist}</p>
                    </div>
                  </div>

                  {/* Lyrics Panel */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-medium tracking-wider uppercase text-neutral-500/60 dark:text-neutral-500/60">
                        Lyrics
                      </span>
                      {lyricLines.length > 0 && (
                        <span className="text-[9px] text-neutral-500/50 dark:text-neutral-500/50">{lyricLines.length} lines</span>
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
                              className={`transition-all leading-relaxed px-2 ${
                                i === currentLyricIndex ? 'text-neutral-900 dark:text-neutral-100 font-medium' : 'text-neutral-500/50 dark:text-neutral-500/50'
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
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div
                    data-progress-bar
                    className="relative h-1.5 rounded-full cursor-pointer group bg-neutral-200/40 dark:bg-white/12"
                    onClick={handleProgressChange}
                    onMouseDown={() => setIsDraggingProgress(true)}
                  >
                    <div
                      className="absolute left-0 top-0 h-full rounded-full transition-all bg-gradient-to-r from-neutral-900/60 to-neutral-900/80 dark:from-white/70 dark:to-white/90"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_rgba(0,0,0,0.15)] bg-neutral-900 dark:bg-white" />
                    </div>
                  </div>
                  <div className="flex justify-between text-[9px] mt-1.5 font-mono text-neutral-500/60 dark:text-neutral-400/50">
                    <span>{audio ? formatDurationDisplay(audio.currentTime) : '0:00'}</span>
                    <span>{displaySong.duration ? formatDuration(displaySong.duration) : '0:00'}</span>
                  </div>
                </div>

                {/* Controls Row */}
                <div className="flex items-center gap-4 mb-4">
                  <button className="transition-colors text-neutral-500/40 dark:text-neutral-400/40 hover:text-neutral-800 dark:hover:text-neutral-200">
                    <SkipBack className="w-4 h-4" onClick={prev} />
                  </button>
                  <button
                    onClick={handlePlayPause}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-105 transition-transform dark:bg-neutral-100 bg-neutral-900 shadow-[0_2px_10px_rgba(0,0,0,0.2)] dark:shadow-[0_2px_10px_rgba(255,255,255,0.2)]"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 text-white dark:text-neutral-900" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5 text-white dark:text-neutral-900" fill="currentColor" />
                    )}
                  </button>
                  <button className="transition-colors text-neutral-500/40 dark:text-neutral-400/40 hover:text-neutral-800 dark:hover:text-neutral-200">
                    <SkipForward className="w-4 h-4" onClick={next} />
                  </button>

                  {/* Volume */}
                  <div className="flex items-center gap-2 flex-1 ml-auto">
                    <Volume2 className="w-3.5 h-3.5 text-neutral-500/40 dark:text-neutral-400/40" />
                    <div
                      data-volume-bar
                      className="flex-1 h-1.5 rounded-full cursor-pointer group bg-neutral-200/40 dark:bg-white/12"
                      onClick={handleVolumeChange}
                      onMouseDown={() => setIsDraggingVolume(true)}
                    >
                      <div
                        className="h-full rounded-full relative transition-all bg-neutral-900/50 dark:bg-white/50"
                        style={{ width: `${volume}%` }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900/70 dark:bg-white/70" />
                      </div>
                    </div>
                    <span className="text-[9px] font-mono w-6 text-right text-neutral-500/50 dark:text-neutral-400/50">{Math.round(volume)}%</span>
                  </div>
                </div>

                {/* Playlist */}
                <div className="border-t pt-4 border-neutral-200/70 dark:border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-medium tracking-wider uppercase text-neutral-500/60 dark:text-neutral-500/60">
                      Playlist
                    </span>
                    <span className="text-[9px] text-neutral-500/50 dark:text-neutral-500/50">{playlist.length} songs</span>
                  </div>
                  <div className="h-[90px] overflow-y-auto scrollbar-hide">
                    {playlist.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-center text-[11px] text-neutral-500/30 dark:text-neutral-500/30">
                          暂无歌曲
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        {playlist.map((song, i) => (
                        <button
                          key={song.id}
                          onClick={() => playSongAtIndex(i)}
                          className={`w-full flex items-center gap-3 py-2 px-2 rounded-xl transition-all ${
                            currentSong?.id === song.id ? 'bg-neutral-200/60 dark:bg-neutral-700/50' : 'hover:bg-neutral-200/40 dark:bg-neutral-700/50 hover:dark:bg-neutral-700/50'
                          }`}
                        >
                          <span className="text-[10px] font-mono w-4 text-neutral-500/60 dark:text-neutral-500/60">
                            {(i + 1).toString().padStart(2, '0')}
                          </span>
                          <div className="flex-1 text-left min-w-0">
                            <p className={`text-[11px] truncate leading-tight transition-colors ${
                              currentSong?.id === song.id ? 'text-neutral-900 dark:text-neutral-100 font-medium' : 'text-neutral-600/80 dark:text-neutral-400/70'
                            }`}>
                              {song.title}
                            </p>
                            <p className={`text-[10px] truncate ${
                              currentSong?.id === song.id ? 'text-neutral-700/80 dark:text-neutral-300' : 'text-neutral-500/60 dark:text-neutral-500/60'
                            }`}>{song.artist}</p>
                          </div>
                          {currentSong?.id === song.id && isPlaying && (
                            <div className="flex items-end gap-0.5 h-3">
                              {[0, 1, 2].map((j) => (
                                <div
                                  key={j}
                                  className="w-0.5 rounded-full bg-neutral-600/70 dark:bg-white/70"
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
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes sound {
          0%, 100% { height: 30%; }
          50% { height: 100%; }
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
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: ${position === 'left'
              ? 'translateX(-100px) scale(0.95)'
              : 'translateX(100px) scale(0.95)'};
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: ${position === 'left'
              ? 'translateX(-100px) scale(0.95)'
              : 'translateX(100px) scale(0.95)'};
          }
        }

        /* Scrollbar hide */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Theme Panel Dark Mode */
        :global(.dark) [data-theme-panel="true"] {
          background: rgba(24, 24, 27, 0.95) !important;
          border-color: rgba(255, 255, 255, 0.12) !important;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
        }

        /* Float button icon in dark mode */
        :global(.dark) button > .lucide-music {
          color: #ffffff !important;
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

        /* Main Panel */
        .music-player-panel {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15),
                      inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }
        :global(.dark) .music-player-panel {
          background: rgba(24, 24, 27, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        /* Header */
        .music-player-header-label {
          color: rgba(0, 0, 0, 0.7);
        }
        :global(.dark) .music-player-header-label {
          color: rgba(255, 255, 255, 0.6);
        }
        .music-player-close-btn {
          color: rgba(0, 0, 0, 0.5);
        }
        :global(.dark) .music-player-close-btn {
          color: rgba(255, 255, 255, 0.5);
        }
        .music-player-close-btn:hover {
          color: rgba(0, 0, 0, 0.8);
        }
        :global(.dark) .music-player-close-btn:hover {
          color: rgba(255, 255, 255, 0.8);
        }

        /* Song Info */
        .music-player-song-title {
          color: var(--text-canvas);
        }
        .music-player-song-artist {
          color: var(--text-secondary);
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
      `}</style>
    </React.Fragment>
  )
}
