'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createTag, updateTag } from '@/lib/actions/tags'
import { toast } from 'react-hot-toast'

// 生成 slug 辅助函数
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface TagFormProps {
  tag?: any
  onSave: () => void
  onCancel: () => void
}

export default function TagForm({ tag, onSave, onCancel }: TagFormProps) {
  const [name, setName] = useState(tag?.name || '')
  const [slug, setSlug] = useState(tag?.slug || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 当名称变化时自动生成 slug
  useEffect(() => {
    if (!tag && name) {
      setSlug(generateSlug(name))
    }
  }, [name, tag])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (tag) {
        await updateTag(tag.id, { name, slug })
        toast.success('标签更新成功')
      } else {
        await createTag({ name, slug })
        toast.success('标签创建成功')
      }
      onSave()
    } catch (error: any) {
      toast.error(error.message || '操作失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{tag ? '编辑标签' : '新建标签'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">名称 *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：React, TypeScript"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="react"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : tag ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
