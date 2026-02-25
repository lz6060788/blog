import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 保留现有 zinc 颜色以确保兼容性
        zinc: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        // 主题颜色变量 - 完整的色板系统
        theme: {
          // 基础色板
          bg: {
            canvas: 'var(--bg-canvas)',
            surface: 'var(--bg-surface)',
            surfaceAlt: 'var(--bg-surface-alt)',
            muted: 'var(--bg-muted)',
            subtle: 'var(--bg-subtle)',
            overlay: 'var(--bg-overlay)',
          },
          text: {
            canvas: 'var(--text-canvas)',
            surface: 'var(--text-surface)',
            primary: 'var(--text-primary)',
            secondary: 'var(--text-secondary)',
            tertiary: 'var(--text-tertiary)',
            muted: 'var(--text-muted)',
            disabled: 'var(--text-disabled)',
            reversed: 'var(--text-reversed)',
          },
          border: {
            DEFAULT: 'var(--border-default)',
            muted: 'var(--border-muted)',
            subtle: 'var(--border-subtle)',
            strong: 'var(--border-strong)',
          },
          // 强调色
          accent: {
            primary: 'var(--accent-primary)',
            secondary: 'var(--accent-secondary)',
            tertiary: 'var(--accent-tertiary)',
            bg: 'var(--accent-bg)',
            bgSubtle: 'var(--accent-bg-subtle)',
            fg: 'var(--accent-fg)',
          },
          // 语义色
          success: {
            primary: 'var(--success-primary)',
            bg: 'var(--success-bg)',
            text: 'var(--success-text)',
          },
          warning: {
            primary: 'var(--warning-primary)',
            bg: 'var(--warning-bg)',
            text: 'var(--warning-text)',
          },
          error: {
            primary: 'var(--error-primary)',
            bg: 'var(--error-bg)',
            text: 'var(--error-text)',
          },
          info: {
            primary: 'var(--info-primary)',
            bg: 'var(--info-bg)',
            text: 'var(--info-text)',
          },
          // 控件色
          btn: {
            bgPrimary: 'var(--btn-bg-primary)',
            bgPrimaryHover: 'var(--btn-bg-primary-hover)',
            textPrimary: 'var(--btn-text-primary)',
            bgGhost: 'var(--btn-bg-ghost)',
            bgGhostHover: 'var(--btn-bg-ghost-hover)',
            textGhost: 'var(--btn-text-ghost)',
            textGhostHover: 'var(--btn-text-ghost-hover)',
          },
          input: {
            bg: 'var(--input-bg)',
            border: 'var(--input-border)',
            borderFocus: 'var(--input-border-focus)',
            text: 'var(--input-text)',
            placeholder: 'var(--input-placeholder)',
          },
          card: {
            bg: 'var(--card-bg)',
            border: 'var(--card-border)',
            shadow: 'var(--card-shadow)',
          },
          nav: {
            bg: 'var(--nav-bg)',
            border: 'var(--nav-border)',
          },
        },
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      letterSpacing: {
        tighter: '-0.04em',
      },
      boxShadow: {
        card: 'var(--card-shadow)',
      },
    },
  },
  plugins: [],
}

export default config
