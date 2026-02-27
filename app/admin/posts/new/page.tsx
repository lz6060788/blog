'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CherryEditor, CherryEditorRef } from '@/components/admin/cherry-editor'
import { createPost, getCategoriesForSelect, getTagsForSelect } from '@/lib/actions/posts'
import { toast } from 'react-hot-toast'
import { X, Tag as TagIcon, FolderOpen } from 'lucide-react'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

export default function NewPostPage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [existingTags, setExistingTags] = useState<any[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)

  const editorRef = useRef<CherryEditorRef>(null)

  // 设置页面标题
  useEffect(() => {
    document.title = '新建文章 - 管理后台'
  }, [])

  // 加载分类和标签选项
  useEffect(() => {
    async function loadOptions() {
      try {
        const [cats, tagsData] = await Promise.all([
          getCategoriesForSelect(),
          getTagsForSelect()
        ])
        setCategories(cats)
        setExistingTags(tagsData)
      } catch (error) {
        console.error('加载选项失败:', error)
      } finally {
        setIsLoadingOptions(false)
      }
    }
    loadOptions()
  }, [])

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
      const result = await createPost({
        title,
        content,
        published: false,
        categoryId: categoryId || undefined,
        tags,
        readTime: Math.ceil(content.length / 400),
      })
      toast.success('草稿已保存')
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
        categoryId: categoryId || undefined,
        tags,
        readTime: Math.ceil(content.length / 400),
        publishedDate: new Date().toISOString(),
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

      {/* 编辑器 */}
      <div className="space-y-4">
        {/* 标题输入 */}
        <div>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="请输入文章标题..."
            className="px-4 py-6 text-xl font-medium rounded-xl"
          />
        </div>

        {/* 分类和标签选择器 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 分类选择 */}
          <div className="bg-theme-bg-surface border border-theme-border rounded-xl p-4">
            <Label className="flex items-center gap-2 mb-3">
              <FolderOpen className="w-4 h-4" />
              分类
            </Label>
            {!isLoadingOptions && (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-theme-bg-canvas border border-theme-border rounded-lg text-sm text-theme-text-canvas focus:outline-none focus:ring-2 focus:ring-theme-accent-primary"
              >
                <option value="">无分类</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* 标签输入 */}
          <div className="bg-theme-bg-surface border border-theme-border rounded-xl p-4">
            <Label className="flex items-center gap-2 mb-3">
              <TagIcon className="w-4 h-4" />
              标签
            </Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="输入标签后按回车"
                  className="flex-1"
                />
                <Button type="button" size="sm" variant="outline" onClick={handleAddTag}>
                  添加
                </Button>
              </div>
              {/* 已选标签 */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-theme-accent-bg text-theme-accent-primary rounded-md text-xs"
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
                </div>
              )}
              {/* 已有标签快速选择 */}
              {!isLoadingOptions && existingTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {existingTags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleToggleExistingTag(tag.name)}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        tags.includes(tag.name)
                          ? 'bg-theme-accent-primary text-white'
                          : 'bg-theme-bg-muted text-theme-text-secondary hover:bg-theme-bg-tertiary'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cherry Markdown 编辑器 */}
        <CherryEditor
          ref={editorRef}
          initialValue=""
          onChange={setContent}
          height="600px"
          className="bg-theme-bg-surface border border-theme-border rounded-xl overflow-hidden"
        />
      </div>
    </div>
  )
}
