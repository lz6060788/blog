'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CherryEditor, CherryEditorRef } from '@/components/admin/cherry-editor'
import { updatePost, getPost, getCategoriesForSelect, getTagsForSelect } from '@/lib/actions/posts'
import { toast } from 'react-hot-toast'
import { X, FolderOpen, Tag as TagIcon } from 'lucide-react'

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
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [existingTags, setExistingTags] = useState<any[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)

  const initialContentRef = useRef<string>('')
  const editorRef = useRef<CherryEditorRef>(null)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 设置页面标题
  useEffect(() => {
    if (title) {
      document.title = `编辑文章: ${title} - 管理后台`
    } else {
      document.title = '编辑文章 - 管理后台'
    }
  }, [title])

  // 加载文章数据和选项
  useEffect(() => {
    async function loadData() {
      try {
        const [post, cats, tagsData] = await Promise.all([
          getPost(id),
          getCategoriesForSelect(),
          getTagsForSelect()
        ])
        if (post) {
          setTitle(post.title)
          const postContent = post.content || ''
          setContent(postContent)
          initialContentRef.current = postContent
          setPublished(post.published)
          setCategoryId(post.categoryId || '')
          setTags(post.tags || [])
        } else {
          toast.error('文章不存在')
          router.push('/admin/posts')
        }
        setCategories(cats)
        setExistingTags(tagsData)
      } catch (error) {
        console.error('加载数据失败:', error)
        toast.error('加载失败')
        router.push('/admin/posts')
      } finally {
        setIsLoading(false)
        setIsLoadingOptions(false)
      }
    }
    loadData()
  }, [id, router])

  // 自动保存功能
  const autoSave = useCallback(async () => {
    if (!hasUnsavedChanges || !title.trim() || !content.trim()) {
      return
    }

    try {
      await updatePost(id, { title, content, categoryId, tags })
      setHasUnsavedChanges(false)
      toast.success('已自动保存')
    } catch (error) {
      console.error('自动保存失败:', error)
    }
  }, [id, title, content, categoryId, tags, hasUnsavedChanges])

  // 设置自动保存定时器
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current)
    }
    autoSaveTimerRef.current = setInterval(() => {
      autoSave()
    }, 30000)
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current)
      }
    }
  }, [autoSave])

  // 标记有未保存的更改
  useEffect(() => {
    setHasUnsavedChanges(true)
  }, [title, content, categoryId, tags])

  // 添加标签
  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput('')
    }
  }

  // 移除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  // 标签输入回车处理
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  // 点击已有标签添加
  const handleToggleExistingTag = (tagName: string) => {
    if (tags.includes(tagName)) {
      setTags(tags.filter(t => t !== tagName))
    } else {
      setTags([...tags, tagName])
    }
  }

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
        categoryId: categoryId || undefined,
        tags,
        readTime: Math.ceil(content.length / 400),
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
        categoryId: categoryId || undefined,
        tags,
        readTime: Math.ceil(content.length / 400),
        publishedDate: new Date().toISOString(),
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
    <div className="max-w-5xl mx-auto p-6 h-full flex flex-col">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-theme-text-canvas">编辑文章</h1>
          <p className="text-sm text-theme-text-secondary mt-1">
            {published ? '已发布' : '草稿'}
            {hasUnsavedChanges && ' • 有未保存的更改'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            取消
          </Button>
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
            {isSaving ? '保存中...' : '保存草稿'}
          </Button>
          <Button onClick={handlePublish} disabled={isSaving}>
            {isSaving ? '发布中...' : '发布'}
          </Button>
        </div>
      </div>

      {/* 标题输入 */}
      <div className="flex-shrink-0">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入文章标题..."
          className="px-4 py-3 text-lg font-medium rounded-xl"
        />
      </div>

      {/* 分类和标签 - 紧凑的单行布局 */}
      <div className="flex items-center gap-4 py-2 flex-shrink-0">
        {/* 分类选择 */}
        <div className="flex items-center gap-2 flex-1">
          <FolderOpen className="w-4 h-4 text-theme-text-secondary flex-shrink-0" />
          {!isLoadingOptions && (
            <Select value={categoryId || undefined} onValueChange={(value) => setCategoryId(value === 'none' ? '' : value)}>
              <SelectTrigger className="h-9 flex-1 max-w-[200px]">
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">无分类</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* 标签输入 */}
        <div className="flex items-center gap-2 flex-1">
          <TagIcon className="w-4 h-4 text-theme-text-secondary flex-shrink-0" />
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="输入标签按回车"
            className="h-9 flex-1"
          />
          {/* 已选标签 - 显示在输入框旁边 */}
          {tags.length > 0 && (
            <div className="flex items-center gap-1">
              {tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-theme-accent-bg text-theme-accent-primary rounded text-xs whitespace-nowrap"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:opacity-70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {tags.length > 2 && (
                <span className="text-xs text-theme-text-tertiary">+{tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cherry Markdown 编辑器 */}
      <div className="flex-1 min-h-0 flex-shrink-0">
        <CherryEditor
          ref={editorRef}
          initialValue={initialContentRef.current}
          onChange={setContent}
          height="100%"
          className="bg-theme-bg-surface border border-theme-border rounded-xl overflow-hidden h-full"
        />
      </div>
    </div>
  )
}
