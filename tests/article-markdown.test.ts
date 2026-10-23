import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizeArticleMath, renderArticleMarkdown } from '../lib/article-markdown'
import { embedFence } from '../lib/article-embeds'

test('both dollar and LaTeX delimiters produce real SSR math, including MathML', async () => {
  const html = await renderArticleMarkdown(String.raw`行内 $x^2$ 与 \(\frac{a}{b}\)。

$$
E=mc^2
$$

\[
\sum_{i=1}^{n} i=\frac{n(n+1)}{2}
\]`)
  assert.equal((html.match(/class="katex"/g) || []).length, 4)
  assert.equal((html.match(/class="katex-display"/g) || []).length, 2)
  assert.equal((html.match(/<math xmlns=/g) || []).length, 4)
  assert.doesNotMatch(html, /katex-error/)
})

test('math fences render and malformed math stays readable without failing the article', async () => {
  const html = await renderArticleMarkdown('```math\n\\sqrt{x}\n```\n\n$\\frac{$\n\nAfter')
  assert.match(html, /class="katex-display"/)
  assert.match(html, /class="katex-error"/)
  assert.match(html, /<p>After<\/p>/)
})

test('delimiter compatibility preserves literal examples, dollar math, URLs, and embed sources', async () => {
  const source = [
    String.raw`\(x+1\)`,
    '`' + String.raw`\(literal\)` + '`',
    '```js\n' + String.raw`const example = "\(literal\)"` + '\n```',
    embedFence('html-preview', String.raw`<script>const text = "\(literal\)"</script>`),
    String.raw`<div>\(raw HTML\)</div>`,
    String.raw`[resource](https://example.com/\(literal\))`,
    String.raw`$\text{\(literal\)}$`,
    String.raw`\\(escaped\\)`,
  ].join('\n\n')
  const normalized = normalizeArticleMath(source)
  assert.equal(normalized, source.replace(String.raw`\(x+1\)`, '$x+1$'))
  const html = await renderArticleMarkdown(source)
  assert.match(html, /language-js/)
  assert.match(html, /sandbox="allow-scripts"/)
  assert.doesNotMatch(html.replace(/srcdoc="[^"]*"/g, ''), /<script>/)
})

test('article anchors are unique across repeated and naturally suffixed headings', async () => {
  const html = await renderArticleMarkdown('# Hello\n\n## Hello\n\n## Hello-2\n\n## Hello\n\n### 数学 $x^2$')
  const ids = Array.from(html.matchAll(/<h[1-6] id="([^"]*)"/g), (match) => match[1])
  assert.equal(ids.length, 5)
  assert.equal(new Set(ids).size, 5)
  assert.match(html, /data-outline-title="数学 x\^2"/)
})

test('full article rendering retains sandbox boundaries, media, tables, and internal references', async () => {
  const id = '11111111-1111-1111-1111-111111111111'
  const html = await renderArticleMarkdown([
    `[Other article](post:${id})`,
    '| Name | Value |\n| --- | --- |\n| first | $x$ |',
    embedFence('video', '/demo.mp4'),
    embedFence('html-preview', '<html><body><script>parent.document.body.remove()</script></body></html>'),
  ].join('\n\n'), { locale: 'zh', internalPosts: new Map([[id, { title: 'Other', excerpt: 'A reference', category: 'Notes', readTime: 2 }]]) })
  assert.match(html, new RegExp(`href="/zh/post/${id}"`))
  assert.match(html, /class="article-table-scroll"><table>/)
  assert.match(html, /<video src="\/demo.mp4" controls/)
  assert.match(html, /sandbox="allow-scripts"/)
  assert.doesNotMatch(html, /allow-same-origin/)
  assert.doesNotMatch(html.match(/srcdoc="([^"]*)"/)![1], /[<>]/)
})

test('untrusted KaTeX commands cannot produce active links or HTML', async () => {
  const html = await renderArticleMarkdown(String.raw`$\href{javascript:alert(1)}{click}$`)
  assert.doesNotMatch(html, /href="javascript:|<script|onclick=/)
})
