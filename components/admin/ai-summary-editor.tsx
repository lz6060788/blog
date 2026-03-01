'use client'

import { useState, useEffect, useRef } from 'react'
import { Wand2, Lock, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AISummaryStatusLabel } from '@/components/admin/ai-summary-status'
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
      <div className="mb-3">
        <div className="bg-theme-bg-surface border border-theme-border rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-theme-text-tertiary" />
            <h3 className="text-sm font-medium text-theme-text-secondary">AI 摘要</h3>
          </div>
          <p className="text-sm text-theme-text-tertiary mt-2 text-center">
            保存文章后即可使用 AI 摘要功能
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-3">
        <div className="bg-theme-bg-surface border border-theme-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-theme-accent-primary" />
              <h3 className="text-sm font-medium text-theme-text-canvas">AI 摘要</h3>
              <AISummaryStatusLabel status={aiSummaryStatus} />
            </div>
            <div className="flex items-center gap-2">
              {aiSummaryStatus === SummaryStatus.DONE && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRegenerateSummary}
                  disabled={isGeneratingSummary}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  重新生成
                </Button>
              )}
              {aiSummaryStatus === SummaryStatus.PENDING || aiSummaryStatus === SummaryStatus.FAILED ? (
                <Button
                  size="sm"
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                >
                  {isGeneratingSummary ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3 h-3 mr-1" />
                      生成摘要
                    </>
                  )}
                </Button>
              ) : null}
            </div>
          </div>

          {/* 摘要内容显示/编辑 */}
          {aiSummary ? (
            <div className="relative">
              {aiSummaryStatus === SummaryStatus.GENERATING && (
                <div className="absolute inset-0 bg-theme-bg-canvas/80 flex items-center justify-center rounded-lg z-10">
                  <div className="flex items-center gap-2 text-theme-accent-primary">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">正在生成摘要...</span>
                  </div>
                </div>
              )}
              <textarea
                value={aiSummary}
                onChange={(e) => setAiSummary(e.target.value)}
                className="w-full px-3 py-2 bg-theme-bg-canvas border border-theme-border rounded-lg text-sm text-theme-text-canvas focus:outline-none focus:ring-2 focus:ring-theme-accent-primary resize-none"
                rows={3}
                placeholder="生成的摘要将显示在这里..."
                disabled={aiSummaryStatus === SummaryStatus.GENERATING}
              />
            </div>
          ) : (
            <div className="text-sm text-theme-text-tertiary py-2 text-center">
              {aiSummaryStatus === SummaryStatus.GENERATING
                ? '正在生成摘要...'
                : aiSummaryStatus === SummaryStatus.FAILED
                  ? '摘要生成失败，请重试'
                  : '点击"生成摘要"按钮，AI 将为您的文章生成摘要'}
            </div>
          )}

          {/* 生成期间的锁定提示 */}
          {aiSummaryStatus === SummaryStatus.GENERATING && (
            <div className="flex items-center gap-2 text-xs text-theme-text-tertiary bg-theme-bg-muted px-3 py-2 rounded-lg">
              <Lock className="w-3 h-3" />
              <span>摘要生成期间，编辑功能已锁定</span>
            </div>
          )}
        </div>
      </div>

      {/* 生成期间的遮罩层 */}
      {aiSummaryStatus === SummaryStatus.GENERATING && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-theme-bg-surface border border-theme-border rounded-xl p-6 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-theme-accent-primary" />
            <p className="text-sm font-medium text-theme-text-canvas">正在生成 AI 摘要</p>
            <p className="text-xs text-theme-text-secondary">请稍候，生成期间无法编辑文章</p>
          </div>
        </div>
      )}
    </>
  )
}
