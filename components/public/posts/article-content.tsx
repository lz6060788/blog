import { MilkdownPreview } from '@/components/editor/milkdown'

interface ArticleContentProps {
  content: string
}

export function ArticleContent({ content }: ArticleContentProps) {
  return <MilkdownPreview content={content} />
}
