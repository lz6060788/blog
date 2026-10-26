import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeKatex from 'rehype-katex'
import rehypePrism from 'rehype-prism-plus'
import rehypeStringify from 'rehype-stringify'
import { escapeSrcdocAttributes, remarkArticleEmbeds } from './article-embeds'
import { localizedPath } from './seo'

export interface ArticlePostReference {
  title: string
  excerpt: string
  category: string
  readTime: number
}

/** Support authoring tools that emit LaTeX delimiters without rewriting code,
 * existing dollar math, media, HTML documents, or link destinations. */
export function normalizeArticleMath(source: string): string {
  if (!/\\[([]/.test(source)) return source

  const protectedRanges: Array<[number, number]> = []
  const protectedTypes = new Set(['code', 'inlineCode', 'html', 'math', 'inlineMath', 'link', 'linkReference', 'image', 'imageReference', 'definition'])
  const collect = (node: any) => {
    if (protectedTypes.has(node.type) && node.position) {
      protectedRanges.push([node.position.start.offset, node.position.end.offset])
      return
    }
    node.children?.forEach(collect)
  }
  collect(unified().use(remarkParse).use(remarkMath).parse(source))
  protectedRanges.sort((a, b) => a[0] - b[0])

  const convert = (value: string) => value.replace(
    /(\\*)\\\(([\s\S]*?)(?<!\\)\\\)|(\\*)\\\[([\s\S]*?)(?<!\\)\\\]/g,
    (match, inlinePrefix: string | undefined, inline: string | undefined, blockPrefix: string | undefined, block: string | undefined) => {
      const prefix = inlinePrefix ?? blockPrefix ?? ''
      if (prefix.length % 2 !== 0) return match
      return inline !== undefined
        ? `${prefix}$${inline}$`
        : `${prefix}\n\n$$\n${block?.trim()}\n$$\n\n`
    },
  )

  let cursor = 0
  let normalized = ''
  for (const [start, end] of protectedRanges) {
    normalized += convert(source.slice(cursor, start)) + source.slice(start, end)
    cursor = end
  }
  return normalized + convert(source.slice(cursor))
}

const nodeText = (node: any): string => typeof node.value === 'string'
  ? node.value
  : (node.children || []).map(nodeText).join('')

const rehypeArticleEnhancements = (internalPosts: Map<string, ArticlePostReference>, locale: string) => () => (tree: any) => {
  const usedIds = new Set<string>()
  let headingIndex = 0
  const visit = (node: any) => {
    if (node.type === 'element') {
      node.properties ||= {}
      if (/^h[1-6]$/.test(node.tagName)) {
        headingIndex += 1
        const base = nodeText(node).trim().toLowerCase()
          .replace(/[^\u3400-\u9fffA-Za-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
          || `section-${headingIndex}`
        let id = base
        let suffix = 2
        while (usedIds.has(id)) id = `${base}-${suffix++}`
        usedIds.add(id)
        node.properties.id = id
        node.properties.tabIndex = -1
        node.properties.dataOutlineTitle = nodeText(node)
      }

      if (node.tagName === 'img') {
        node.properties.dataZoomable = 'true'
        node.properties.tabIndex = 0
        node.properties.role = 'button'
        node.properties.ariaLabel = node.properties.alt ? `放大图片：${node.properties.alt}` : '放大图片'
      }

      if (node.tagName === 'a' && typeof node.properties.href === 'string') {
        const match = node.properties.href.match(/^post:([0-9a-f-]{36})$/i)
        if (match) {
          const post = internalPosts.get(match[1])
          if (post) {
            Object.assign(node.properties, {
              href: localizedPath(locale, `/post/${match[1]}`),
              dataInternalPostId: match[1],
              dataInternalPostTitle: post.title,
              dataInternalPostExcerpt: post.excerpt,
              dataInternalPostCategory: post.category,
              dataInternalPostReadTime: post.readTime,
            })
          } else {
            node.properties.href = undefined
            node.properties.dataInternalPostMissing = 'true'
            node.properties.title = '引用的文章不存在或尚未发布'
          }
        }
      }
    }
    if (Array.isArray(node.children)) {
      node.children = node.children.map((child: any) => {
        visit(child)
        return child.type === 'element' && child.tagName === 'table'
          ? { type: 'element', tagName: 'div', properties: { className: ['article-table-scroll'] }, children: [child] }
          : child
      })
    }
  }
  visit(tree)
}

/** The same SSR pipeline serves published articles and the editor preview. */
export async function renderArticleMarkdown(content: string, options: {
  locale?: string
  internalPosts?: Map<string, ArticlePostReference>
} = {}): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkArticleEmbeds)
    .use(remarkRehype)
    // Read heading titles before KaTeX adds its visual and MathML copies.
    .use(rehypeArticleEnhancements(options.internalPosts || new Map(), options.locale || 'en'))
    .use(rehypeKatex, { trust: false, strict: 'ignore' })
    .use(rehypePrism, { ignoreMissing: true })
    .use(rehypeStringify)
    .process(normalizeArticleMath(content))
  return escapeSrcdocAttributes(String(file))
}
