'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CherryEditor, CherryEditorRef } from '@/components/admin/cherry-editor'
import { createPost } from '@/lib/actions/posts'
import { toast } from 'react-hot-toast'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

export default function NewPostPage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const editorRef = useRef<CherryEditorRef>(null)

  // 保存草稿
  const handleSaveDraft = async () => {
    if (!title.trim()) {
      toast.error('请输入标题')
      return
    }
    if (!content.trim()) {
      toast.error('请输入内容')
      return
    }

    setIsSaving(true)
    try {
      const result = await createPost({
        title,
        content,
        published: false,
      })
      toast.success('草稿已保存')
      // 跳转到编辑页面
      router.push(`/admin/posts/${result.postId}/edit`)
    } catch (error: any) {
      console.error('保存失败:', error)
      toast.error(error.message || '保存失败')
    } finally {
      setIsSaving(false)
    }
  }

  // 发布文章
  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error('请输入标题')
      return
    }
    if (!content.trim()) {
      toast.error('请输入内容')
      return
    }

    setIsSaving(true)
    try {
      await createPost({
        title,
        content,
        published: true,
      })
      toast.success('发布成功')
      router.push('/admin/posts')
    } catch (error: any) {
      console.error('发布失败:', error)
      toast.error(error.message || '发布失败')
    } finally {
      setIsSaving(false)
    }
  }

  // 取消
  const handleCancel = () => {
    if (title || content) {
      if (confirm('确定要放弃当前编辑的内容吗？')) {
        router.push('/admin/posts')
      }
    } else {
      router.push('/admin/posts')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-theme-text-canvas">新建文章</h1>
          <p className="text-sm text-theme-text-secondary mt-1">
            创建并发布新文章
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            取消
          </Button>
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSaving}
          >
            {isSaving ? '保存中...' : '保存草稿'}
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isSaving}
          >
            {isSaving ? '发布中...' : '发布'}
          </Button>
        </div>
      </div>

      {/* 编辑器 */}
      <div className="space-y-4">
        {/* 标题输入 */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="请输入文章标题..."
            className="w-full px-4 py-3 bg-theme-bg-surface border border-theme-border rounded-xl text-xl font-medium text-theme-text-canvas placeholder:text-theme-text-tertiary focus:outline-none focus:ring-2 focus:ring-theme-accent-primary focus:border-transparent"
          />
        </div>

        {/* Cherry Markdown 编辑器 */}
        <CherryEditor
          ref={editorRef}
          initialValue=""  // 新建页面始终用空字符串作为初始值
          onChange={setContent}
          height="600px"
          className="bg-theme-bg-surface border border-theme-border rounded-xl overflow-hidden"
        />
      </div>
    </div>
  )
}
