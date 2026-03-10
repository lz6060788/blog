'use client'

import { Toaster } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        className: '',
        duration: 3000,
        style: {
          background: 'hsl(var(--theme-surface))',
          color: 'hsl(var(--theme-foreground))',
          border: '1px solid hsl(var(--theme-border))',
          borderRadius: '0.75rem',
          padding: '0.75rem 1rem',
        },
        success: {
          iconTheme: {
            primary: 'hsl(var(--theme-primary))',
            secondary: 'hsl(var(--theme-surface))',
          },
        },
        error: {
          iconTheme: {
            primary: 'hsl(var(--theme-error))',
            secondary: 'hsl(var(--theme-surface))',
          },
        },
      }}
    />
  )
}
