'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User, Menu } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

interface TopBarProps {
  onMobileMenuOpen?: () => void
}

export function TopBar({ onMobileMenuOpen }: TopBarProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut({ redirect: false })
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Get user from session (would need to be passed from parent or use useSession)
  const user = {
    name: 'Admin',
    email: 'admin@blog.com',
    image: null,
  }

  const userInitials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AD'

  return (
    <header className="h-[60px] bg-theme-bg-surface border-b border-theme-border flex items-center justify-between px-4 lg:px-6">
      {/* Left: Mobile Menu Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuOpen}
          className="lg:hidden p-2 rounded-lg hover:bg-theme-bg-muted transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-theme-text-secondary" strokeWidth={2} />
        </button>

        {/* Breadcrumb placeholder */}
        <nav className="hidden sm:flex items-center text-sm text-theme-text-tertiary">
          <span className="font-medium text-theme-text-canvas">Admin</span>
        </nav>
      </div>

      {/* Right: Theme Toggle & User Menu */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-theme-bg-muted transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-theme-accent-bg text-theme-accent-primary text-xs font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-theme-text-canvas leading-tight">
                  {user.name}
                </div>
                <div className="text-xs text-theme-text-tertiary leading-tight truncate max-w-[120px]">
                  {user.email}
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-48 bg-theme-bg-surface border-theme-border"
            sideOffset={8}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-theme-text-canvas">{user.name}</p>
                <p className="text-xs text-theme-text-tertiary">{user.email}</p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="bg-theme-border" />

            <DropdownMenuItem
              onClick={() => router.push('/admin/profile')}
              className="text-theme-text-secondary hover:text-theme-text-cursor hover:bg-theme-bg-muted cursor-pointer"
            >
              <User className="w-4 h-4 mr-2" strokeWidth={2} />
              <span>个人资料</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-theme-border" />

            {!isLoggingOut ? (
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-theme-error-primary hover:bg-theme-error-bg hover:text-theme-error-text cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" strokeWidth={2} />
                <span>退出登录</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                disabled
                className="text-theme-text-tertiary cursor-not-allowed"
              >
                <span>退出中...</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
