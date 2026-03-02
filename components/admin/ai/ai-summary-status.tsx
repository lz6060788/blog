import { CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react'
import { SummaryStatus } from '@/server/ai/types'

interface AISummaryStatusProps {
  status: string
  showLabel?: boolean
}

export function AISummaryStatus({ status, showLabel = false }: AISummaryStatusProps) {
  const config = {
    [SummaryStatus.PENDING]: {
      icon: Clock,
      color: 'text-theme-text-tertiary',
      bgColor: 'bg-theme-bg-muted',
      label: '未生成',
      animate: false as boolean,
    },
    [SummaryStatus.GENERATING]: {
      icon: Loader2,
      color: 'text-theme-accent-primary',
      bgColor: 'bg-theme-accent-bg',
      label: '生成中',
      animate: true as boolean,
    },
    [SummaryStatus.DONE]: {
      icon: CheckCircle2,
      color: 'text-theme-success-primary',
      bgColor: 'bg-success-50 dark:bg-success-900',
      label: '已完成',
      animate: false as boolean,
    },
    [SummaryStatus.FAILED]: {
      icon: XCircle,
      color: 'text-theme-error-primary',
      bgColor: 'bg-theme-error-bg',
      label: '失败',
      animate: false as boolean,
    },
  }

  const current = config[status as SummaryStatus] || config[SummaryStatus.PENDING]
  const Icon = current.icon

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${current.bgColor}`}>
      <Icon className={`w-4 h-4 ${current.color} ${current.animate ? 'animate-spin' : ''}`} />
      {showLabel && (
        <span className={`text-xs font-medium ${current.color}`}>
          {current.label}
        </span>
      )}
    </div>
  )
}

// 简单的状态图标版本（用于表格）
export function AISummaryStatusIcon({ status }: { status: string }) {
  return <AISummaryStatus status={status} showLabel={false} />
}

// 带标签的状态版本（用于详情页）
export function AISummaryStatusLabel({ status }: { status: string }) {
  return <AISummaryStatus status={status} showLabel={true} />
}
