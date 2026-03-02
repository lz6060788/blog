'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  FileText,
  FileX,
  Settings,
  FolderOpen,
  Tag,
  Brain,
} from 'lucide-react'
import { useSession } from 'next-auth/react'

interface SidebarProps {
  onClose?: () => void
}

const navItems = [
  { href: '/admin', label: '首页', icon: LayoutDashboard },
  { href: '/admin/posts', label: '文章管理', icon: FileText },
  { href: '/admin/drafts', label: '草稿箱', icon: FileX },
  { href: '/admin/categories', label: '分类管理', icon: FolderOpen },
  { href: '/admin/tags', label: '标签管理', icon: Tag },
  { href: '/admin/ai/logs', label: 'AI 日志', icon: Brain, adminOnly: true },
  { href: '/admin/settings', label: '设置', icon: Settings },
]

/**
 * 检查用户是否是管理员
 * 注意：这是客户端的简化检查，实际权限验证在后端
 */
function isUserAdmin(email: string): boolean {
  // 从环境变量读取管理员邮箱
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'admin@example.com'
  return adminEmails.split(',').map(e => e.trim().toLowerCase()).includes(email.toLowerCase())
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  // 检查是否是管理员
  const isAdminUser = session?.user?.email && isUserAdmin(session.user.email)

  // 过滤导航项（AI 日志仅对管理员可见）
  const visibleNavItems = navItems.filter(
    item => !item.adminOnly || isAdminUser
  )

  // Get path without locale for active state checking
  const getPathWithoutLocale = (path: string) => {
    const segments = path.split('/')
    if (segments.length > 1 && (segments[1] === 'en' || segments[1] === 'zh')) {
      return '/' + segments.slice(2).join('/')
    }
    return path
  }

  const currentPath = getPathWithoutLocale(pathname)

  return (
    <aside className="w-full h-full flex flex-col bg-theme-bg-surface border-r border-theme-border">
      {/* Logo Section */}
      <div className="h-[60px] flex items-center px-6 border-b border-theme-border">
        <Link href="/admin" onClick={onClose} className="flex items-center gap-2 group">
          <div className="w-8 h-8 flex items-center justify-center bg-theme-accent-bg rounded-lg">
            <LayoutDashboard className="w-4 h-4 text-theme-accent-primary" strokeWidth={2} />
          </div>
          <span className="font-mono text-sm font-medium text-theme-text-canvas">
            admin.blog
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const isActive = currentPath === item.href ||
            (item.href !== '/admin' && currentPath.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-200 relative
                ${isActive
                  ? 'bg-theme-accent-bg text-theme-accent-primary'
                  : 'text-theme-text-secondary hover:bg-theme-bg-muted hover:text-theme-text-canvas'
                }
              `}
            >
              <Icon className="w-5 h-5" strokeWidth={2} />
              <span className="text-sm font-medium">{item.label}</span>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-theme-accent-primary rounded-r-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-theme-border">
        <div className="text-xs text-theme-text-tertiary font-mono">
          v1.0.0
        </div>
      </div>
    </aside>
  )
}
