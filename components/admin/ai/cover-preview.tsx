'use client'

import { useState, useEffect, useRef } from 'react'
import { Image as ImageIcon, Loader2, Lock, RefreshCw, Trash2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CoverStatus } from '@/server/ai/types'
import { toast } from 'react-hot-toast'

/**
 * 封面状态标签组件
 */
interface CoverStatusLabelProps {
  status: CoverStatus | null
}

function CoverStatusLabel({ status }: CoverStatusLabelProps) {
  const labels: Record<string, { text: string; className: string }> = {
    pending: { text: '待生成', className: 'bg-theme-surface-alt text-theme-text-secondary' },
    generating: { text: '生成中', className: 'bg-theme-info-bg text-theme-info-primary' },
    done: { text: '已完成', className: 'bg-theme-success-bg text-theme-success-primary' },
    failed: { text: '生成失败', className: 'bg-theme-error-bg text-theme-error-primary' },
    manual: { text: '手动上传', className: 'bg-theme-accent-bg text-theme-accent-primary' },
  }

  const { text, className } = labels[status || 'pending'] || labels.pending

  return (
    <span className={`shrink-0 whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {text}
    </span>
  )
}

/**
 * 封面预览组件属性
 */
interface CoverPreviewProps {
  /** 文章 ID，新建页面为 null */
  postId: string | null
  /** 初始封面 URL */
  initialCoverUrl?: string | null
  /** 初始封面状态 */
  initialStatus?: CoverStatus | null
  /** 封面 URL 变化回调 */
  onCoverChange?: (url: string | null) => void
  /** 封面状态变化回调 */
  onStatusChange?: (status: CoverStatus | null) => void
  /** 文章标题，用于生成前验证 */
  title?: string
  /** 文章内容，用于生成前验证 */
  content?: string
}

export function CoverPreview({
  postId,
  initialCoverUrl = null,
  initialStatus = null,
  onCoverChange,
  onStatusChange,
  title = '',
  content = '',
}: CoverPreviewProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(initialCoverUrl)
  const [coverStatus, setCoverStatus] = useState<CoverStatus | null>(initialStatus || CoverStatus.PENDING)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const coverPollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 同步初始值
  useEffect(() => {
    setCoverUrl(initialCoverUrl)
    setCoverStatus(initialStatus)
  }, [initialCoverUrl, initialStatus])

  // 当封面或状态变化时，通知父组件
  useEffect(() => {
    onCoverChange?.(coverUrl)
  }, [coverUrl, onCoverChange])

  useEffect(() => {
    onStatusChange?.(coverStatus)
  }, [coverStatus, onStatusChange])

  // 开始轮询封面状态
  const startCoverPolling = () => {
    if (!postId || coverPollIntervalRef.current) {
      return
    }

    coverPollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/posts/${postId}/ai-cover-status`)
        if (res.ok) {
          const data = await res.json()
          setCoverStatus(data.status)
          setCoverUrl(data.coverImageUrl || null)

          // 如果生成完成或失败，停止轮询
          if (data.status === 'done' || data.status === 'failed') {
            stopCoverPolling()
            if (data.status === 'done') {
              toast.success('AI 封面生成成功')
            } else {
              toast.error('AI 封面生成失败')
            }
          }
        }
      } catch (error) {
        console.error('获取封面状态失败:', error)
      }
    }, 3000) // 每 3 秒轮询一次
  }

  // 停止轮询封面状态
  const stopCoverPolling = () => {
    if (coverPollIntervalRef.current) {
      clearInterval(coverPollIntervalRef.current)
      coverPollIntervalRef.current = null
    }
  }

  // 清理轮询
  useEffect(() => {
    return () => {
      stopCoverPolling()
    }
  }, [])

  // 如果初始状态是生成中，开始轮询
  useEffect(() => {
    if (postId && initialStatus === CoverStatus.GENERATING) {
      startCoverPolling()
    }
  }, [postId])

  // 生成 AI 封面
  const handleGenerateCover = async () => {
    if (!postId) {
      toast.error('请先保存文章')
      return
    }

    if (!title?.trim() || !content?.trim()) {
      toast.error('请先填写文章标题和内容')
      return
    }

    setIsGenerating(true)
    try {
      const res = await fetch(`/api/admin/posts/${postId}/generate-cover`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        if (data.needsConfiguration) {
          toast.error('请先在设置页面配置 AI 图像生成模型')
          return
        }
        throw new Error(data.error || '生成失败')
      }

      setCoverStatus(CoverStatus.GENERATING)
      startCoverPolling()
      toast.success('已开始生成 AI 封面')
    } catch (error: any) {
      console.error('生成封面失败:', error)
      toast.error(error.message || '生成失败')
    } finally {
      setIsGenerating(false)
    }
  }

  // 重新生成 AI 封面
  const handleRegenerateCover = () => {
    if (!confirm('确定要重新生成 AI 封面吗？')) {
      return
    }
    handleGenerateCover()
  }

  // 删除封面
  const handleRemoveCover = async () => {
    if (!postId) {
      setCoverUrl(null)
      setCoverStatus(CoverStatus.PENDING)
      return
    }

    if (!confirm('确定要删除封面吗？')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/posts/${postId}/cover`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('删除失败')
      }

      setCoverUrl(null)
      setCoverStatus(CoverStatus.PENDING)
      toast.success('封面已删除')
    } catch (error: any) {
      console.error('删除封面失败:', error)
      toast.error(error.message || '删除失败')
    }
  }

  // 上传封面
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('请上传 JPG、PNG 或 WEBP 格式的图片')
      return
    }

    // 验证文件大小（5MB）
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('图片大小不能超过 5MB')
      return
    }

    if (!postId) {
      toast.error('请先保存文章')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('上传失败')
      }

      const data = await res.json()
      setCoverUrl(data.url)
      setCoverStatus(CoverStatus.MANUAL)
      toast.success('封面上传成功')
    } catch (error: any) {
      console.error('上传封面失败:', error)
      toast.error(error.message || '上传失败')
    } finally {
      setIsUploading(false)
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // 新建页面：显示提示信息
  if (!postId) {
    return (
      <section className="overflow-hidden rounded-2xl border border-theme-border bg-theme-surface shadow-sm">
        <header className="flex items-start justify-between gap-3 border-b border-theme-border bg-theme-muted/30 px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-theme-accent-bg">
              <ImageIcon className="h-5 w-5 text-theme-accent-primary" />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-theme-text-canvas">文章封面</h3>
              <p className="mt-0.5 text-xs leading-5 text-theme-text-tertiary">16:9 · JPG、PNG 或 WebP · 最大 10MB</p>
            </div>
          </div>
          <span className="shrink-0 whitespace-nowrap rounded-full bg-theme-muted px-2.5 py-1 text-xs font-medium text-theme-text-tertiary">保存后可用</span>
        </header>
        <div className="flex min-h-[230px] flex-col items-center justify-center px-8 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-theme-muted text-theme-text-tertiary">
            <Lock className="h-6 w-6" />
          </span>
          <p className="text-sm font-medium text-theme-text-secondary">先保存文章草稿</p>
          <p className="mt-1 max-w-xs text-xs leading-5 text-theme-text-tertiary">获得文章 ID 后即可上传封面，或根据标题和正文使用 AI 生成。</p>
        </div>
        <footer className="grid grid-cols-2 gap-2 border-t border-theme-border bg-theme-muted/20 px-5 py-4">
          <Button variant="outline" className="w-full" disabled><Upload />本地上传</Button>
          <Button className="w-full" disabled><ImageIcon />AI 生成</Button>
        </footer>
      </section>
    )
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-theme-border bg-theme-surface shadow-sm">
        <header className="flex items-start justify-between gap-3 border-b border-theme-border bg-theme-muted/30 px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-theme-accent-bg">
              <ImageIcon className="h-5 w-5 text-theme-accent-primary" />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-theme-text-canvas">文章封面</h3>
              <p className="mt-0.5 text-xs leading-5 text-theme-text-tertiary">16:9 · JPG、PNG 或 WebP · 最大 10MB</p>
            </div>
          </div>
          <div className="pt-1">
            <CoverStatusLabel status={coverStatus} />
          </div>
        </header>

        {/* 封面预览区域 */}
        <div className="p-5">
          <div className="group relative aspect-video w-full overflow-hidden rounded-xl border border-theme-border bg-theme-canvas">
            {coverStatus === CoverStatus.GENERATING && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-theme-canvas/85 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2 text-theme-accent-primary">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-sm">正在生成封面...</span>
                </div>
              </div>
            )}
            {coverUrl ? (
              <>
              <img
                src={coverUrl}
                alt="文章封面"
                  className="h-full w-full object-cover"
              />
                {coverStatus !== CoverStatus.GENERATING && (
                  <Button size="icon" variant="destructive" aria-label="删除封面" className="absolute right-3 top-3 z-10 h-9 w-9 opacity-0 shadow-md transition-opacity group-hover:opacity-100" onClick={handleRemoveCover}>
                    <Trash2 />
                  </Button>
                )}
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-theme-muted text-theme-text-tertiary">
                  <ImageIcon className="h-6 w-6 opacity-60" />
                </span>
                <p className="text-sm font-medium text-theme-text-secondary">
                  {coverStatus === CoverStatus.FAILED ? '封面生成失败' : '尚未设置文章封面'}
                </p>
                <p className="mt-1 text-xs leading-5 text-theme-text-tertiary">
                  {coverStatus === CoverStatus.FAILED ? '请重新生成，或改为本地上传' : '上传图片，或根据标题和正文自动生成'}
                </p>
              </div>
            )}
          </div>

          {coverStatus === CoverStatus.GENERATING && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-theme-muted px-3 py-2 text-xs text-theme-text-tertiary">
              <Lock className="h-3 w-3" />
              <span>封面生成期间，相关操作暂不可用</span>
            </div>
          )}
        </div>

        <footer className="grid grid-cols-2 gap-2 border-t border-theme-border bg-theme-muted/20 px-5 py-4">
          <Button variant="outline" className="w-full" onClick={handleUploadClick} disabled={isUploading || isGenerating}>
            {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
            {isUploading ? '上传中...' : coverUrl ? '更换封面' : '本地上传'}
          </Button>
          <Button className="w-full" onClick={coverUrl && coverStatus === CoverStatus.DONE ? handleRegenerateCover : handleGenerateCover} disabled={isGenerating || isUploading}>
            {isGenerating ? <Loader2 className="animate-spin" /> : coverUrl && coverStatus === CoverStatus.DONE ? <RefreshCw /> : <ImageIcon />}
            {isGenerating ? '生成中...' : coverUrl && coverStatus === CoverStatus.DONE ? '重新生成' : 'AI 生成'}
          </Button>
        </footer>
      </section>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  )
}
