import { unified } from 'unified'
import remarkParse from 'remark-parse'

const parser = unified().use(remarkParse)
const embeds = new Set(['html-preview', 'html-url', 'embed', 'video', 'audio'])

/** Count readable prose/code, not executable embed source or media addresses. */
export function articleReadingLength(content: string): number {
  const count = (node: any): number => {
    if (node.type === 'html' || (node.type === 'code' && embeds.has(node.lang))) return 0
    if (typeof node.value === 'string') return node.value.length
    if (node.type === 'image') return (node.alt || '').length
    return Array.isArray(node.children) ? node.children.reduce((sum: number, child: any) => sum + count(child), 0) : 0
  }
  return count(parser.parse(content))
}

export function calculateArticleReadTime(content: string): number {
  return Math.max(1, Math.ceil(articleReadingLength(content) / 400))
}
