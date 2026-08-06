import { MilkdownPreview } from '@/components/editor/milkdown/milkdown-preview'
import { InternalPostPreviewScope } from './internal-post-preview-scope'

interface ArticleContentProps {
  content: string
}

export function ArticleContent({ content }: ArticleContentProps) {
  return <InternalPostPreviewScope><MilkdownPreview content={content} /></InternalPostPreviewScope>
}
