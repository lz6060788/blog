import { MilkdownPreview } from '@/components/editor/milkdown/milkdown-preview'

interface ArticleContentProps {
  content: string
}

export function ArticleContent({ content }: ArticleContentProps) {
  return <MilkdownPreview content={content} />
}
