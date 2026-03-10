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
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
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
      <div className="mb-3">
        <div className="bg-theme-surface border border-theme-border rounded-xl p-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-theme-text-tertiary" />
            <h3 className="text-sm font-medium text-theme-text-secondary">文章封面</h3>
          </div>
          <p className="text-sm text-theme-text-tertiary mt-2 text-center">
            保存文章后即可使用封面功能
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-3">
      <div className="bg-theme-surface border border-theme-border rounded-xl p-4 space-y-3">
        {/* 头部：标题和操作按钮 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-theme-accent-primary" />
            <h3 className="text-sm font-medium text-theme-text-canvas">文章封面</h3>
            <CoverStatusLabel status={coverStatus} />
          </div>
          <div className="flex items-center gap-2">
            {coverStatus === CoverStatus.DONE || coverStatus === CoverStatus.MANUAL ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUploadClick}
                  disabled={isUploading}
                >
                  <Upload className="w-3 h-3 mr-1" />
                  更换
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRemoveCover}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  删除
                </Button>
                {coverStatus === CoverStatus.DONE && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRegenerateCover}
                    disabled={isGenerating}
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    重新生成
                  </Button>
                )}
              </>
            ) : coverStatus === CoverStatus.PENDING || coverStatus === CoverStatus.FAILED || coverStatus === null ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUploadClick}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      上传中...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3 h-3 mr-1" />
                      上传封面
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={handleGenerateCover}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3 h-3 mr-1" />
                      AI 生成
                    </>
                  )}
                </Button>
              </>
            ) : null}
          </div>
        </div>

        {/* 封面预览区域 */}
        {coverUrl ? (
          <div className="relative group">
            {coverStatus === CoverStatus.GENERATING && (
              <div className="absolute inset-0 bg-theme-canvas/80 flex items-center justify-center rounded-lg z-10">
                <div className="flex items-center gap-2 text-theme-accent-primary">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">正在生成封面...</span>
                </div>
              </div>
            )}
            <div className="relative w-full rounded-lg overflow-hidden bg-theme-canvas">
              <img
                src={coverUrl}
                alt="文章封面"
                className="w-full h-auto object-cover"
                style={{ maxHeight: '300px' }}
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-32 rounded-lg border-2 border-dashed border-theme-border flex flex-col items-center justify-center text-theme-text-tertiary">
            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">
              {coverStatus === CoverStatus.GENERATING
                ? '正在生成封面...'
                : coverStatus === CoverStatus.FAILED
                  ? '封面生成失败，请重试'
                  : '上传封面或使用 AI 生成'}
            </p>
          </div>
        )}

        {/* 生成期间的锁定提示 */}
        {coverStatus === CoverStatus.GENERATING && (
          <div className="flex items-center gap-2 text-xs text-theme-text-tertiary bg-theme-muted px-3 py-2 rounded-lg">
            <Lock className="w-3 h-3" />
            <span>封面生成期间，部分功能受限</span>
          </div>
        )}
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
