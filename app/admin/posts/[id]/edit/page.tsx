'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CherryEditor, CherryEditorRef } from '@/components/admin/cherry-editor'
import { createPost, updatePost, getPost } from '@/lib/actions/posts'
import { toast } from 'react-hot-toast'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // 使用 ref 存储初始内容，避免 content 变化时重新初始化编辑器
  const initialContentRef = useRef<string>('')
  const editorRef = useRef<CherryEditorRef>(null)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 加载文章数据
  useEffect(() => {
    async function loadPost() {
      try {
        const post = await getPost(id)
        if (post) {
          setTitle(post.title)
          const postContent = post.content || ''
          setContent(postContent)
          initialContentRef.current = postContent // 只设置一次
          setPublished(post.published)
        } else {
          toast.error('文章不存在')
          router.push('/admin/posts')
        }
      } catch (error) {
        console.error('加载文章失败:', error)
        toast.error('加载文章失败')
        router.push('/admin/posts')
      } finally {
        setIsLoading(false)
      }
    }

    loadPost()
  }, [id, router])

  // 自动保存功能（每 30 秒）
  const autoSave = useCallback(async () => {
    if (!hasUnsavedChanges || !title.trim() || !content.trim()) {
      return
    }

    try {
      await updatePost(id, { title, content })
      setHasUnsavedChanges(false)
      toast.success('已自动保存')
    } catch (error) {
      console.error('自动保存失败:', error)
    }
  }, [id, title, content, hasUnsavedChanges])

  // 设置自动保存定时器
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = setInterval(() => {
      autoSave()
    }, 30000) // 30 秒

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current)
      }
    }
  }, [autoSave])

  // 标记有未保存的更改
  useEffect(() => {
    setHasUnsavedChanges(true)
  }, [title, content])

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
      await updatePost(id, {
        title,
        content,
        published: false,
      })
      setHasUnsavedChanges(false)
      toast.success('保存成功')
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
      await updatePost(id, {
        title,
        content,
        published: true,
      })
      setPublished(true)
      setHasUnsavedChanges(false)
      toast.success('发布成功')
      router.push('/admin/posts')
    } catch (error: any) {
      console.error('发布失败:', error)
      toast.error(error.message || '发布失败')
    } finally {
      setIsSaving(false)
    }
  }

  // 取消编辑
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm('有未保存的更改，确定要离开吗？')) {
        router.push('/admin/posts')
      }
    } else {
      router.push('/admin/posts')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-theme-bg-canvas flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-theme-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-theme-text-canvas">编辑文章</h1>
          <p className="text-sm text-theme-text-secondary mt-1">
            {published ? '已发布' : '草稿'}
            {hasUnsavedChanges && ' • 有未保存的更改'}
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
          initialValue={initialContentRef.current}
          onChange={setContent}
          height="600px"
          className="bg-theme-bg-surface border border-theme-border rounded-xl overflow-hidden"
        />
      </div>
    </div>
  )
}
