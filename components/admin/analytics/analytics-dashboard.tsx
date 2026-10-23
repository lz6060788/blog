'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, BarChart3, Eye, MousePointer2, Timer, Users } from 'lucide-react'
import type { AnalyticsReport } from '@/lib/analytics'

const number = (value: number) => value.toLocaleString('zh-CN')
const duration = (ms: number) => ms ? `${Math.round(ms / 1000)} 秒` : '—'
const labels: Record<string, string> = { direct: '直接访问', internal: '站内跳转', mobile: '手机', tablet: '平板', desktop: '桌面', article: '打开文章', navigation: '站内导航', external: '外部链接' }
const panel = 'rounded-2xl border border-theme-border bg-theme-surface p-5 sm:p-6'

function Distribution({ title, data, empty, denominator }: { title: string; data: { name: string; value: number }[]; empty: string; denominator?: number }) {
  const total = denominator ?? data.reduce((sum, item) => sum + item.value, 0)
  return <section className={panel}>
    <h2 className="font-medium text-theme-text-canvas">{title}</h2>
    {!total ? <p className="py-10 text-sm text-theme-text-tertiary">{empty}</p> : <ul className="mt-6 space-y-5">
      {data.map((item) => <li key={item.name}>
        <div className="mb-2 flex justify-between gap-4 text-sm"><span className="truncate text-theme-text-secondary">{labels[item.name] || item.name}</span><span className="shrink-0 font-mono text-theme-text-canvas">{number(item.value)} <span className="text-xs text-theme-text-tertiary">/ {Math.round(item.value / total * 100)}%</span></span></div>
        <div className="h-1.5 overflow-hidden rounded-full bg-theme-muted"><div className="h-full rounded-full bg-theme-accent-primary" style={{ width: `${item.value / total * 100}%` }} /></div>
      </li>)}
    </ul>}
  </section>
}

export function AnalyticsDashboard({ report }: { report: AnalyticsReport }) {
  const [selected, setSelected] = useState(report.daily.length - 1)
  const active = report.daily[selected]
  const max = Math.max(1, ...report.daily.map((day) => day.pageviews))
  const width = 900, height = 210, padding = 20
  const x = (index: number) => padding + index / Math.max(1, report.daily.length - 1) * (width - padding * 2)
  const y = (value: number) => height - padding - value / max * (height - padding * 2)
  const points = report.daily.map((day, index) => `${x(index)},${y(day.pageviews)}`).join(' ')
  const visitorPoints = report.daily.map((day, index) => `${x(index)},${y(day.visitors)}`).join(' ')
  const cards = [
    { label: '页面浏览', value: number(report.total.pageviews), unit: 'PV', icon: Eye, note: '每次进入公开页面' },
    { label: '匿名访客', value: number(report.total.visitors), unit: '会话', icon: Users, note: '同一标签页 30 分钟内去重' },
    { label: '文章浏览', value: number(report.total.articleViews), unit: '次', icon: BarChart3, note: '文章详情页面访问' },
    { label: '平均阅读', value: duration(report.total.averageReadMs), unit: '', icon: Timer, note: `有停留样本 · 平均进度 ${report.total.averageDepth}%` },
  ]

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div><p className="mb-2 font-mono text-xs tracking-[.2em] text-theme-accent-primary">AUDIENCE / INSIGHTS</p><h1 className="text-3xl font-semibold tracking-tight text-theme-text-canvas">访问统计</h1><p className="mt-2 text-sm text-theme-text-secondary">看看文字如何被遇见。所有时间以北京时间统计。</p></div>
      <nav aria-label="统计日期范围" className="flex rounded-xl border border-theme-border bg-theme-surface p-1">{[7, 30, 90].map((days) => <Link key={days} href={`/admin/analytics?days=${days}`} aria-current={days === report.days ? 'page' : undefined} className={`rounded-lg px-4 py-2 text-sm transition-colors ${days === report.days ? 'bg-theme-accent-bg text-theme-accent-primary' : 'text-theme-text-secondary hover:bg-theme-muted'}`}>近 {days} 天</Link>)}</nav>
    </div>

    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{cards.map(({ label, value, unit, icon: Icon, note }) => <section key={label} className={panel}>
      <div className="flex items-center justify-between text-theme-text-secondary"><h2 className="text-sm">{label}</h2><Icon className="h-4 w-4 text-theme-accent-primary" aria-hidden="true" /></div>
      <p className="mt-5 flex flex-wrap items-baseline gap-2"><strong className="text-3xl font-semibold tracking-tight text-theme-text-canvas">{value}</strong><span className="font-mono text-xs text-theme-text-tertiary">{unit}</span></p><p className="mt-3 text-xs leading-relaxed text-theme-text-tertiary">{note}</p>
    </section>)}</div>

    <section className={panel}>
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-medium text-theme-text-canvas">访问趋势</h2><p className="mt-1 text-xs text-theme-text-tertiary">{report.daily[0].date} — {report.daily[report.daily.length - 1].date}</p></div><div className="flex gap-4 text-xs text-theme-text-secondary"><span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-violet-500" />浏览</span><span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-teal-500" />访客</span></div></div>
      {!report.total.pageviews ? <div className="flex min-h-[250px] flex-col items-center justify-center text-center"><BarChart3 className="mb-4 h-8 w-8 text-theme-text-tertiary" /><h3 className="text-sm text-theme-text-canvas">还没有访问记录</h3><p className="mt-2 max-w-md text-xs leading-relaxed text-theme-text-tertiary">公开页面收到匿名访问后，图表会从第一条真实记录开始。作者登录、后台页面和启用隐私偏好的访问不会计入。</p></div> : <>
        <p className="mt-6 font-mono text-xs text-theme-text-secondary" aria-live="polite">{active.date} <span className="ml-4 text-theme-text-canvas">{active.pageviews} 浏览 · {active.visitors} 访客</span></p>
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="每日浏览与匿名访客趋势；左右方向键查看日期" tabIndex={0} className="mt-4 w-full rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-accent-primary"
          onMouseMove={(event) => { const bounds = event.currentTarget.getBoundingClientRect(); setSelected(Math.max(0, Math.min(report.daily.length - 1, Math.round(((event.clientX - bounds.left) / bounds.width * width - padding) / (width - padding * 2) * (report.daily.length - 1))))) }}
          onKeyDown={(event) => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); setSelected((index) => Math.max(0, Math.min(report.daily.length - 1, index + (event.key === 'ArrowLeft' ? -1 : 1)))) } }}>
          <title>{`近 ${report.days} 天：${report.total.pageviews} 次浏览，${report.total.visitors} 个匿名会话`}</title>
          {[0, .5, 1].map((fraction) => <line key={fraction} x1={padding} x2={width - padding} y1={y(max * fraction)} y2={y(max * fraction)} stroke="currentColor" className="text-theme-border" strokeDasharray="3 6" />)}
          <polygon points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`} fill="#8b5cf6" opacity=".06" />
          <polyline points={points} fill="none" stroke="#8b5cf6" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          <polyline points={visitorPoints} fill="none" stroke="#14b8a6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <line x1={x(selected)} x2={x(selected)} y1={padding} y2={height - padding} stroke="currentColor" className="text-theme-text-tertiary" strokeDasharray="3 4" />
          <circle cx={x(selected)} cy={y(active.pageviews)} r="4" fill="#8b5cf6" /><circle cx={x(selected)} cy={y(active.visitors)} r="4" fill="#14b8a6" />
        </svg><div className="flex justify-between font-mono text-[10px] text-theme-text-tertiary"><span>{report.daily[0].date.slice(5)}</span><span>单日最高 {max} 次</span><span>{report.daily[report.daily.length - 1].date.slice(5)}</span></div>
        <details className="mt-5 text-xs text-theme-text-secondary"><summary className="cursor-pointer">查看每日数据</summary><div className="mt-3 max-h-48 overflow-auto"><table className="w-full text-left"><thead><tr><th className="py-2">日期</th><th>浏览</th><th>访客</th></tr></thead><tbody>{report.daily.map((day) => <tr key={day.date} className="border-t border-theme-border"><td className="py-2">{day.date}</td><td>{day.pageviews}</td><td>{day.visitors}</td></tr>)}</tbody></table></div></details>
      </>}
    </section>

    <div className="grid gap-4 lg:grid-cols-3"><Distribution title="访问来源 · 前 8" denominator={report.total.pageviews} data={report.referrers.map((item) => ({ name: item.name, value: item.views }))} empty="收到访问后显示来源域名。" /><Distribution title="设备分布" data={report.devices.map((item) => ({ name: item.name, value: item.views }))} empty="收到访问后显示设备分组。" /><Distribution title={`互动点击 · ${number(report.total.clicks)}`} data={report.clicks.map((item) => ({ name: item.name, value: item.count }))} empty="等待首次文章、导航或外链点击。" /></div>

    <section className={`${panel} overflow-hidden`}><div className="flex items-center gap-2"><MousePointer2 className="h-4 w-4 text-theme-accent-primary" /><h2 className="font-medium text-theme-text-canvas">最常被遇见的页面</h2></div>
      {!report.pages.length ? <p className="py-10 text-sm text-theme-text-tertiary">有真实访问后，这里显示浏览最多的 10 个页面。</p> : <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[580px] text-left text-sm"><thead className="border-b border-theme-border text-xs text-theme-text-tertiary"><tr><th className="pb-3 font-normal">页面</th><th className="pb-3 font-normal">浏览</th><th className="pb-3 font-normal">访客</th><th className="pb-3 font-normal">阅读停留</th><th className="pb-3 font-normal">阅读进度</th></tr></thead><tbody>{report.pages.map((page) => <tr key={page.path} className="border-b border-theme-border last:border-0"><td className="max-w-[330px] py-4 pr-6"><Link href={page.path} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-theme-text-canvas"><span className="truncate">{page.title || page.path}</span><ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-theme-text-tertiary group-hover:text-theme-accent-primary" /></Link>{page.title && <p className="mt-1 truncate font-mono text-[10px] text-theme-text-tertiary">{page.path}</p>}</td><td className="font-mono">{number(page.views)}</td><td className="font-mono">{number(page.visitors)}</td><td className="text-theme-text-secondary">{duration(page.averageReadMs)}</td><td className="text-theme-text-secondary">{page.path.startsWith('/post/') ? `${page.averageDepth}%` : '—'}</td></tr>)}</tbody></table></div>}
      <p className="mt-5 text-xs leading-relaxed text-theme-text-tertiary">访客以匿名会话估算，跨标签页与跨设备不合并。阅读停留仅计算页面可见时间；停留与进度取已收到阅读样本的均值。来源与设备按页面浏览计数，点击仅记录行为分类。</p>
    </section>
  </div>
}
