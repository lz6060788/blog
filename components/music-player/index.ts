// Main component
export { MusicPlayer } from './MusicPlayer'

// Sub-components (exported for testing purposes)
export { CollapsedWidget } from './CollapsedWidget'
export { ExpandedPlayer } from './ExpandedPlayer'
export { VinylRecord } from './VinylRecord'
export { LyricsPanel } from './LyricsPanel'
export { ProgressBar } from './ProgressBar'
export { PlaybackControls } from './PlaybackControls'
export { PlaylistPanel } from './PlaylistPanel'

// Custom hooks
export { useLyricsSync, useProgressBar, useVolumeControl, useMobileDetection } from './hooks'

// Types
export type {
  MusicPlayerProps,
  CollapsedWidgetProps,
  VinylRecordProps,
  LyricsPanelProps,
  ProgressBarProps,
  PlaybackControlsProps,
  PlaylistPanelProps,
  ExpandedPlayerProps,
  LyricLine,
} from './types'

// Constants
export * from './constants'
