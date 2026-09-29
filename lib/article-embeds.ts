/** Portable Markdown blocks. Ordinary `html` fences remain code examples. */
export function safeMediaUrl(value: string): string | null {
  const url = value.trim()
  if (!url || /[\u0000-\u0020\\]/.test(url)) return null
  if (url.startsWith('/') && !url.startsWith('//')) return url
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password ? url : null
  } catch { return null }
}

export function htmlDocument(source: string) {
  const policy = "default-src 'none'; script-src 'unsafe-inline' https:; style-src 'unsafe-inline' https:; img-src https: data:; media-src https:; font-src https: data:; frame-src https:; connect-src 'none'; form-action 'none'; base-uri 'none'"
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="${policy}"><style>body{margin:16px;font-family:system-ui,sans-serif;overflow-wrap:anywhere}img,video,svg{max-width:100%}</style></head><body>${source}</body></html>`
}

export function embedFence(kind: 'video' | 'audio' | 'html-preview' | 'embed', source: string) {
  const longest = Math.max(2, ...Array.from(source.matchAll(/`+/g), (match) => match[0].length))
  const fence = '`'.repeat(longest + 1)
  return `${fence}${kind}\n${source.trim()}\n${fence}`
}

/** Build HAST via remark data, never insert unsanitized HTML in the parent page. */
export function remarkArticleEmbeds() {
  return (tree: any) => {
    const visit = (parent: any) => {
      if (!Array.isArray(parent.children)) return
      parent.children = parent.children.map((node: any) => {
        const kind = node.type === 'code' ? node.lang : node.type === 'html' && parent.type === 'root' ? 'html-preview' : null
        if (!['video', 'audio', 'html-preview', 'embed'].includes(kind)) {
          visit(node)
          return node
        }
        const title = node.meta?.trim() || (kind === 'html-preview' || kind === 'embed' ? 'HTML 内容' : kind === 'video' ? '视频' : '音频')
        let properties: Record<string, unknown>
        if (kind === 'html-preview') {
          properties = { srcDoc: htmlDocument(node.value), sandbox: 'allow-scripts', title, loading: 'lazy', referrerPolicy: 'no-referrer', className: ['article-html-embed'], style: 'width:100%;height:520px;border:1px solid #8884;border-radius:12px;background:white' }
        } else {
          const src = safeMediaUrl(node.value)
          if (!src) return { type: 'paragraph', children: [{ type: 'text', value: `无法展示${title}：请使用 HTTPS 或站内绝对路径。` }] }
          properties = kind === 'embed'
            ? { src, sandbox: 'allow-scripts', title, loading: 'lazy', referrerPolicy: 'no-referrer', style: 'width:100%;height:520px;border:1px solid #8884;border-radius:12px;background:white' }
            : { src, controls: true, preload: 'metadata', playsInline: true, ariaLabel: title, style: 'display:block;width:100%;max-height:75vh;border-radius:12px' }
        }
        return { type: 'paragraph', data: { hName: kind === 'video' || kind === 'audio' ? kind : 'iframe', hProperties: properties }, children: [] }
      })
    }
    visit(tree)
  }
}
