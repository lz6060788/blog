import { redirect } from 'next/navigation'
import { auth } from '@/server/auth'
import { analyticsRepository } from '@/server/analytics/repository'
import { AnalyticsDashboard } from '@/components/admin/analytics/analytics-dashboard'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/admin/analytics')
  // Auth's signIn callback already enforces this allowlist; recheck at the data boundary.
  if (session.user.email?.trim().toLowerCase() !== process.env.ADMIN_EMAIL?.trim().toLowerCase()) {
    return <p className="p-8 text-theme-text-secondary">无权查看访问统计。</p>
  }
  try {
    const report = await analyticsRepository.report(30)
    return <AnalyticsDashboard key={report.days} report={report} />
  } catch {
    return <div role="alert" className="rounded-2xl border border-theme-border bg-theme-surface p-8"><h1 className="text-xl font-semibold text-theme-text-canvas">访问统计暂时不可用</h1><p className="mt-3 text-sm text-theme-text-secondary">请确认数据库迁移已完成并且数据库连接正常，然后刷新页面。</p></div>
  }
}
