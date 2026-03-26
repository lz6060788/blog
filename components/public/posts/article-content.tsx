import { MilkdownPreview } from '@/components/editor/milkdown'

interface ArticleContentProps {
  content: string
}

export function ArticleContent({ content }: ArticleContentProps) {
  return (
    <div className="milkdown-preview-wrapper">
      <MilkdownPreview content={content} />
    </div>
  )
}
