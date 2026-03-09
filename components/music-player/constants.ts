// 尺寸配置
export const SIZES = {
  COLLAPSED_DESKTOP: 64, // w-16 h-16
  COLLAPSED_MOBILE: 56, // w-[56px] h-[56px]
  EXPANDED_WIDTH_DESKTOP: 480,
  EXPANDED_WIDTH_MOBILE: 380, // max-w-[380px]
  VINYL_RECORD: 100, // w-[100px] h-[100px]
  LYRICS_PANEL_HEIGHT: 140, // h-[140px]
  PLAYLIST_HEIGHT: 90, // h-[90px]
} as const

// 断点
export const BREAKPOINTS = {
  MOBILE: 768,
} as const

// 动画配置
export const ANIMATIONS = {
  VINYL_SPIN_DURATION: 12, // seconds
  SOUND_WAVE_DURATION: 0.8, // seconds
  SOUND_WAVE_DELAY: 0.15, // seconds
  GLOW_PULSE_DURATION: 4, // seconds
  SLIDE_IN_DURATION: 0.4, // seconds
  SLIDE_OUT_DURATION: 0.3, // seconds
  TONEARM_TRANSITION_DURATION: 0.6, // seconds
} as const

// 颜色配置
export const COLORS = {
  GLOW_COLOR: 'rgba(16, 185, 129, %s)', // emerald-500
  PROGRESS_FILL_START: 'rgba(0, 0, 0, 0.6)',
  PROGRESS_FILL_END: 'rgba(0, 0, 0, 0.8)',
  PROGRESS_FILL_DARK_START: 'rgba(255, 255, 255, 0.7)',
  PROGRESS_FILL_DARK_END: 'rgba(255, 255, 255, 0.9)',
} as const

// 默认值
export const DEFAULTS = {
  GLOW_COLOR: '#ffffff',
  GLOW_INTENSITY: 0.6,
  POSITION: 'right' as const,
  PROGRESS_THUMB_SIZE: 10, // w-2.5 h-2.5
  VOLUME_THUMB_SIZE: 8, // w-2 h-2
} as const
