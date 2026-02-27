'use client'

import { useState, useEffect } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2, FileText } from 'lucide-react'
import { getPosts, togglePostStatus, deletePost } from '@/lib/actions/posts'
import { toast } from 'react-hot-toast'

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic'

type FilterType = 'all' | 'published' | 'drafts'

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // 设置页面标题
  useEffect(() => {
    document.title = '文章管理 - 管理后台'
  }, [])

  // 加载文章数据
  useEffect(() => {
    async function loadPosts() {
      setIsLoading(true)
      try {
        const result = await getPosts({
          search: searchQuery || undefined,
          publishedOnly: filter === 'published' ? true : undefined,
          draftsOnly: filter === 'drafts' ? true : undefined,
          page: currentPage,
          pageSize: 20,
        })
        setPosts(result.data)
        setTotalPages(result.totalPages)
        setTotal(result.total)
      } catch (error) {
        console.error('加载文章失败:', error)
        toast.error('加载文章失败')
      } finally {
        setIsLoading(false)
      }
    }
    loadPosts()
  }, [currentPage, filter, searchQuery])

  // 重置页码当搜索或筛选变化时
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filter])

  // 切换发布状态
  const handleToggleStatus = async (postId: string) => {
    try {
      const result = await togglePostStatus(postId)
      // 重新加载数据
      const updated = await getPosts({
        search: searchQuery || undefined,
        publishedOnly: filter === 'published' ? true : undefined,
        draftsOnly: filter === 'drafts' ? true : undefined,
        page: currentPage,
        pageSize: 20,
      })
      setPosts(updated.data)
      toast.success(result.published ? '已发布' : '已转为草稿')
    } catch (error: any) {
      console.error('切换状态失败:', error)
      toast.error(error.message || '操作失败')
    }
  }

  // 删除文章
  const handleDelete = async (postId: string) => {
    if (!confirm('确定要删除这篇文章吗？此操作无法撤销。')) {
      return
    }

    try {
      await deletePost(postId)
      // 重新加载数据
      const updated = await getPosts({
        search: searchQuery || undefined,
        publishedOnly: filter === 'published' ? true : undefined,
        draftsOnly: filter === 'drafts' ? true : undefined,
        page: currentPage,
        pageSize: 20,
      })
      setPosts(updated.data)
      setTotalPages(updated.totalPages)
      setTotal(updated.total)
      toast.success('删除成功')
    } catch (error: any) {
      console.error('删除失败:', error)
      toast.error(error.message || '删除失败')
    }
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-theme-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-semibold text-theme-text-canvas">文章管理</h1>
          <p className="text-sm text-theme-text-secondary mt-1">
            管理您的博客文章（共 {total} 篇）
          </p>
        </div>
        <Link href="/admin/posts/new">
          <Button className="gap-2">
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            新建文章
          </Button>
        </Link>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-text-tertiary" strokeWidth={2} />
          <Input
            type="text"
            placeholder="搜索文章..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            全部
          </Button>
          <Button
            variant={filter === 'published' ? 'default' : 'outline'}
            onClick={() => setFilter('published')}
            size="sm"
          >
            已发布
          </Button>
          <Button
            variant={filter === 'drafts' ? 'default' : 'outline'}
            onClick={() => setFilter('drafts')}
            size="sm"
          >
            草稿
          </Button>
        </div>
      </motion.div>

      {/* Posts Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
        className="bg-theme-bg-surface border border-theme-border rounded-xl overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-b border-theme-border hover:bg-transparent">
              <TableHead className="text-theme-text-secondary font-medium">标题</TableHead>
              <TableHead className="text-theme-text-secondary font-medium">创建时间</TableHead>
              <TableHead className="text-theme-text-secondary font-medium">状态</TableHead>
              <TableHead className="text-theme-text-secondary font-medium text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-theme-bg-muted flex items-center justify-center">
                      <FileText className="w-5 h-5 text-theme-text-tertiary" />
                    </div>
                    <p className="text-theme-text-secondary">
                      {searchQuery ? '没有找到匹配的文章' : '还没有任何文章'}
                    </p>
                    {!searchQuery && (
                      <Link href="/admin/posts/new">
                        <Button size="sm" variant="outline">
                          创建第一篇文章
                        </Button>
                      </Link>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow
                  key={post.id}
                  className="border-b border-theme-border hover:bg-theme-bg-muted transition-colors"
                >
                  <TableCell className="font-medium text-theme-text-canvas">
                    {post.title}
                  </TableCell>
                  <TableCell className="text-theme-text-secondary">
                    {formatDate(post.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={post.published}
                        onCheckedChange={() => handleToggleStatus(post.id)}
                      />
                      <span className="text-xs text-theme-text-tertiary">
                        {post.published ? '已发布' : '草稿'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" strokeWidth={2} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-theme-bg-surface border-theme-border">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/posts/${post.id}/edit`} className="cursor-pointer">
                            <Edit className="w-4 h-4 mr-2" strokeWidth={2} />
                            编辑
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(post.id)}
                          className="text-theme-error-primary focus:text-theme-error-primary cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2" strokeWidth={2} />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-theme-text-secondary">
            第 {currentPage} / {totalPages} 页，共 {total} 篇文章
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              下一页
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
