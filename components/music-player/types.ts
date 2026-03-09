import { CSSProperties } from 'react'

// 歌词行类型
export interface LyricLine {
  time: number
  text: string
}

// 主组件 Props
export interface MusicPlayerProps {
  glowColor?: string
  glowIntensity?: number
  position?: 'left' | 'right'
}

// 折叠组件 Props
export interface CollapsedWidgetProps {
  isPlaying: boolean
  isMobile: boolean
  position: 'left' | 'right'
  onClick: () => void
}

// 黑胶唱片组件 Props
export interface VinylRecordProps {
  isPlaying: boolean
  title: string
  artist: string
  glowIntensity: number
}

// 歌词面板 Props
export interface LyricsPanelProps {
  lyricLines: LyricLine[]
  currentLyricIndex: number
}

// 进度条 Props
export interface ProgressBarProps {
  progress: number
  currentTime: number
  duration: number
  onProgressChange: (e: React.MouseEvent<HTMLDivElement>) => void
  onDragStart: () => void
}

// 播放控制组件 Props
export interface PlaybackControlsProps {
  isPlaying: boolean
  volume: number
  onPlayPause: () => void
  onPrev: () => void
  onNext: () => void
  onVolumeChange: (e: React.MouseEvent<HTMLDivElement>) => void
  onVolumeDragStart: () => void
}

// 播放列表组件 Props
export interface PlaylistPanelProps {
  playlist: Array<{
    id: string
    title: string
    artist: string
  }>
  currentSongId?: string
  isPlaying: boolean
  onSongSelect: (index: number) => void
}

// 展开播放器容器 Props
export interface ExpandedPlayerProps {
  isMobile: boolean
  position: 'left' | 'right'
  glowIntensity: number
  isClosing: boolean
  onClose: () => void
}
