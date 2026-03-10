import { themeColors } from './theme'
import { componentColors } from './components'

export const coreColors = {
  border: 'hsl(var(--theme-border))',
  input: 'hsl(var(--color-input-bg))',
  ring: 'hsl(var(--theme-primary) / 0.25)',
  background: 'hsl(var(--theme-background))',
  foreground: 'hsl(var(--theme-foreground))',
  theme: themeColors,
  ...componentColors,
} as const
