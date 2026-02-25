/**
 * 主题配置
 *
 * 定义浅色和深色模式的颜色
 * 浅色主题完全保留当前项目的 zinc 色系
 * 深色主题经过精心设计以保持视觉一致性
 */

export interface ThemeColors {
  // 背景色
  bgPrimary: string
  bgSecondary: string
  bgTertiary: string

  // 文本色
  textPrimary: string
  textSecondary: string
  textTertiary: string

  // 边框色
  borderDefault: string

  // 强调色
  accentPrimary: string
  accentSecondary: string
  accentBg: string
}

export const lightTheme: ThemeColors = {
  // 保留当前项目的 zinc 色系
  bgPrimary: '#fafafa',      // zinc-50
  bgSecondary: '#ffffff',    // white
  bgTertiary: '#f4f4f5',     // zinc-100

  textPrimary: '#18181b',    // zinc-900
  textSecondary: '#71717a',  // zinc-500
  textTertiary: '#a1a1aa',   // zinc-400

  borderDefault: '#e4e4e7',  // zinc-200

  accentPrimary: '#059669',  // emerald-600
  accentSecondary: '#34d399', // emerald-400
  accentBg: '#ecfdf5',       // emerald-50
}

export const darkTheme: ThemeColors = {
  // 精心设计的深色主题
  bgPrimary: '#09090b',      // zinc-950 - 深邃的黑
  bgSecondary: '#18181b',    // zinc-900 - 稍浅的层次
  bgTertiary: '#27272a',     // zinc-800

  textPrimary: '#fafafa',    // zinc-50 - 柔和的白
  textSecondary: '#a1a1aa',  // zinc-400 - 中等灰度
  textTertiary: '#71717a',   // zinc-500

  borderDefault: '#27272a',  // zinc-800 - 微妙的分割

  accentPrimary: '#34d399',  // emerald-400 - 更亮以在深色背景上可见
  accentSecondary: '#10b981', // emerald-500
  accentBg: '#022c22',       // emerald-950 - 深色背景
}

/**
 * 获取当前主题的颜色
 */
export function getThemeColors(theme: 'light' | 'dark'): ThemeColors {
  return theme === 'light' ? lightTheme : darkTheme
}
