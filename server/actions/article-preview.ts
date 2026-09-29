'use server'

import { auth } from '@/server/auth'
import { renderMarkdownToHtml } from '@/components/editor/milkdown/milkdown-preview'

export async function previewArticle(content: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')
  if (typeof content !== 'string' || content.length > 1_000_000) throw new Error('预览正文过大')
  return renderMarkdownToHtml(content)
}
