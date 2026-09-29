'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FilePenLine, FileX, GitCompareArrows, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { deleteDraft, deletePendingArticle, getDrafts, publishDraft } from '@/server/actions/posts'

export const dynamic = 'force-dynamic'

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const result = await getDrafts({ pageSize: 100 })
      setDrafts(result.data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '加载草稿失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const publish = async (id: string, revision: boolean, updatedAt: string) => {
    try {
      await publishDraft(id, updatedAt)
      setDrafts((values) => values.filter((draft) => draft.id !== id))
      toast.success(revision ? '文章更新已发布' : '文章已发布')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '发布失败')
    }
  }

  const remove = async (draft: any) => {
    const id = draft.id
    const pending = draft.postId && !draft.postPublished
    if (!confirm(pending ? '确定删除整篇待发布文章吗？原文章记录和草稿都将删除。' : '确定删除这份草稿吗？已发布文章不会受到影响。')) return
    try {
      if (pending) await deletePendingArticle(id, draft.updatedAt)
      else await deleteDraft(id, draft.updatedAt)
      setDrafts((values) => values.filter((draft) => draft.id !== id))
      toast.success('草稿已删除')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-theme-accent-primary border-t-transparent" /></div>

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold text-theme-text-canvas">草稿箱</h1>
        <p className="mt-1 text-sm text-theme-text-secondary">待发布文章尚未公开；修订草稿只有发布后才会更新线上内容。</p>
      </motion.div>

      {!drafts.length ? (
        <div className="rounded-xl border border-theme-border bg-theme-surface p-12 text-center">
          <FileX className="mx-auto mb-4 h-8 w-8 text-theme-text-tertiary" />
          <h3 className="font-medium text-theme-text-canvas">草稿箱为空</h3>
          <p className="mt-1 text-sm text-theme-text-secondary">新建文章或编辑已发布文章后，草稿会出现在这里。</p>
          <Button asChild className="mt-5"><Link href="/admin/posts/new">新建文章</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((draft) => (
            <div key={draft.id} className="flex flex-col gap-4 rounded-xl border border-theme-border bg-theme-surface p-4 transition-colors hover:border-theme-accent-primary sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 gap-3">
                <div className="mt-0.5 rounded-lg bg-theme-muted p-2">
                  {draft.postId ? <GitCompareArrows className="h-4 w-4 text-theme-accent-primary" /> : <FilePenLine className="h-4 w-4 text-theme-accent-primary" />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-medium text-theme-text-canvas">{draft.title}</h3>
                    <Badge variant={draft.postId ? 'secondary' : 'outline'}>{draft.postPublished ? '文章修订 · 原文已发布' : draft.postId ? '待发布 · 已撤回' : '新文章 · 待发布'}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-theme-text-tertiary">最后修改：{new Date(draft.updatedAt).toLocaleString('zh-CN')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild size="sm" variant="outline"><Link href={`/admin/posts/${draft.id}/edit`}>编辑</Link></Button>
                <Button size="sm" onClick={() => void publish(draft.id, draft.postPublished, draft.updatedAt)}>{draft.postPublished ? '发布更新' : draft.postId ? '重新发布' : '发布'}</Button>
                <Button size="icon" variant="ghost" onClick={() => void remove(draft)} aria-label="删除草稿"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
