'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Sheet, SheetContent, SheetOverlay } from '@/components/ui/sheet'
import { AdminSidebar as Sidebar } from '@/components/admin/shared'
import { AdminTopBar as TopBar } from '@/components/admin/shared'
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
      <div className="min-h-screen bg-theme-canvas flex items-center justify-center">
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
      <div className="min-h-screen bg-theme-canvas flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-theme-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-dvh overflow-hidden bg-theme-canvas">
      <div className="flex h-full min-h-0">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-[250px] lg:flex-shrink-0">
          <Sidebar />
        </aside>

        {/* Main Content Area */}
        <div className="flex min-w-0 min-h-0 flex-1 flex-col">
          <TopBar onMobileMenuOpen={() => setMobileMenuOpen(true)} />
          <main className="min-h-0 flex-1 overflow-auto">
            <div className="min-h-full p-4 lg:p-8">
              {children}
            </div>
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
              className="w-[280px] p-0 bg-theme-surface border-r border-theme-border"
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
      themes={["light", "dark"]}
      value={{ light: "theme-light", dark: "theme-dark" }}
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
