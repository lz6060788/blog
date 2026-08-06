'use client'

import { useEffect, useState } from 'react'
import { Layers3, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { createSeries, deleteSeries, getSeriesForSelect, updateSeries } from '@/server/actions/series'

export const dynamic = 'force-dynamic'

export default function SeriesAdminPage() {
  const [items, setItems] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => setItems(await getSeriesForSelect())
  useEffect(() => { void load() }, [])

  const showForm = (item?: any) => {
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
      if (editing) await updateSeries(editing.id, { name, slug, description })
      else await createSeries({ name, slug, description })
      toast.success(editing ? '专题已更新' : '专题已创建')
      setOpen(false)
      await load()
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

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div><h1 className="text-2xl font-semibold text-theme-text-canvas">专题管理</h1><p className="mt-1 text-sm text-theme-text-secondary">将连续文章组织为有顺序的阅读路径。</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={() => showForm()}><Plus className="mr-2 h-4 w-4" />新建专题</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? '编辑专题' : '新建专题'}</DialogTitle><DialogDescription>slug 用于公开专题页面地址，留空时按名称自动生成。</DialogDescription></DialogHeader>
            <div className="space-y-4"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="专题名称" /><Input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="URL slug（可选）" /><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="专题简介" rows={4} className="w-full rounded-md border border-theme-border bg-theme-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-theme-accent-primary" /><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>取消</Button><Button onClick={() => void save()} disabled={saving}>{saving ? '保存中…' : '保存'}</Button></div></div>
          </DialogContent>
        </Dialog>
      </div>

      {!items.length ? <div className="rounded-xl border border-theme-border bg-theme-surface p-12 text-center"><Layers3 className="mx-auto mb-3 h-8 w-8 text-theme-text-tertiary" /><p className="text-sm text-theme-text-secondary">还没有专题</p></div> : <div className="grid gap-3 md:grid-cols-2">{items.map((item) => <div key={item.id} className="rounded-xl border border-theme-border bg-theme-surface p-5"><div className="flex items-start justify-between gap-4"><div><h2 className="font-medium text-theme-text-canvas">{item.name}</h2><p className="mt-1 text-xs text-theme-text-tertiary">/{item.slug} · {Number(item.postCount)} 篇已发布文章</p>{item.description && <p className="mt-3 text-sm text-theme-text-secondary">{item.description}</p>}</div><div className="flex"><Button size="icon" variant="ghost" onClick={() => showForm(item)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => void remove(item.id)}><Trash2 className="h-4 w-4" /></Button></div></div></div>)}</div>}
    </div>
  )
}
