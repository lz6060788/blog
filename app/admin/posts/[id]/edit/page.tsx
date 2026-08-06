'use client'

import { useParams } from 'next/navigation'

import { PostEditorForm } from '@/components/admin/posts/post-editor-form'

export const dynamic = 'force-dynamic'

export default function EditPostPage() {
  const params = useParams()
  return <PostEditorForm sourceId={params.id as string} />
}
