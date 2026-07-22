'use client'

import { useState, useEffect, useRef } from 'react'
import { Wand2, Lock, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AISummaryStatusLabel } from '@/components/admin/ai'
import { SummaryStatus } from '@/server/ai/types'
import { toast } from 'react-hot-toast'

/**
 * AI 摘要编辑器组件
 *
 * 可复用的组件，用于在文章新建和编辑页面显示和管理 AI 摘要功能
 */
interface AISummaryEditorProps {
  /** 文章 ID，新建页面为 null */
  postId: string | null
  /** 初始摘要内容 */
  initialSummary?: string
  /** 初始摘要状态 */
  initialStatus?: SummaryStatus
  /** 摘要内容变化回调 */
  onSummaryChange?: (summary: string) => void
  /** 摘要状态变化回调 */
  onStatusChange?: (status: SummaryStatus) => void
  /** 文章标题，用于生成前验证 */
  title?: string
  /** 文章内容，用于生成前验证 */
  content?: string
}

export function AISummaryEditor({
  postId,
  initialSummary = '',
  initialStatus = SummaryStatus.PENDING,
  onSummaryChange,
  onStatusChange,
  title = '',
  content = '',
}: AISummaryEditorProps) {
  const [aiSummary, setAiSummary] = useState(initialSummary)
  const [aiSummaryStatus, setAiSummaryStatus] = useState<SummaryStatus>(initialStatus)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const summaryPollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 同步初始值
  useEffect(() => {
    setAiSummary(initialSummary)
    setAiSummaryStatus(initialStatus)
  }, [initialSummary, initialStatus])

  // 当摘要或状态变化时，通知父组件
  useEffect(() => {
    onSummaryChange?.(aiSummary)
  }, [aiSummary, onSummaryChange])

  useEffect(() => {
    onStatusChange?.(aiSummaryStatus)
  }, [aiSummaryStatus, onStatusChange])

  // 开始轮询摘要状态
  const startSummaryPolling = () => {
    if (!postId || summaryPollIntervalRef.current) {
      return
    }

    summaryPollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/posts/${postId}/ai-summary-status`)
        if (res.ok) {
          const data = await res.json()
          setAiSummaryStatus(data.status)
          setAiSummary(data.summary || '')

          // 如果生成完成或失败，停止轮询
          if (data.status === SummaryStatus.DONE || data.status === SummaryStatus.FAILED) {
            stopSummaryPolling()
            if (data.status === SummaryStatus.DONE) {
              toast.success('AI 摘要生成成功')
            } else {
              toast.error('AI 摘要生成失败')
            }
          }
        }
      } catch (error) {
        console.error('获取摘要状态失败:', error)
      }
    }, 3000) // 每 3 秒轮询一次
  }

  // 停止轮询摘要状态
  const stopSummaryPolling = () => {
    if (summaryPollIntervalRef.current) {
      clearInterval(summaryPollIntervalRef.current)
      summaryPollIntervalRef.current = null
    }
  }

  // 清理轮询
  useEffect(() => {
    return () => {
      stopSummaryPolling()
    }
  }, [])

  // 如果初始状态是生成中，开始轮询
  useEffect(() => {
    if (postId && initialStatus === SummaryStatus.GENERATING) {
      startSummaryPolling()
    }
  }, [postId])

  // 生成 AI 摘要
  const handleGenerateSummary = async () => {
    if (!postId) {
      toast.error('请先保存文章')
      return
    }

    if (!title?.trim() || !content?.trim()) {
      toast.error('请先填写文章标题和内容')
      return
    }

    setIsGeneratingSummary(true)
    try {
      const res = await fetch(`/api/admin/posts/${postId}/generate-summary`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        if (data.needsConfiguration) {
          toast.error('请先在设置页面配置 AI 模型')
          return
        }
        throw new Error(data.error || '生成失败')
      }

      setAiSummaryStatus(SummaryStatus.GENERATING)
      startSummaryPolling()
      toast.success('已开始生成 AI 摘要')
    } catch (error: any) {
      console.error('生成摘要失败:', error)
      toast.error(error.message || '生成失败')
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  // 重新生成 AI 摘要
  const handleRegenerateSummary = () => {
    if (!confirm('确定要重新生成 AI 摘要吗？')) {
      return
    }
    handleGenerateSummary()
  }

  // 新建页面：显示提示信息
  if (!postId) {
    return (
      <section className="flex min-h-[380px] flex-col overflow-hidden rounded-2xl border border-theme-border bg-theme-surface shadow-sm">
        <header className="flex items-start justify-between gap-3 border-b border-theme-border bg-theme-muted/30 px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-theme-accent-bg">
              <Wand2 className="h-5 w-5 text-theme-accent-primary" />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-theme-text-canvas">AI 摘要</h3>
              <p className="mt-0.5 text-xs leading-5 text-theme-text-tertiary">用于文章列表、搜索结果和分享描述</p>
            </div>
          </div>
          <span className="shrink-0 whitespace-nowrap rounded-full bg-theme-muted px-2.5 py-1 text-xs font-medium text-theme-text-tertiary">保存后可用</span>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-theme-muted text-theme-text-tertiary">
            <Lock className="h-6 w-6" />
          </span>
          <p className="text-sm font-medium text-theme-text-secondary">先保存文章草稿</p>
          <p className="mt-1 max-w-xs text-xs leading-5 text-theme-text-tertiary">保存后可根据标题与正文生成摘要，并在这里继续编辑。</p>
        </div>
        <footer className="border-t border-theme-border bg-theme-muted/20 px-5 py-4">
          <Button className="w-full" disabled><Wand2 />生成 AI 摘要</Button>
        </footer>
      </section>
    )
  }

  return (
    <section className="flex min-h-[380px] flex-col overflow-hidden rounded-2xl border border-theme-border bg-theme-surface shadow-sm">
      <header className="flex items-start justify-between gap-3 border-b border-theme-border bg-theme-muted/30 px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-theme-accent-bg">
            <Wand2 className="h-5 w-5 text-theme-accent-primary" />
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-theme-text-canvas">AI 摘要</h3>
            <p className="mt-0.5 text-xs leading-5 text-theme-text-tertiary">用于文章列表、搜索结果和分享描述</p>
          </div>
        </div>
        <div className="pt-1">
              <AISummaryStatusLabel status={aiSummaryStatus} />
        </div>
      </header>

      <div className="flex-1 p-5">
        {/* 摘要内容显示/编辑 */}
          {aiSummary ? (
            <div className="relative">
              {aiSummaryStatus === SummaryStatus.GENERATING && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-theme-canvas/85 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-2 text-theme-accent-primary">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-sm">正在生成摘要...</span>
                  </div>
                </div>
              )}
              <textarea
                value={aiSummary}
                onChange={(e) => setAiSummary(e.target.value)}
                className="min-h-[220px] w-full resize-y rounded-xl border border-theme-border bg-theme-canvas px-4 py-3 text-sm leading-6 text-theme-text-canvas outline-none transition focus:border-theme-accent-primary focus:ring-2 focus:ring-theme-accent-primary/20"
                rows={9}
                placeholder="生成后仍可在这里继续修改摘要..."
                disabled={aiSummaryStatus === SummaryStatus.GENERATING}
              />
            </div>
          ) : (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-theme-border bg-theme-canvas px-8 text-center">
              {aiSummaryStatus === SummaryStatus.GENERATING ? <Loader2 className="mb-3 h-7 w-7 animate-spin text-theme-accent-primary" /> : <Wand2 className="mb-3 h-7 w-7 text-theme-text-tertiary" />}
              <p className="text-sm font-medium text-theme-text-secondary">
                {aiSummaryStatus === SummaryStatus.GENERATING ? '正在生成摘要...' : aiSummaryStatus === SummaryStatus.FAILED ? '摘要生成失败' : '尚未生成 AI 摘要'}
              </p>
              <p className="mt-1 text-xs leading-5 text-theme-text-tertiary">
                {aiSummaryStatus === SummaryStatus.FAILED ? '请检查文章内容后重新尝试' : 'AI 会提炼文章重点，生成后仍可手动修改'}
              </p>
            </div>
          )}

        <div className="mt-2 flex items-center justify-between text-xs text-theme-text-tertiary">
          <span>建议控制在 80–160 字</span>
          <span>{aiSummary.length} 字</span>
        </div>

        {aiSummaryStatus === SummaryStatus.GENERATING && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-theme-muted px-3 py-2 text-xs text-theme-text-tertiary">
            <Lock className="h-3 w-3" />
            <span>摘要生成期间，编辑功能暂不可用</span>
          </div>
        )}
      </div>

      <footer className="border-t border-theme-border bg-theme-muted/20 px-5 py-4">
        <Button
          className="w-full"
          variant={aiSummaryStatus === SummaryStatus.DONE ? 'outline' : 'default'}
          onClick={aiSummaryStatus === SummaryStatus.DONE ? handleRegenerateSummary : handleGenerateSummary}
          disabled={isGeneratingSummary || aiSummaryStatus === SummaryStatus.GENERATING}
        >
          {isGeneratingSummary || aiSummaryStatus === SummaryStatus.GENERATING ? <Loader2 className="animate-spin" /> : aiSummaryStatus === SummaryStatus.DONE ? <RefreshCw /> : <Wand2 />}
          {isGeneratingSummary || aiSummaryStatus === SummaryStatus.GENERATING ? '生成中...' : aiSummaryStatus === SummaryStatus.DONE ? '重新生成摘要' : '生成 AI 摘要'}
        </Button>
      </footer>
    </section>
  )
}
