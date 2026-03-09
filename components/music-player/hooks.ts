import { useEffect, useState, useRef, RefObject } from 'react'
import { LyricLine } from './types'

// 歌词同步 Hook
export function useLyricsSync(
  lyricLines: LyricLine[],
  audio: HTMLAudioElement | null
) {
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0)
  const lyricsContainerRef = useRef<HTMLDivElement>(null)
  const lyricItemsRef = useRef<Map<number, HTMLParagraphElement>>(new Map())

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
  }, [audio?.currentTime, lyricLines, currentLyricIndex])

  return {
    currentLyricIndex,
    lyricsContainerRef,
    lyricItemsRef,
  }
}

// 进度条拖拽和点击 Hook
export function useProgressBar(onProgressChange: (progress: number) => void) {
  const [isDragging, setIsDragging] = useState(false)

  const handleProgressChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newProgress = (clickX / rect.width) * 100
    onProgressChange(newProgress)
  }

  const handleProgressDrag = (clientX: number) => {
    const progressBars = document.querySelectorAll('[data-progress-bar]')
    progressBars.forEach((bar) => {
      const rect = bar.getBoundingClientRect()
      if (clientX >= rect.left && clientX <= rect.right) {
        const clickX = clientX - rect.left
        const newProgress = (clickX / rect.width) * 100
        onProgressChange(newProgress)
      }
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleProgressDrag(e.clientX)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  return {
    isDragging,
    handleProgressChange,
    startDrag: () => setIsDragging(true),
  }
}

// 音量控制 Hook
export function useVolumeControl(onVolumeChange: (volume: number) => void) {
  const [isDragging, setIsDragging] = useState(false)

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newVolume = Math.max(0, Math.min(100, (clickX / rect.width) * 100))
    onVolumeChange(newVolume)
  }

  const handleVolumeDrag = (clientX: number) => {
    const volumeBars = document.querySelectorAll('[data-volume-bar]')
    volumeBars.forEach((bar) => {
      const rect = bar.getBoundingClientRect()
      if (clientX >= rect.left && clientX <= rect.right) {
        const clickX = clientX - rect.left
        const newVolume = Math.max(0, Math.min(100, (clickX / rect.width) * 100))
        onVolumeChange(newVolume)
      }
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleVolumeDrag(e.clientX)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  return {
    isDragging,
    handleVolumeChange,
    startDrag: () => setIsDragging(true),
  }
}

// 移动端检测 Hook
export function useMobileDetection(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [breakpoint])

  return isMobile
}
