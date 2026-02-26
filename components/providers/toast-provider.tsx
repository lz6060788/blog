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
          background: 'var(--theme-bg-surface)',
          color: 'var(--theme-text-canvas)',
          border: '1px solid var(--theme-border)',
          borderRadius: '0.75rem',
          padding: '0.75rem 1rem',
        },
        success: {
          iconTheme: {
            primary: 'var(--theme-accent-primary)',
            secondary: 'var(--theme-bg-surface)',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--theme-error-primary)',
            secondary: 'var(--theme-bg-surface)',
          },
        },
      }}
    />
  )
}
