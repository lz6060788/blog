import { FileText, FileX, TrendingUp, PlusCircle } from 'lucide-react'
import Link from 'next/link'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

// Placeholder stats - will be replaced with real data from database
const stats = [
  {
    title: '文章总数',
    value: '12',
    change: '+3',
    icon: FileText,
    color: 'text-theme-accent-primary',
    bgColor: 'bg-theme-accent-bg',
  },
  {
    title: '已发布',
    value: '8',
    change: '+2',
    icon: TrendingUp,
    color: 'text-theme-success-primary',
    bgColor: 'bg-theme-success-bg',
  },
  {
    title: '草稿',
    value: '4',
    change: '+1',
    icon: FileX,
    color: 'text-theme-warning-primary',
    bgColor: 'bg-theme-warning-bg',
  },
  {
    title: '最近7天',
    value: '2',
    change: '新增',
    icon: PlusCircle,
    color: 'text-theme-info-primary',
    bgColor: 'bg-theme-info-bg',
  },
]

const quickActions = [
  { href: '/admin/posts/new', label: '新建文章', icon: PlusCircle, description: '创建新文章' },
  { href: '/admin/drafts', label: '查看草稿', icon: FileX, description: '管理未发布内容' },
  { href: '/admin/posts', label: '文章管理', icon: FileText, description: '编辑和发布文章' },
]

export default function AdminPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-theme-text-canvas">
          后台首页
        </h1>
        <p className="text-theme-text-secondary mt-2">
          欢迎回来，这是您的博客管理概览
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.title}
              className="bg-theme-bg-surface border border-theme-border rounded-xl p-6 hover:border-theme-accent-primary transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-theme-text-secondary">{stat.title}</p>
                  <p className="text-2xl font-semibold text-theme-text-canvas mt-2">
                    {stat.value}
                  </p>
                  <p className="text-xs text-theme-text-tertiary mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} strokeWidth={2} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-theme-text-canvas mb-4">快捷操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.href} href={action.href}>
                <div className="bg-theme-bg-surface border border-theme-border rounded-xl p-6 hover:border-theme-accent-primary transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-theme-accent-bg group-hover:bg-theme-accent-primary transition-colors">
                      <Icon className="w-5 h-5 text-theme-accent-primary group-hover:text-theme-accent-fg transition-colors" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-theme-text-canvas group-hover:text-theme-text-canvas transition-colors">{action.label}</h3>
                      <p className="text-sm text-theme-text-tertiary group-hover:text-theme-text-secondary transition-colors">{action.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-theme-bg-surface border border-theme-border rounded-xl p-6">
        <h2 className="text-lg font-medium text-theme-text-canvas mb-4">最近活动</h2>
        <div className="text-sm text-theme-text-tertiary py-8 text-center">
          暂无最近活动
        </div>
      </div>
    </div>
  )
}
