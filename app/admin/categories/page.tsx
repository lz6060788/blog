'use client'

import { useState, useEffect } from 'react'
import { FolderOpen, Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getCategories, deleteCategory } from '@/server/actions/categories'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import CategoryForm from '@/components/admin/category-form'
import { Dialog } from '@/components/ui/dialog'

export const dynamic = 'force-dynamic'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)

  // 设置页面标题
  useEffect(() => {
    document.title = '分类管理 - 管理后台'
  }, [])

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    setIsLoading(true)
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (error) {
      toast.error('加载分类失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个分类吗？')) return
    try {
      await deleteCategory(id)
      toast.success('删除成功')
      loadCategories()
    } catch (error: any) {
      toast.error(error.message || '删除失败')
    }
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setShowDialog(true)
  }

  const handleCreate = () => {
    setEditingCategory(null)
    setShowDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setEditingCategory(null)
  }

  const handleSaved = () => {
    loadCategories()
    handleCloseDialog()
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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-semibold text-theme-text-canvas">分类管理</h1>
          <p className="text-sm text-theme-text-secondary mt-1">
            管理文章分类（共 {categories.length} 个）
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          新建分类
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-theme-bg-surface border border-theme-border rounded-xl overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-b border-theme-border hover:bg-transparent">
              <TableHead className="text-theme-text-secondary font-medium">名称</TableHead>
              <TableHead className="text-theme-text-secondary font-medium">Slug</TableHead>
              <TableHead className="text-theme-text-secondary font-medium">描述</TableHead>
              <TableHead className="text-theme-text-secondary font-medium text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <FolderOpen className="w-12 h-12 text-theme-text-tertiary" />
                    <p className="text-theme-text-secondary">还没有任何分类</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow
                  key={category.id}
                  className="border-b border-theme-border hover:bg-theme-bg-muted"
                >
                  <TableCell className="font-medium text-theme-text-canvas">{category.name}</TableCell>
                  <TableCell className="text-theme-text-secondary">{category.slug}</TableCell>
                  <TableCell className="text-theme-text-tertiary">{category.description || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category.id)}
                        className="text-theme-error-primary"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {showDialog && (
        <CategoryForm category={editingCategory} onSave={handleSaved} onCancel={handleCloseDialog} />
      )}
    </div>
  )
}
