'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Sheet, SheetContent, SheetOverlay } from '@/components/ui/sheet'
import { Sidebar } from '@/components/admin/sidebar'
import { TopBar } from '@/components/admin/top-bar'
import { useSession } from 'next-auth/react'
import { SessionProvider } from '@/components/auth/SessionProvider'
import { ThemeProvider } from '@/components/ThemeProvider'

// 内部组件：使用 useSession hook
function AdminLayoutContent({
  children,
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  children: React.ReactNode
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}) {
  const { status } = useSession()

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-theme-bg-canvas flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-theme-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Redirect to login if not authenticated (client-side defense)
  if (status === 'unauthenticated') {
    if (typeof window !== 'undefined') {
      const locale = document.documentElement.lang || 'zh'
      const currentPath = window.location.pathname
      window.location.href = `/${locale}/login?callbackUrl=${encodeURIComponent(currentPath)}`
    }
    return (
      <div className="min-h-screen bg-theme-bg-canvas flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-theme-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-theme-bg-canvas">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-[250px] lg:flex-shrink-0">
          <Sidebar />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onMobileMenuOpen={() => setMobileMenuOpen(true)} />
          <main className="flex-1 p-4 lg:p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Sidebar (Sheet) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetOverlay
              asChild
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
            </SheetOverlay>
            <SheetContent
              side="left"
              className="w-[280px] p-0 bg-theme-bg-surface border-r border-theme-border"
            >
              <Sidebar onClose={() => setMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        )}
      </AnimatePresence>
    </div>
  )
}

// 外部组件：提供 SessionProvider 和 ThemeProvider
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange={false}
    >
      <SessionProvider>
        <AdminLayoutContent
          children={children}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      </SessionProvider>
    </ThemeProvider>
  )
}
