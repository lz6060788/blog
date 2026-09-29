'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FolderOpen, Layers3, Tag as TagIcon, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'react-hot-toast'

import { AISummaryEditor, CoverPreview } from '@/components/admin/ai'
import { ContentEditor } from './content-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CoverStatus, SummaryStatus } from '@/server/ai/types'
import {
  createDraft,
  getCategoriesForSelect,
  getEditorDocument,
  getDraftSnapshot,
  getTagsForSelect,
  publishDraft,
  saveDraft,
  unpublishPost,
} from '@/server/actions/posts'
import { getSeriesForSelect } from '@/server/actions/series'
import { canAdoptDraftVersion } from '@/lib/draft-version'

interface PostEditorFormProps {
  sourceId?: string
}

type Option = { id: string; name: string }
type SeriesOption = Option & { slug: string; postCount: number }
type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'

export function PostEditorForm({ sourceId }: PostEditorFormProps) {
  const router = useRouter()
  const versionRef = useRef<string | undefined>()
  const operationRef = useRef(false)
  const saveInFlight = useRef(false)
  const conflictRef = useRef(false)
  const [postPublished, setPostPublished] = useState(false)
  const { resolvedTheme } = useTheme()
  const [draftId, setDraftId] = useState<string | null>(null)
  const [revisionPostId, setRevisionPostId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [seriesId, setSeriesId] = useState('')
  const [seriesOrder, setSeriesOrder] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [categories, setCategories] = useState<Option[]>([])
  const [existingTags, setExistingTags] = useState<Option[]>([])
  const [seriesOptions, setSeriesOptions] = useState<SeriesOption[]>([])
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [aiCoverStatus, setAiCoverStatus] = useState<CoverStatus | null>(CoverStatus.PENDING)
  const [aiSummaryStatus, setAiSummaryStatus] = useState<SummaryStatus>(SummaryStatus.PENDING)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [saveError, setSaveError] = useState('')
  const baselineRef = useRef('')

  const snapshot = useMemo(() => JSON.stringify({
    title, content, excerpt, categoryId, seriesId, seriesOrder, tags, coverImageUrl, aiCoverStatus,
  }), [title, content, excerpt, categoryId, seriesId, seriesOrder, tags, coverImageUrl, aiCoverStatus])
  const isDirty = Boolean(baselineRef.current && snapshot !== baselineRef.current)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [categoryRows, tagRows, seriesRows, document] = await Promise.all([
          getCategoriesForSelect(),
          getTagsForSelect(),
          getSeriesForSelect(),
          sourceId ? getEditorDocument(sourceId) : Promise.resolve(null),
        ])
        if (!active) return
        setCategories(categoryRows)
        setExistingTags(tagRows)
        setSeriesOptions(seriesRows as SeriesOption[])
        if (document) {
          versionRef.current = document.updatedAt
          conflictRef.current = false
          setPostPublished(document.postPublished)
          setDraftId(document.id)
          setRevisionPostId(document.postId)
          setTitle(document.title)
          setContent(document.content)
          setExcerpt(document.excerpt || '')
          setCategoryId(document.categoryId || '')
          setSeriesId(document.seriesId || '')
          setSeriesOrder(document.seriesOrder?.toString() || '')
          setTags(document.tags.map((tag) => tag.name))
          setCoverImageUrl(document.coverImageUrl)
          setAiCoverStatus((document.aiCoverStatus || CoverStatus.PENDING) as CoverStatus)
          baselineRef.current = JSON.stringify({
            title: document.title,
            content: document.content,
            excerpt: document.excerpt || '',
            categoryId: document.categoryId || '',
            seriesId: document.seriesId || '',
            seriesOrder: document.seriesOrder?.toString() || '',
            tags: document.tags.map((tag) => tag.name),
            coverImageUrl: document.coverImageUrl,
            aiCoverStatus: document.aiCoverStatus || CoverStatus.PENDING,
          })
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '编辑器加载失败')
        router.push('/admin/posts')
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [router, sourceId])

  useEffect(() => {
    document.title = `${sourceId ? '编辑文章' : '新建文章'} - 管理后台`
  }, [sourceId])

  useEffect(() => {
    if (conflictRef.current || !draftId || !isDirty || saving || publishing || !title.trim() || !content.trim()) return
    setSaveState('dirty')
    const timer = setTimeout(() => {
      void persist(false)
    }, 5000)
    return () => clearTimeout(timer)
  // persist intentionally reads the latest controlled state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId, isDirty, snapshot, saving, publishing])

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (baselineRef.current ? !isDirty : !(title || content)) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [content, isDirty, title])

  const payload = useCallback(() => ({
    title: title.trim(),
    content,
    excerpt: excerpt.trim() || null,
    categoryId: categoryId || null,
    seriesId: seriesId || null,
    seriesOrder: seriesId && seriesOrder ? Number(seriesOrder) : null,
    tags,
    readTime: Math.max(1, Math.ceil(content.length / 400)),
    coverImageUrl,
    aiCoverStatus,
  }), [aiCoverStatus, categoryId, content, coverImageUrl, excerpt, seriesId, seriesOrder, tags, title])

  const persist = async (notify = true) => {
    if (saveInFlight.current) return null
    if (!title.trim() || !content.trim()) {
      if (notify) toast.error('标题和正文不能为空')
      return null
    }
    setSaving(true)
    saveInFlight.current = true
    setSaveError('')
    setSaveState('saving')
    try {
      let id = draftId
      if (id) {
        // Accept background AI results already reflected locally, but never
        // unrelated edits or publication-state changes from another window.
        const remote = await getDraftSnapshot(id)
        if (!remote) throw new Error('草稿已发布或已删除，请刷新后重试')
        if (versionRef.current && remote.updatedAt !== versionRef.current && baselineRef.current) {
          const baseline = JSON.parse(baselineRef.current)
          const latest = {
            title: remote.title, content: remote.content, excerpt: remote.excerpt || '',
            categoryId: remote.categoryId || '', seriesId: remote.seriesId || '',
            seriesOrder: remote.seriesOrder?.toString() || '', tags: remote.tags.map((tag) => tag.name),
            coverImageUrl: remote.coverImageUrl, aiCoverStatus: remote.aiCoverStatus || CoverStatus.PENDING,
          }
          const current = JSON.parse(snapshot)
          if (canAdoptDraftVersion(baseline, current, latest, postPublished, remote.postPublished)) versionRef.current = remote.updatedAt
        }
        const result = await saveDraft(id, payload(), versionRef.current)
        versionRef.current = result.updatedAt
      } else {
        const result = await createDraft(payload())
        id = result.draftId
        versionRef.current = result.updatedAt
        setDraftId(id)
        router.replace(`/admin/posts/${id}/edit`)
      }
      baselineRef.current = snapshot
      conflictRef.current = false
      setSaveState('saved')
      if (notify) toast.success('草稿已保存')
      return id
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '保存失败')
      conflictRef.current = true
      setSaveState('error')
      if (notify) toast.error(error instanceof Error ? error.message : '保存失败')
      return null
    } finally {
      saveInFlight.current = false
      setSaving(false)
    }
  }

  const publish = async () => {
    if (operationRef.current || saveInFlight.current) return
    if (aiSummaryStatus === SummaryStatus.GENERATING) {
      toast.error('AI 摘要生成中，请稍后发布')
      return
    }
    operationRef.current = true
    setPublishing(true)
    try {
      const id = await persist(false)
      if (!id) return
      const result = await publishDraft(id, versionRef.current)
      baselineRef.current = snapshot
      toast.success(postPublished ? '文章更新已发布' : '文章已发布')
      router.push('/admin/posts')
      router.refresh()
      return result
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '发布失败')
    } finally {
      operationRef.current = false
      setPublishing(false)
    }
  }

  const withdraw = async () => {
    if (!revisionPostId || operationRef.current || saveInFlight.current) return
    operationRef.current = true
    setPublishing(true)
    try {
      // Preserve current edits before changing visibility.
      const id = await persist(false)
      if (!id) return
      await unpublishPost(revisionPostId)
      toast.success('已撤回，草稿内容已保留')
      router.push('/admin/drafts')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '撤回失败')
    } finally {
      operationRef.current = false
      setPublishing(false)
    }
  }

  const addTag = (name = tagInput) => {
    const normalized = name.trim()
    if (!normalized || tags.includes(normalized)) return
    if (tags.length >= 3) return toast.error('最多只能添加 3 个标签')
    setTags((value) => [...value, normalized])
    setTagInput('')
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-theme-accent-primary border-t-transparent" /></div>
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-theme-text-canvas">
            {postPublished ? '编辑已发布文章' : revisionPostId ? '编辑待发布文章' : sourceId ? '编辑草稿' : '新建文章'}
          </h1>
          <p className="mt-1 text-sm text-theme-text-secondary">
            {postPublished ? '当前修改保存在独立草稿中，发布前线上文章不会变化' : revisionPostId ? '文章已撤回，访客无法访问；再次发布将恢复原链接' : '先形成草稿实例，发布后才创建已发布文章'}
            {saveState === 'saving' && ' · 正在自动保存…'}
            {saveState === 'dirty' && ' · 有未保存修改'}
            {saveState === 'saved' && ' · 已保存'}
            {saveState === 'error' && ' · 自动保存失败'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {postPublished && <Button variant="outline" onClick={() => void withdraw()} disabled={saving || publishing}>撤回为待发布</Button>}
          <Button variant="outline" onClick={() => router.push(revisionPostId ? '/admin/posts' : '/admin/drafts')} disabled={saving || publishing}>取消</Button>
          <Button variant="outline" onClick={() => void persist()} disabled={saving || publishing}>{saving ? '保存中…' : '保存草稿'}</Button>
          <Button onClick={() => void publish()} disabled={saving || publishing}>{publishing ? '发布中…' : postPublished ? '发布更新' : revisionPostId ? '重新发布' : '发布'}</Button>
        </div>
      </div>

      {saveError && <p role="alert" className="rounded-xl border border-theme-border bg-theme-muted p-3 text-sm text-theme-error-primary">{saveError}。当前输入仍保留，请先复制未保存内容再刷新。</p>}
      <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="请输入文章标题…" className="rounded-xl px-4 py-3 text-lg font-medium" />

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-theme-text-secondary" />
          <Select value={categoryId || 'none'} onValueChange={(value) => setCategoryId(value === 'none' ? '' : value)}>
            <SelectTrigger className="h-9 w-[170px]"><SelectValue placeholder="选择分类" /></SelectTrigger>
            <SelectContent><SelectItem value="none">无分类</SelectItem>{categories.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <TagIcon className="h-4 w-4 shrink-0 text-theme-text-secondary" />
          <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md border border-theme-border bg-theme-surface px-3">
            {tags.map((tag) => <span key={tag} className="inline-flex shrink-0 items-center gap-1 rounded bg-theme-accent-bg px-2 py-0.5 text-xs text-theme-accent-primary">{tag}<button type="button" onClick={() => setTags((value) => value.filter((item) => item !== tag))}><X className="h-3 w-3" /></button></span>)}
            <input value={tagInput} onChange={(event) => setTagInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addTag() } }} disabled={tags.length >= 3} placeholder="输入标签…" className="min-w-[70px] flex-1 bg-transparent text-sm outline-none" />
          </div>
        </div>
      </div>

      {existingTags.length > 0 && <div className="flex flex-wrap items-center gap-2 pl-6"><span className="text-xs text-theme-text-tertiary">快速选择：</span>{existingTags.map((tag) => <button type="button" key={tag.id} onClick={() => tags.includes(tag.name) ? setTags((value) => value.filter((item) => item !== tag.name)) : addTag(tag.name)} className={`rounded px-2 py-1 text-xs ${tags.includes(tag.name) ? 'bg-theme-accent-primary text-white' : 'bg-theme-muted text-theme-text-secondary'}`}>{tag.name}</button>)}</div>}

      <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_440px]">
        <ContentEditor content={content} onChange={setContent} theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />
        <aside className="min-w-0 space-y-5">
          <section className="overflow-hidden rounded-2xl border-2 border-theme-text-canvas bg-theme-surface shadow-[4px_4px_0_0_hsl(var(--theme-primary)/0.18)]">
            <div className="flex items-center justify-between bg-theme-text-canvas px-4 py-3 text-theme-surface">
              <div className="flex items-center gap-2"><Layers3 className="h-4 w-4" /><span className="text-sm font-semibold">专题快捷设置</span></div>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] opacity-55">Optional</span>
            </div>
            <div className="space-y-4 p-4">
              <p className="text-xs leading-5 text-theme-text-secondary">适合写作时临时指定专题；批量收录与可视化排序请前往专题编排台。</p>
              <Select value={seriesId || 'none'} onValueChange={(value) => setSeriesId(value === 'none' ? '' : value)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="选择专题" /></SelectTrigger>
                <SelectContent><SelectItem value="none">不属于专题</SelectItem>{seriesOptions.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent>
              </Select>
              {seriesId && (
                <div>
                  <label htmlFor="series-order" className="mb-1.5 block text-xs font-medium text-theme-text-secondary">阅读顺序</label>
                  <Input id="series-order" type="number" min="1" value={seriesOrder} onChange={(event) => setSeriesOrder(event.target.value)} placeholder="例如：1" />
                </div>
              )}
              <Button asChild variant="outline" size="sm" className="w-full"><Link href="/admin/series">前往专题编排台</Link></Button>
            </div>
          </section>
          <CoverPreview postId={draftId} initialCoverUrl={coverImageUrl} initialStatus={aiCoverStatus} onCoverChange={setCoverImageUrl} onStatusChange={setAiCoverStatus} title={title} content={content} />
          <AISummaryEditor postId={draftId} initialSummary={excerpt} initialStatus={aiSummaryStatus} onSummaryChange={setExcerpt} onStatusChange={setAiSummaryStatus} title={title} content={content} />
          {!draftId && <p className="rounded-xl border border-theme-border bg-theme-muted p-3 text-xs text-theme-text-secondary">先保存草稿后可使用 AI 摘要与封面能力。</p>}
        </aside>
      </div>
    </div>
  )
}
