'use client'

import { useEffect, useMemo, useState, type DragEvent } from 'react'
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  GripVertical,
  Layers3,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  createSeries,
  deleteSeries,
  getSeriesManagementData,
  replaceSeriesPosts,
  updateSeries,
} from '@/server/actions/series'

export const dynamic = 'force-dynamic'

type SeriesItem = {
  id: string
  name: string
  slug: string
  description: string | null
  postCount: number
}

type SeriesPost = {
  id: string
  title: string
  excerpt: string | null
  coverImageUrl: string | null
  publishedDate: string | null
  categoryName: string | null
  seriesId: string | null
  seriesOrder: number | null
  seriesName: string | null
}

function formatDate(value: string | null) {
  if (!value) return '未记录日期'
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value))
}

export default function SeriesAdminPage() {
  const [items, setItems] = useState<SeriesItem[]>([])
  const [posts, setPosts] = useState<SeriesPost[]>([])
  const [selectedSeriesId, setSelectedSeriesId] = useState('')
  const [orderedPostIds, setOrderedPostIds] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [draggedPostId, setDraggedPostId] = useState<string | null>(null)
  const [dragOverPostId, setDragOverPostId] = useState<string | null>(null)
  const [editing, setEditing] = useState<SeriesItem | null>(null)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [savingPosts, setSavingPosts] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async (preferredSeriesId?: string) => {
    const data = await getSeriesManagementData()
    const nextItems = data.series.map((item) => ({ ...item, postCount: Number(item.postCount) })) as SeriesItem[]
    setItems(nextItems)
    setPosts(data.posts as SeriesPost[])
    setSelectedSeriesId((current) => {
      const nextId = preferredSeriesId || current
      return nextItems.some((item) => item.id === nextId) ? nextId : nextItems[0]?.id || ''
    })
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const selectedSeries = items.find((item) => item.id === selectedSeriesId) || null
  const persistedPostIds = useMemo(
    () => posts
      .filter((post) => post.seriesId === selectedSeriesId)
      .sort((a, b) => (a.seriesOrder ?? Number.MAX_SAFE_INTEGER) - (b.seriesOrder ?? Number.MAX_SAFE_INTEGER))
      .map((post) => post.id),
    [posts, selectedSeriesId],
  )

  useEffect(() => {
    setOrderedPostIds(persistedPostIds)
    setQuery('')
  }, [persistedPostIds])

  const postMap = useMemo(() => new Map(posts.map((post) => [post.id, post])), [posts])
  const selectedPosts = orderedPostIds.map((id) => postMap.get(id)).filter((post): post is SeriesPost => Boolean(post))
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const availablePosts = posts.filter((post) => {
    if (orderedPostIds.includes(post.id)) return false
    if (!normalizedQuery) return true
    return [post.title, post.excerpt, post.categoryName, post.seriesName]
      .filter(Boolean)
      .some((value) => value!.toLocaleLowerCase().includes(normalizedQuery))
  })
  const hasCollectionChanges = JSON.stringify(orderedPostIds) !== JSON.stringify(persistedPostIds)

  const showForm = (item?: SeriesItem) => {
    setEditing(item || null)
    setName(item?.name || '')
    setSlug(item?.slug || '')
    setDescription(item?.description || '')
    setOpen(true)
  }

  const save = async () => {
    if (!name.trim()) return toast.error('请输入专题名称')
    setSaving(true)
    try {
      const result = editing
        ? await updateSeries(editing.id, { name, slug, description })
        : await createSeries({ name, slug, description })
      toast.success(editing ? '专题已更新' : '专题已创建')
      setOpen(false)
      await load(result.id)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('删除专题后，文章会保留但不再属于该专题。确定继续吗？')) return
    try {
      await deleteSeries(id)
      await load()
      toast.success('专题已删除')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  const addPost = (postId: string) => {
    setOrderedPostIds((value) => [...value, postId])
  }

  const removePost = (postId: string) => {
    setOrderedPostIds((value) => value.filter((id) => id !== postId))
  }

  const movePost = (postId: string, direction: -1 | 1) => {
    setOrderedPostIds((value) => {
      const from = value.indexOf(postId)
      const to = from + direction
      if (from < 0 || to < 0 || to >= value.length) return value
      const next = [...value]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  const dropPost = (targetPostId: string) => {
    if (!draggedPostId || draggedPostId === targetPostId) return
    setOrderedPostIds((value) => {
      const from = value.indexOf(draggedPostId)
      const to = value.indexOf(targetPostId)
      if (from < 0 || to < 0) return value
      const next = [...value]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
    setDraggedPostId(null)
    setDragOverPostId(null)
  }

  const saveCollection = async () => {
    if (!selectedSeries) return
    setSavingPosts(true)
    try {
      await replaceSeriesPosts(selectedSeries.id, orderedPostIds)
      await load(selectedSeries.id)
      toast.success('专题收录与顺序已更新')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '收录保存失败')
    } finally {
      setSavingPosts(false)
    }
  }

  const handleDragOver = (event: DragEvent<HTMLElement>, postId: string) => {
    event.preventDefault()
    setDragOverPostId(postId)
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-theme-text-canvas px-3 py-1.5 text-xs font-semibold text-theme-surface">
            <BookOpen className="h-3.5 w-3.5" />内容策展
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-theme-text-canvas">专题编排台</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-theme-text-secondary">在这里集中完成文章收录、跨专题移动与阅读顺序编排；文章编辑器仅保留快捷入口。</p>
        </div>
        <Button onClick={() => showForm()} className="shadow-[4px_4px_0_0_hsl(var(--theme-primary)/0.24)]">
          <Plus className="mr-1 h-4 w-4" />新建专题
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? '编辑专题' : '新建专题'}</DialogTitle>
            <DialogDescription>slug 用于公开专题页面地址，建议使用简短的英文短语。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="专题名称" />
            <Input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="URL slug（可选）" />
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="专题简介" rows={4} className="w-full rounded-xl border border-theme-border bg-theme-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-theme-accent-primary" />
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>取消</Button><Button onClick={() => void save()} disabled={saving}>{saving ? '保存中…' : '保存'}</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="grid min-h-[34rem] place-items-center rounded-3xl border-2 border-theme-border bg-theme-surface"><div className="h-8 w-8 animate-spin rounded-full border-2 border-theme-accent-primary border-t-transparent" /></div>
      ) : !items.length ? (
        <div className="rounded-3xl border-2 border-dashed border-theme-border-strong bg-theme-surface p-16 text-center">
          <Layers3 className="mx-auto mb-4 h-10 w-10 text-theme-text-tertiary" />
          <h2 className="text-lg font-semibold text-theme-text-canvas">先建立第一个专题</h2>
          <p className="mt-2 text-sm text-theme-text-secondary">专题创建后，可以直接从全部已发布文章中完成收录与排序。</p>
        </div>
      ) : (
        <div className="grid min-h-[38rem] overflow-hidden rounded-3xl border-2 border-theme-text-canvas bg-theme-surface shadow-[8px_8px_0_0_hsl(var(--theme-primary)/0.2)] xl:grid-cols-[19rem_minmax(0,1fr)]">
          <aside className="border-b-2 border-theme-text-canvas bg-theme-text-canvas p-4 text-theme-surface xl:border-b-0 xl:border-r-2">
            <div className="flex items-end justify-between border-b border-theme-surface/20 px-2 pb-4">
              <div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-theme-surface/55">Series library</p><p className="mt-1 text-lg font-semibold">{items.length} 个专题</p></div>
              <Layers3 className="h-6 w-6 opacity-50" />
            </div>
            <div className="mt-3 space-y-2">
              {items.map((item, index) => {
                const active = item.id === selectedSeriesId
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setSelectedSeriesId(item.id)}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition-all ${active ? 'border-theme-accent-primary bg-theme-surface text-theme-text-canvas shadow-[4px_4px_0_0_hsl(var(--theme-primary))]' : 'border-theme-surface/15 text-theme-surface/75 hover:border-theme-surface/40 hover:bg-theme-surface/10'}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`font-mono text-xs ${active ? 'text-theme-accent-primary' : 'text-theme-surface/40'}`}>{String(index + 1).padStart(2, '0')}</span>
                      <div className="min-w-0"><p className="truncate font-semibold">{item.name}</p><p className={`mt-1 text-xs ${active ? 'text-theme-text-secondary' : 'text-theme-surface/45'}`}>{item.postCount} 篇已发布文章</p></div>
                    </div>
                  </button>
                )
              })}
            </div>
          </aside>

          {selectedSeries && (
            <section className="min-w-0 p-4 sm:p-6 xl:p-8">
              <div className="flex flex-col gap-5 border-b-2 border-theme-text-canvas pb-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-theme-accent-primary">Curating now</p>
                  <h2 className="mt-2 break-words text-3xl font-semibold tracking-tight text-theme-text-canvas">{selectedSeries.name}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-theme-text-secondary">{selectedSeries.description || '尚未填写专题简介。'}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline"><a href={`/zh/series/${selectedSeries.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" />预览</a></Button>
                  <Button size="sm" variant="outline" onClick={() => showForm(selectedSeries)}><Pencil className="h-4 w-4" />编辑</Button>
                  <Button size="sm" variant="ghost" onClick={() => void remove(selectedSeries.id)} className="text-theme-error-primary"><Trash2 className="h-4 w-4" />删除</Button>
                </div>
              </div>

              <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(18rem,0.85fr)_minmax(22rem,1.15fr)]">
                <div className="rounded-2xl border border-theme-border bg-theme-surface-alt/55 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div><h3 className="font-semibold text-theme-text-canvas">待收录文章</h3><p className="mt-1 text-xs text-theme-text-tertiary">点击添加；已有专题的文章将被移动。</p></div>
                    <span className="rounded-full bg-theme-surface px-2.5 py-1 font-mono text-xs text-theme-text-secondary">{availablePosts.length}</span>
                  </div>
                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-text-tertiary" />
                    <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题、分类或专题…" className="bg-theme-surface pl-9" />
                  </div>
                  <div className="mt-3 max-h-[34rem] space-y-2 overflow-y-auto pr-1">
                    {availablePosts.map((post) => (
                      <article key={post.id} className="group flex gap-3 rounded-xl border border-theme-border bg-theme-surface p-3 transition-colors hover:border-theme-border-strong">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-theme-muted" style={post.coverImageUrl ? { backgroundImage: `url(${post.coverImageUrl})`, backgroundPosition: 'center', backgroundSize: 'cover' } : undefined} />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-medium leading-5 text-theme-text-canvas">{post.title}</p>
                          <div className="mt-1 flex flex-wrap gap-x-2 text-[11px] text-theme-text-tertiary"><span>{post.categoryName || '未分类'}</span><span>{formatDate(post.publishedDate)}</span></div>
                          {post.seriesId && <p className="mt-1 text-[11px] font-medium text-theme-warning-text">{post.seriesId === selectedSeries.id ? '刚从本专题移除' : `将从“${post.seriesName}”移入`}</p>}
                        </div>
                        <button type="button" onClick={() => addPost(post.id)} aria-label={`收录 ${post.title}`} className="flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-full bg-theme-text-canvas text-theme-surface transition-transform hover:scale-105"><ArrowRight className="h-4 w-4" /></button>
                      </article>
                    ))}
                    {!availablePosts.length && <div className="rounded-xl border border-dashed border-theme-border p-8 text-center text-sm text-theme-text-tertiary">没有匹配的待收录文章</div>}
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-theme-text-canvas bg-theme-surface p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div><h3 className="font-semibold text-theme-text-canvas">已收录 · 阅读顺序</h3><p className="mt-1 text-xs text-theme-text-tertiary">拖拽卡片，或使用上下按钮调整顺序。</p></div>
                    <Button onClick={() => void saveCollection()} disabled={!hasCollectionChanges || savingPosts} size="sm">{savingPosts ? '保存中…' : hasCollectionChanges ? '保存编排' : '编排已同步'}</Button>
                  </div>
                  <div className="mt-4 max-h-[34rem] space-y-2 overflow-y-auto pr-1">
                    {selectedPosts.map((post, index) => (
                      <article
                        key={post.id}
                        draggable
                        onDragStart={() => setDraggedPostId(post.id)}
                        onDragEnd={() => { setDraggedPostId(null); setDragOverPostId(null) }}
                        onDragOver={(event) => handleDragOver(event, post.id)}
                        onDrop={() => dropPost(post.id)}
                        className={`grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border p-3 transition-all ${dragOverPostId === post.id ? 'border-theme-accent-primary bg-theme-accent-bg' : 'border-theme-border bg-theme-surface-alt/45'} ${draggedPostId === post.id ? 'opacity-45' : ''}`}
                      >
                        <div className="flex h-11 w-11 cursor-grab items-center justify-center rounded-lg bg-theme-text-canvas font-mono text-sm font-semibold text-theme-surface active:cursor-grabbing"><GripVertical className="mr-0.5 h-3.5 w-3.5 opacity-50" />{String(index + 1).padStart(2, '0')}</div>
                        <div className="min-w-0"><p className="truncate text-sm font-semibold text-theme-text-canvas">{post.title}</p><p className="mt-1 truncate text-[11px] text-theme-text-tertiary">{post.categoryName || '未分类'} · {formatDate(post.publishedDate)}</p></div>
                        <div className="flex items-center">
                          <button type="button" onClick={() => movePost(post.id, -1)} disabled={index === 0} aria-label="上移" className="rounded-md p-1.5 text-theme-text-secondary hover:bg-theme-surface disabled:opacity-25"><ChevronUp className="h-4 w-4" /></button>
                          <button type="button" onClick={() => movePost(post.id, 1)} disabled={index === selectedPosts.length - 1} aria-label="下移" className="rounded-md p-1.5 text-theme-text-secondary hover:bg-theme-surface disabled:opacity-25"><ChevronDown className="h-4 w-4" /></button>
                          <button type="button" onClick={() => removePost(post.id)} aria-label={`移除 ${post.title}`} className="rounded-md p-1.5 text-theme-text-tertiary hover:bg-theme-error-bg hover:text-theme-error-primary"><X className="h-4 w-4" /></button>
                        </div>
                      </article>
                    ))}
                    {!selectedPosts.length && <div className="grid min-h-48 place-items-center rounded-xl border-2 border-dashed border-theme-border p-8 text-center"><div><Layers3 className="mx-auto h-7 w-7 text-theme-text-tertiary" /><p className="mt-3 text-sm font-medium text-theme-text-secondary">尚未收录文章</p><p className="mt-1 text-xs text-theme-text-tertiary">从左侧选择文章建立阅读路径。</p></div></div>}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
