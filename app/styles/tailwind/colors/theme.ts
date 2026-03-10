export const themeColors = {
  canvas: 'hsl(var(--theme-background))',
  surface: 'hsl(var(--theme-surface))',
  'surface-alt': 'hsl(var(--theme-surface-alt))',
  muted: 'hsl(var(--theme-muted))',
  subtle: 'hsl(var(--theme-subtle))',
  overlay: 'hsl(var(--theme-overlay))',
  text: {
    canvas: 'hsl(var(--theme-foreground))',
    primary: 'hsl(var(--theme-text-primary))',
    secondary: 'hsl(var(--theme-text-secondary))',
    tertiary: 'hsl(var(--theme-text-tertiary))',
    reversed: 'hsl(var(--theme-background))',
  },
  border: {
    DEFAULT: 'hsl(var(--theme-border))',
    muted: 'hsl(var(--theme-border-muted))',
    subtle: 'hsl(var(--theme-border-subtle))',
    strong: 'hsl(var(--theme-border-strong))',
  },
  accent: {
    primary: 'hsl(var(--theme-primary))',
    secondary: 'hsl(var(--theme-primary) / 0.85)',
    tertiary: 'hsl(var(--theme-primary) / 0.7)',
    bg: 'hsl(var(--theme-success-bg))',
    'bg-subtle': 'hsl(var(--theme-surface-alt))',
    fg: 'hsl(var(--theme-primary-foreground))',
  },
  success: {
    primary: 'hsl(var(--theme-success))',
    bg: 'hsl(var(--theme-success-bg))',
    text: 'hsl(var(--theme-success-text))',
  },
  warning: {
    primary: 'hsl(var(--theme-warning))',
    bg: 'hsl(var(--theme-warning-bg))',
    text: 'hsl(var(--theme-warning-text))',
  },
  error: {
    primary: 'hsl(var(--theme-error))',
    bg: 'hsl(var(--theme-error-bg))',
    text: 'hsl(var(--theme-error-text))',
  },
  info: {
    primary: 'hsl(var(--theme-info))',
    bg: 'hsl(var(--theme-info-bg))',
    text: 'hsl(var(--theme-info-text))',
  },
  card: {
    bg: 'hsl(var(--color-card-bg))',
    DEFAULT: 'hsl(var(--color-card-border))',
  },
  nav: 'hsl(var(--theme-surface) / 0.9)',
} as const
