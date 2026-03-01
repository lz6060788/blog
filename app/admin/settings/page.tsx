'use client'

import { useState, useEffect } from 'react'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSettings, updateSettings } from '@/server/actions/settings'
import { toast } from 'react-hot-toast'
import { AIConfigCard } from '@/components/admin/ai-config-card'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  const [blogName, setBlogName] = useState('')
  const [blogDescription, setBlogDescription] = useState('')
  const [postsPerPage, setPostsPerPage] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // 加载设置
  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSettings()
        setBlogName(data.blogName)
        setBlogDescription(data.blogDescription)
        setPostsPerPage(data.postsPerPage)
      } catch (error) {
        console.error('加载设置失败:', error)
        toast.error('加载设置失败')
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [])

  // 保存设置
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!blogName.trim()) {
      toast.error('博客名称不能为空')
      return
    }

    if (postsPerPage < 1 || postsPerPage > 100) {
      toast.error('每页文章数必须在 1-100 之间')
      return
    }

    setIsSaving(true)
    try {
      await updateSettings({
        blogName,
        blogDescription,
        postsPerPage,
      })
      toast.success('设置已保存')
    } catch (error: any) {
      console.error('保存失败:', error)
      toast.error(error.message || '保存失败')
    } finally {
      setIsSaving(false)
    }
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
      <div>
        <h1 className="text-2xl font-semibold text-theme-text-canvas">设置</h1>
        <p className="text-sm text-theme-text-secondary mt-1">
          管理博客配置
        </p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        {/* 基本信息 */}
        <div className="bg-theme-bg-surface border border-theme-border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-medium text-theme-text-canvas">基本信息</h2>

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              博客名称
            </label>
            <input
              type="text"
              value={blogName}
              onChange={(e) => setBlogName(e.target.value)}
              placeholder="My Blog"
              className="w-full px-4 py-2 bg-theme-bg-canvas border border-theme-border rounded-xl text-theme-text-canvas placeholder:text-theme-text-tertiary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              博客描述
            </label>
            <textarea
              value={blogDescription}
              onChange={(e) => setBlogDescription(e.target.value)}
              placeholder="A personal blog"
              rows={3}
              className="w-full px-4 py-2 bg-theme-bg-canvas border border-theme-border rounded-xl text-theme-text-canvas placeholder:text-theme-text-tertiary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* 显示设置 */}
        <div className="bg-theme-bg-surface border border-theme-border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-medium text-theme-text-canvas">显示设置</h2>

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              每页文章数
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={postsPerPage}
              onChange={(e) => setPostsPerPage(parseInt(e.target.value) || 10)}
              className="w-full px-4 py-2 bg-theme-bg-canvas border border-theme-border rounded-xl text-theme-text-canvas focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:border-transparent"
            />
            <p className="text-xs text-theme-text-tertiary mt-1">
              在博客首页和列表页每页显示的文章数量（1-100）
            </p>
          </div>
        </div>
      </form>

      {/* AI 配置 */}
      <div className="space-y-6">
        <AIConfigCard />
      </div>

      <form onSubmit={handleSave} className="max-w-2xl">
        {/* 保存按钮 */}
        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? '保存中...' : '保存设置'}
          </Button>
        </div>
      </form>
    </div>
  )
}
