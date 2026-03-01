import { FileText, FileX, TrendingUp, PlusCircle, Brain, Zap, AlertCircle, Coins } from 'lucide-react'
import Link from 'next/link'
import { getDashboardStats } from '@/server/db/queries/stats'
import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

const quickActions = [
  { href: '/admin/posts/new', label: '新建文章', icon: PlusCircle, description: '创建新文章' },
  { href: '/admin/drafts', label: '查看草稿', icon: FileX, description: '管理未发布内容' },
  { href: '/admin/posts', label: '文章管理', icon: FileText, description: '编辑和发布文章' },
]

const statConfig = [
  {
    key: 'totalPosts' as const,
    title: '文章总数',
    change: '总计',
    icon: FileText,
    color: 'text-theme-accent-primary',
    bgColor: 'bg-theme-accent-bg',
  },
  {
    key: 'publishedPosts' as const,
    title: '已发布',
    change: '已发布',
    icon: TrendingUp,
    color: 'text-theme-success-primary',
    bgColor: 'bg-theme-success-bg',
  },
  {
    key: 'draftPosts' as const,
    title: '草稿',
    change: '草稿',
    icon: FileX,
    color: 'text-theme-warning-primary',
    bgColor: 'bg-theme-warning-bg',
  },
  {
    key: 'recentPosts' as const,
    title: '最近7天',
    change: '新增',
    icon: PlusCircle,
    color: 'text-theme-info-primary',
    bgColor: 'bg-theme-info-bg',
  },
]

const aiStatConfig = [
  {
    key: 'aiGeneratedPosts' as const,
    title: 'AI 摘要',
    change: '已生成',
    icon: Brain,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
  },
  {
    key: 'aiPendingPosts' as const,
    title: '生成中',
    change: '处理中',
    icon: Zap,
    color: 'text-theme-accent-primary',
    bgColor: 'bg-theme-accent-bg',
  },
  {
    key: 'aiFailedPosts' as const,
    title: '失败',
    change: '需要处理',
    icon: AlertCircle,
    color: 'text-theme-error-primary',
    bgColor: 'bg-theme-error-bg',
  },
  {
    key: 'aiTotalTokens' as const,
    title: '今日 Tokens',
    change: '使用量',
    icon: Coins,
    color: 'text-theme-success-primary',
    bgColor: 'bg-theme-success-bg',
  },
]

export default async function AdminPage() {
  // 验证用户登录状态
  const session = await auth()
  if (!session) {
    redirect('/api/auth/signin')
  }

  // 获取统计数据
  const stats = await getDashboardStats()

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
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-theme-text-canvas mb-4">内容统计</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statConfig.map((stat) => {
              const Icon = stat.icon
              const value = String(stats[stat.key])
              return (
                <div
                  key={stat.key}
                  className="bg-theme-bg-surface border border-theme-border rounded-xl p-6 hover:border-theme-accent-primary transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-theme-text-secondary">{stat.title}</p>
                      <p className="text-2xl font-semibold text-theme-text-canvas mt-2">
                        {value}
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
        </div>

        <div>
          <h2 className="text-lg font-medium text-theme-text-canvas mb-4">AI 统计</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiStatConfig.map((stat) => {
              const Icon = stat.icon
              const value = String(stats[stat.key])
              return (
                <div
                  key={stat.key}
                  className="bg-theme-bg-surface border border-theme-border rounded-xl p-6 hover:border-theme-accent-primary transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-theme-text-secondary">{stat.title}</p>
                      <p className="text-2xl font-semibold text-theme-text-canvas mt-2">
                        {value}
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
        </div>
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
