'use client'

import { useEffect, useState } from 'react'
import { FileText, Link2, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { getInternalPostOptions } from '@/server/actions/posts'

interface InternalPostOption {
  id: string
  title: string
  excerpt: string
  category: string | null
}

export function InternalPostPicker({ onInsert }: { onInsert: (markdown: string) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [alias, setAlias] = useState('')
  const [selected, setSelected] = useState<InternalPostOption | null>(null)
  const [options, setOptions] = useState<InternalPostOption[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        setOptions(await getInternalPostOptions(query))
      } finally {
        setLoading(false)
      }
    }, query ? 180 : 0)
    return () => clearTimeout(timer)
  }, [open, query])

  const insert = () => {
    if (!selected) return
    const label = (alias || selected.title).replaceAll('[', '\\[').replaceAll(']', '\\]')
    onInsert(`[${label}](post:${selected.id})`)
    setOpen(false)
    setQuery('')
    setAlias('')
    setSelected(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2">
          <Link2 className="h-4 w-4" />
          引用站内文章
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>引用站内文章</DialogTitle>
          <DialogDescription>
            像 Obsidian 一样选择文章和显示别名；链接使用稳定文章 ID，标题改名后仍然有效。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-text-tertiary" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索已发布文章" className="pl-9" />
          </div>

          <div className="max-h-72 space-y-1 overflow-y-auto rounded-xl border border-theme-border p-2">
            {loading ? (
              <p className="py-8 text-center text-sm text-theme-text-tertiary">正在搜索…</p>
            ) : options.length ? options.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => { setSelected(post); setAlias(post.title) }}
                className={`flex w-full gap-3 rounded-lg p-3 text-left transition-colors ${selected?.id === post.id ? 'bg-theme-accent-bg' : 'hover:bg-theme-muted'}`}
              >
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-theme-accent-primary" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-theme-text-canvas">{post.title}</span>
                  <span className="mt-1 line-clamp-2 text-xs text-theme-text-secondary">{post.excerpt || '暂无简介'}</span>
                </span>
              </button>
            )) : (
              <p className="py-8 text-center text-sm text-theme-text-tertiary">没有匹配的已发布文章</p>
            )}
          </div>

          {selected && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-theme-text-canvas">链接显示文字</label>
              <Input value={alias} onChange={(event) => setAlias(event.target.value)} />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button type="button" onClick={insert} disabled={!selected || !alias.trim()}>插入引用</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
