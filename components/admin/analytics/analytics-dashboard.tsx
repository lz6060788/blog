'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, BookOpen, Users } from 'lucide-react'
import type { AnalyticsReport } from '@/lib/analytics'

const number = (value: number) => value.toLocaleString('zh-CN')
const panel = 'rounded-2xl border border-theme-border bg-theme-surface p-5 sm:p-6'

function DailyTrend({ label, data, unit }: {
  label: string
  data: { date: string; value: number }[]
  unit: string
}) {
  const [selected, setSelected] = useState(data.length - 1)
  const chart = useRef<SVGSVGElement>(null)
  const [width, setWidth] = useState(960)
  useEffect(() => {
    if (!chart.current) return
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(240, Math.round(entry.contentRect.width)))
    })
    observer.observe(chart.current)
    return () => observer.disconnect()
  }, [])
  const active = data[Math.max(0, Math.min(selected, data.length - 1))]
  if (!active) return null
  const height = 240
  const left = 44
  const right = 20
  const top = 20
  const bottom = 26
  const max = Math.ceil(Math.max(2, ...data.map((day) => day.value)) / 2) * 2
  const x = (index: number) => left + index / Math.max(1, data.length - 1) * (width - left - right)
  const y = (value: number) => height - bottom - value / max * (height - top - bottom)
  const points = data.map((day, index) => `${x(index)},${y(day.value)}`).join(' ')
  const hasData = data.some((day) => day.value > 0)

  return <div className="mt-5">
    <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs text-theme-text-secondary" aria-live="polite">
      <time>{active.date}</time>
      <span className="text-theme-text-canvas"><strong className="font-mono text-lg font-medium">{number(active.value)}</strong> {unit}</span>
    </p>
    <svg ref={chart} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" tabIndex={0}
      aria-label={`${label}；左右方向键查看每日数据`}
      className="mt-3 h-52 w-full rounded-lg text-theme-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-theme-accent-primary sm:h-60"
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect()
        const ratio = (event.clientX - bounds.left) / bounds.width
        setSelected(Math.max(0, Math.min(data.length - 1, Math.round((ratio * width - left) / (width - left - right) * (data.length - 1)))))
      }}
      onKeyDown={(event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
        event.preventDefault()
        setSelected((index) => event.key === 'Home' ? 0 : event.key === 'End' ? data.length - 1 : Math.max(0, Math.min(data.length - 1, index + (event.key === 'ArrowLeft' ? -1 : 1))))
      }}>
      <title>{label}</title>
      {[0, 0.5, 1].map((fraction) => <g key={fraction}>
        <line x1={left} x2={width - right} y1={y(max * fraction)} y2={y(max * fraction)} stroke="currentColor" className="text-theme-border" strokeDasharray="3 6" />
        <text x={left - 10} y={y(max * fraction) + 4} textAnchor="end" fontSize="11" fill="currentColor" className="text-theme-text-tertiary">{Number((max * fraction).toFixed(1))}</text>
      </g>)}
      <polygon points={`${left},${height - bottom} ${points} ${width - right},${height - bottom}`} fill="currentColor" opacity=".07" />
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      <line x1={x(selected)} x2={x(selected)} y1={top} y2={height - bottom} stroke="currentColor" opacity=".35" strokeDasharray="3 4" />
      <circle cx={x(selected)} cy={y(active.value)} r="4" fill="currentColor" />
    </svg>
    <div className="flex justify-between font-mono text-[10px] text-theme-text-tertiary">
      <time>{data[0].date.slice(5)}</time><span>北京时间 · 每日{unit === '次阅读' ? '阅读量' : '独立访客'}</span><time>{data[data.length - 1].date.slice(5)}</time>
    </div>
    {!hasData && <p className="mt-4 text-xs text-theme-text-tertiary">这 30 天暂无{label.includes('访问人数') ? '指纹访问' : '阅读'}记录。</p>}
    <details className="mt-5 text-xs text-theme-text-secondary">
      <summary className="cursor-pointer">查看每日数据</summary>
      <div className="mt-3 max-h-52 overflow-auto"><table className="w-full text-left">
        <thead><tr><th scope="col" className="py-2 font-normal">日期</th><th scope="col" className="font-normal">{unit}</th></tr></thead>
        <tbody>{data.map((day) => <tr key={day.date} className="border-t border-theme-border"><td className="py-2">{day.date}</td><td className="font-mono">{number(day.value)}</td></tr>)}</tbody>
      </table></div>
    </details>
  </div>
}

export function AnalyticsDashboard({ report }: { report: AnalyticsReport }) {
  const [articleId, setArticleId] = useState('all')
  const [query, setQuery] = useState('')
  const selectedArticle = report.articles.find((article) => article.id === articleId)
  const articleDays = selectedArticle
    ? selectedArticle.daily.map((day) => ({ date: day.date, value: day.views }))
    : report.daily.map((day) => ({ date: day.date, value: day.articleViews }))
  const filtered = report.articles.filter((article) => article.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
  const firstDate = report.daily[0]?.date
  const lastDate = report.daily[report.daily.length - 1]?.date

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="mb-2 font-mono text-xs tracking-[.2em] text-theme-accent-primary">READERS / ANALYTICS</p><h1 className="text-3xl font-semibold tracking-tight text-theme-text-canvas">阅读与访问</h1><p className="mt-2 text-sm text-theme-text-secondary">各文章阅读量与全站访问人数。</p></div>
      <p className="rounded-full border border-theme-border px-4 py-2 text-xs text-theme-text-secondary">近 30 天 <span className="ml-2 font-mono text-theme-text-tertiary">{firstDate} — {lastDate}</span></p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      <section className={panel}>
        <div className="flex items-center justify-between text-theme-text-secondary"><h2 className="text-sm">全站访问人数</h2><Users className="h-4 w-4 text-theme-accent-primary" aria-hidden="true" /></div>
        <p className="mt-4"><strong className="text-4xl font-semibold tracking-tight text-theme-text-canvas">{number(report.allTime.visitors)}</strong><span className="ml-2 text-xs text-theme-text-tertiary">累计独立访客</span></p>
        <p className="mt-3 text-xs text-theme-text-secondary">近 30 天 <span className="font-mono text-theme-accent-primary">{number(report.total.visitors)}</span> 位 · 指纹去重</p>
      </section>
      <section className={panel}>
        <div className="flex items-center justify-between text-theme-text-secondary"><h2 className="text-sm">文章阅读量</h2><BookOpen className="h-4 w-4 text-theme-accent-primary" aria-hidden="true" /></div>
        <p className="mt-4"><strong className="text-4xl font-semibold tracking-tight text-theme-text-canvas">{number(report.allTime.articleViews)}</strong><span className="ml-2 text-xs text-theme-text-tertiary">累计阅读</span></p>
        <p className="mt-3 text-xs text-theme-text-secondary">近 30 天 <span className="font-mono text-theme-accent-primary">{number(report.total.articleViews)}</span> 次 · 已发布文章</p>
      </section>
    </div>

    <section className={panel}>
      <h2 className="font-medium text-theme-text-canvas">全站访问人数趋势</h2>
      <p className="mt-1 text-xs text-theme-text-tertiary">每天按指纹去重；区间人数独立去重，不累加每日人数。</p>
      <DailyTrend label="全站访问人数" unit="位访客" data={report.daily.map((day) => ({ date: day.date, value: day.visitors }))} />
    </section>

    <section id="article-trend" className={`${panel} scroll-mt-6`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 className="font-medium text-theme-text-canvas">文章阅读趋势</h2><p className="mt-1 text-xs text-theme-text-tertiary">{selectedArticle?.title || '全部已发布文章'}</p></div>
        <div className="w-full sm:w-auto"><label htmlFor="analytics-article" className="sr-only">选择文章查看阅读趋势</label><select id="analytics-article" value={selectedArticle?.id || 'all'} onChange={(event) => setArticleId(event.target.value)} className="w-full max-w-full rounded-lg border border-theme-border bg-theme-canvas px-3 py-2 text-sm text-theme-text-canvas sm:max-w-[360px]">
          <option value="all">全部文章</option>{report.articles.map((article) => <option key={article.id} value={article.id}>{article.title}</option>)}
        </select></div>
      </div>
      <DailyTrend label={`${selectedArticle?.title || '全部文章'}阅读量`} unit="次阅读" data={articleDays} />
    </section>

    <section className={`${panel} overflow-hidden`}>
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-medium text-theme-text-canvas">各文章阅读量 <span className="ml-2 text-xs font-normal text-theme-text-tertiary">{report.articles.length} 篇</span></h2><div className="w-full sm:w-auto"><label htmlFor="analytics-search" className="sr-only">搜索文章标题</label><input id="analytics-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索文章标题" className="w-full rounded-lg border border-theme-border bg-theme-canvas px-3 py-2 text-sm text-theme-text-canvas sm:w-64" /></div></div>
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[570px] text-left text-sm">
        <thead className="border-b border-theme-border text-xs text-theme-text-tertiary"><tr><th scope="col" className="pb-3 font-normal">文章</th><th scope="col" className="pb-3 font-normal">累计阅读量</th><th scope="col" className="pb-3 font-normal">近 30 天</th><th scope="col" className="pb-3 text-right font-normal">趋势</th></tr></thead>
        <tbody>{filtered.map((article) => <tr key={article.id} className="border-b border-theme-border last:border-0">
          <td className="max-w-[440px] py-4 pr-6"><Link href={article.path} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-theme-text-canvas"><span className="truncate">{article.title}</span><ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-theme-text-tertiary group-hover:text-theme-accent-primary" /></Link></td>
          <td className="font-mono text-theme-text-canvas">{number(article.views)}</td><td className="font-mono text-theme-text-canvas">{number(article.views30d)}</td>
          <td className="text-right"><button type="button" aria-pressed={selectedArticle?.id === article.id} aria-label={`查看《${article.title}》的近30天趋势`} onClick={() => { setArticleId(article.id); document.getElementById('article-trend')?.scrollIntoView({ block: 'start' }) }} className="whitespace-nowrap rounded-md px-2 py-1 text-xs text-theme-accent-primary hover:bg-theme-accent-bg">查看趋势</button></td>
        </tr>)}</tbody>
      </table></div>
      {!filtered.length && <p className="py-8 text-sm text-theme-text-tertiary">{report.articles.length ? '没有匹配的文章。' : '尚无已发布文章。'}</p>}
      <p className="mt-4 text-xs leading-relaxed text-theme-text-tertiary">累计阅读量从埋点接入后计算，保留旧版真实阅读记录。</p>
    </section>

    <p className="text-xs leading-6 text-theme-text-tertiary">{report.visitorSince ? `指纹访问记录起于 ${report.visitorSince}。` : '指纹访问人数从新版接入后开始记录。'} 指纹用于估算独立浏览器，浏览器环境变化可能影响去重；识别失败的访问不凑入人数。作者登录、后台与启用隐私偏好的访问不计入。</p>
  </div>
}
