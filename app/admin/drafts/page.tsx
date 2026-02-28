'use client'

import { useState, useEffect } from 'react'
import { FileX } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { getPosts, togglePostStatus } from '@/server/actions/posts'
import { toast } from 'react-hot-toast'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 加载草稿数据
  useEffect(() => {
    async function loadDrafts() {
      try {
        const result = await getPosts({
          draftsOnly: true,
          pageSize: 50, // 草稿箱显示更多
        })
        setDrafts(result.data)
      } catch (error) {
        console.error('加载草稿失败:', error)
        toast.error('加载草稿失败')
      } finally {
        setIsLoading(false)
      }
    }
    loadDrafts()
  }, [])

  // 直接发布
  const handlePublish = async (postId: string) => {
    try {
      await togglePostStatus(postId)
      // 从列表中移除已发布的草稿
      setDrafts(drafts.filter(draft => draft.id !== postId))
      toast.success('发布成功')
    } catch (error: any) {
      console.error('发布失败:', error)
      toast.error(error.message || '发布失败')
    }
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-theme-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <h1 className="text-2xl font-semibold text-theme-text-canvas">草稿箱</h1>
        <p className="text-sm text-theme-text-secondary mt-1">
          管理未发布的草稿文章
        </p>
      </motion.div>

      {drafts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
          className="bg-theme-bg-surface border border-theme-border rounded-xl p-12 text-center"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-theme-bg-muted flex items-center justify-center">
              <FileX className="w-6 h-6 text-theme-text-tertiary" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-theme-text-canvas font-medium mb-1">还没有任何草稿</h3>
              <p className="text-sm text-theme-text-secondary">
                开始写你的第一篇文章吧
              </p>
            </div>
            <Link href="/admin/posts/new">
              <Button>新建文章</Button>
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
          className="space-y-3"
        >
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="bg-theme-bg-surface border border-theme-border rounded-xl p-4 hover:border-theme-accent-primary transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-theme-text-canvas">{draft.title}</h3>
                  <p className="text-xs text-theme-text-tertiary mt-1">
                    最后修改: {formatDate(draft.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/posts/${draft.id}/edit`}>
                    <Button size="sm" variant="outline">
                      编辑
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    onClick={() => handlePublish(draft.id)}
                  >
                    发布
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
