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
import { updatePost, getPost, getCategoriesForSelect, getTagsForSelect } from '@/server/actions/posts'
import { toast } from 'react-hot-toast'
import { X, FolderOpen, Tag as TagIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { AISummaryEditor } from '@/components/admin/ai-summary-editor'
import { SummaryStatus } from '@/server/ai/types'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { theme } = useTheme()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [existingTags, setExistingTags] = useState<any[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  // AI 摘要状态（由 AISummaryEditor 组件管理）
  const [aiSummary, setAiSummary] = useState('')
  const [aiSummaryStatus, setAiSummaryStatus] = useState<SummaryStatus>(SummaryStatus.PENDING)

  const initialContentRef = useRef<string>('')
  const editorRef = useRef<CherryEditorRef>(null)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 各自独立的 loading 状态
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  // 设置页面标题
  useEffect(() => {
    if (title) {
      document.title = `编辑文章: ${title} - 管理后台`
    } else {
      document.title = '编辑文章 - 管理后台'
    }
  }, [title])

  // 解析主题
  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setResolvedTheme(isDark ? 'dark' : 'light')
    } else {
      setResolvedTheme((theme as 'light' | 'dark') || 'light')
    }
  }, [theme])

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
          setTags((post.tags?.filter((t): t is string => t !== null) || []) as string[])
          // 加载 AI 摘要状态
          setAiSummary(post.aiSummary || '')
          setAiSummaryStatus((post.aiSummaryStatus || SummaryStatus.PENDING) as SummaryStatus)
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
    // 如果正在手动保存，跳过自动保存
    if (isSavingDraft || isPublishing) {
      return
    }

    if (!hasUnsavedChanges || !title.trim() || !content.trim()) {
      return
    }

    try {
      await updatePost(id, { title, content, categoryId, tags, aiSummary })
      setHasUnsavedChanges(false)
      toast.success('已自动保存')
    } catch (error) {
      console.error('自动保存失败:', error)
    }
  }, [id, title, content, categoryId, tags, hasUnsavedChanges, aiSummary, isSavingDraft, isPublishing])

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
      if (tags.length >= 3) {
        toast.error('最多只能添加3个标签')
        return
      }
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
      if (tags.length >= 3) {
        toast.error('最多只能添加3个标签')
        return
      }
      setTags([...tags, tagName])
    }
  }

  // 保存草稿
  const handleSaveDraft = async () => {
    // 如果正在执行，直接返回
    if (isSavingDraft || isPublishing) {
      return
    }

    if (!title.trim()) {
      toast.error('请输入标题')
      return
    }
    if (!content.trim()) {
      toast.error('请输入内容')
      return
    }

    // 检查是否正在生成摘要
    if (aiSummaryStatus === SummaryStatus.GENERATING) {
      toast.error('AI 摘要生成中，无法保存')
      return
    }

    setIsSavingDraft(true)

    try {
      await updatePost(id, {
        title,
        content,
        published: false,
        categoryId: categoryId || undefined,
        tags,
        readTime: Math.ceil(content.length / 400),
        aiSummary,
      })
      setHasUnsavedChanges(false)
      toast.success('保存成功')
    } catch (error: any) {
      console.error('保存失败:', error)
      toast.error(error.message || '保存失败')
    } finally {
      setIsSavingDraft(false)
    }
  }

  // 发布文章
  const handlePublish = async () => {
    // 如果正在执行，直接返回
    if (isSavingDraft || isPublishing) {
      return
    }

    if (!title.trim()) {
      toast.error('请输入标题')
      return
    }
    if (!content.trim()) {
      toast.error('请输入内容')
      return
    }

    // 检查是否正在生成摘要
    if (aiSummaryStatus === SummaryStatus.GENERATING) {
      toast.error('AI 摘要生成中，无法发布')
      return
    }

    setIsPublishing(true)

    try {
      await updatePost(id, {
        title,
        content,
        published: true,
        categoryId: categoryId || undefined,
        tags,
        readTime: Math.ceil(content.length / 400),
        publishedDate: new Date().toISOString(),
        aiSummary,
      })
      setPublished(true)
      setHasUnsavedChanges(false)
      toast.success('发布成功')
      router.push('/admin/posts')
    } catch (error: any) {
      console.error('发布失败:', error)
      toast.error(error.message || '发布失败')
    } finally {
      setIsPublishing(false)
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
          <Button variant="outline" onClick={handleCancel} disabled={isSavingDraft || isPublishing}>
            取消
          </Button>
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSavingDraft || isPublishing || aiSummaryStatus === SummaryStatus.GENERATING}
          >
            {isSavingDraft ? '保存中...' : '保存草稿'}
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isSavingDraft || isPublishing || aiSummaryStatus === SummaryStatus.GENERATING}
          >
            {isPublishing ? '发布中...' : '发布'}
          </Button>
        </div>
      </div>

      {/* 标题输入 */}
      <div className="mb-3 flex-shrink-0">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入文章标题..."
          className="px-4 py-3 text-lg font-medium rounded-xl"
        />
      </div>

      {/* 分类和标签 - 同一行布局 */}
      <div className="flex items-center gap-3 mb-3 flex-shrink-0">
        {/* 分类选择器 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <FolderOpen className="w-4 h-4 text-theme-text-secondary" />
          {!isLoadingOptions && (
            <Select value={categoryId || undefined} onValueChange={(value) => setCategoryId(value === 'none' ? '' : value)}>
              <SelectTrigger className="h-9 w-[160px]">
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

        {/* 标签输入框 - 内嵌已选标签 */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <TagIcon className="w-4 h-4 text-theme-text-secondary flex-shrink-0" />
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 h-9 bg-theme-bg-surface border border-theme-border rounded-md text-sm focus-within:ring-2 focus-within:ring-theme-accent-primary focus-within:border-transparent">
            {/* 已选标签 */}
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-theme-accent-bg text-theme-accent-primary rounded text-xs flex-shrink-0"
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
            {/* 输入框 */}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder={tags.length >= 3 ? "已达到标签上限 (3/3)" : "输入标签..."}
              className="flex-1 min-w-[60px] bg-transparent outline-none placeholder:text-theme-text-tertiary disabled:opacity-50"
              disabled={tags.length >= 3}
            />
            {/* 计数器 */}
            {tags.length > 0 && (
              <span className="text-xs text-theme-text-tertiary flex-shrink-0">({tags.length}/3)</span>
            )}
          </div>
        </div>
      </div>

      {/* 已有标签快速选择 */}
      {!isLoadingOptions && existingTags.length > 0 && (
        <div className="flex items-center gap-2 mb-3 flex-shrink-0 pl-7">
          <span className="text-xs text-theme-text-tertiary">快速选择:</span>
          {existingTags.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleToggleExistingTag(tag.name)}
              disabled={tags.length >= 3 && !tags.includes(tag.name)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                tags.includes(tag.name)
                  ? 'bg-theme-accent-primary text-white'
                  : 'bg-theme-bg-muted text-theme-text-secondary hover:bg-theme-bg-tertiary'
              } ${tags.length >= 3 && !tags.includes(tag.name) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* AI 摘要区域 */}
      <AISummaryEditor
        postId={id}
        initialSummary={aiSummary}
        initialStatus={aiSummaryStatus}
        onSummaryChange={setAiSummary}
        onStatusChange={setAiSummaryStatus}
        title={title}
        content={content}
      />

      {/* Cherry Markdown 编辑器 */}
      <div className="flex-1 min-h-0 flex-shrink-0">
        <CherryEditor
          ref={editorRef}
          initialValue={initialContentRef.current}
          onChange={setContent}
          height="100%"
          theme={resolvedTheme}
          className="bg-theme-bg-surface border border-theme-border rounded-xl overflow-hidden h-full"
        />
      </div>
    </div>
  )
}
