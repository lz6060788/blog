'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Edit, FileText, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { ArticleCover } from '@/components/article'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { deletePost, getPosts, unpublishPost } from '@/server/actions/posts'

export const dynamic = 'force-dynamic'

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const result = await getPosts({ publishedOnly: true, search, pageSize: 100 })
        setPosts(result.data)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '加载文章失败')
      } finally {
        setLoading(false)
      }
    }, search ? 220 : 0)
    return () => clearTimeout(timer)
  }, [search])

  const withdraw = async (id: string) => {
    if (busy) return
    setBusy(id)
    try {
      await unpublishPost(id)
      setPosts((values) => values.filter((post) => post.id !== id))
      toast.success('已撤回为待发布，可在草稿箱继续编辑；已有修订内容已保留')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '撤回失败')
    } finally { setBusy(null) }
  }

  const remove = async (id: string) => {
    if (!confirm('确定删除这篇已发布文章吗？关联的修订草稿也会删除。')) return
    try {
      await deletePost(id)
      setPosts((values) => values.filter((post) => post.id !== id))
      toast.success('文章已删除')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-theme-text-canvas">已发布文章</h1>
          <p className="mt-1 text-sm text-theme-text-secondary">编辑时会生成独立修订草稿，线上内容只在再次发布后更新。</p>
        </div>
        <Button asChild><Link href="/admin/posts/new"><Plus className="mr-2 h-4 w-4" />新建文章</Link></Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-text-tertiary" />
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索已发布文章" className="pl-9" />
      </div>

      <div className="overflow-hidden rounded-xl border border-theme-border bg-theme-surface">
        <Table>
          <TableHeader><TableRow><TableHead className="w-28">封面</TableHead><TableHead>文章</TableHead><TableHead>分类 / 专题</TableHead><TableHead>发布时间</TableHead><TableHead className="w-16" /></TableRow></TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="h-40 text-center text-theme-text-tertiary">正在加载…</TableCell></TableRow>
            ) : !posts.length ? (
              <TableRow><TableCell colSpan={5} className="h-40 text-center"><FileText className="mx-auto mb-2 h-6 w-6 text-theme-text-tertiary" /><span className="text-sm text-theme-text-secondary">暂无已发布文章</span></TableCell></TableRow>
            ) : posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell><ArticleCover src={post.coverImageUrl} alt={post.title} width={160} height={90} lazy placeholderVariant="icon" /></TableCell>
                <TableCell>
                  <Link href={`/admin/posts/${post.id}/edit`} className="font-medium text-theme-text-canvas hover:text-theme-accent-primary">{post.title}</Link>
                  <div className="mt-2 flex flex-wrap gap-1">{post.hasDraft && <Badge>有修订草稿</Badge>}{post.tags?.map((tag: any) => <Badge key={tag.id} variant="outline">{tag.name}</Badge>)}</div>
                </TableCell>
                <TableCell><div className="space-y-1 text-sm"><p>{post.category?.name || '未分类'}</p>{post.series && <p className="text-theme-text-secondary">专题：{post.series.name}{post.seriesOrder ? ` · ${post.seriesOrder}` : ''}</p>}</div></TableCell>
                <TableCell className="text-sm text-theme-text-secondary">{post.publishedDate ? new Date(post.publishedDate).toLocaleDateString('zh-CN') : '—'}</TableCell>
                <TableCell>
                  <DropdownMenu><DropdownMenuTrigger asChild><Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem asChild><Link href={`/admin/posts/${post.id}/edit`}><Edit className="mr-2 h-4 w-4" />编辑</Link></DropdownMenuItem><DropdownMenuItem disabled={Boolean(busy)} onClick={() => void withdraw(post.id)}>撤回为待发布</DropdownMenuItem><DropdownMenuItem disabled={Boolean(busy)} onClick={() => void remove(post.id)} className="text-theme-error-primary"><Trash2 className="mr-2 h-4 w-4" />删除</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
