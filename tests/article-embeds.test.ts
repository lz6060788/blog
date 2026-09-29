import assert from 'node:assert/strict'
import { test } from 'node:test'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { embedFence, remarkArticleEmbeds, safeMediaUrl } from '../lib/article-embeds'

async function render(source: string) {
  return String(await unified().use(remarkParse).use(remarkArticleEmbeds).use(remarkRehype).use(rehypeStringify).process(source))
}

test('media controls and caption survive Markdown rendering', async () => {
  const html = await render('```video 演示视频\nhttps://example.com/demo.mp4\n```\n\n```audio\n/audio.mp3\n```')
  assert.match(html, /<video[^>]*controls[^>]*preload="metadata"/)
  assert.match(html, /aria-label="演示视频"/)
  assert.match(html, /<audio src="\/audio.mp3"/)
})

test('HTML renders only inside an opaque-origin sandbox; ordinary html examples stay code', async () => {
  const source = '<style>body{background:red}</style><script>parent.document.body.remove()</script><h1>演示</h1>'
  const html = await render(embedFence('html-preview', source))
  assert.match(html, /<iframe/)
  assert.match(html, /sandbox="allow-scripts"/)
  assert.doesNotMatch(html.replace(/srcdoc="[^"]*"/, ''), /allow-same-origin|<script>|<style>/)
  assert.match(html, /Content-Security-Policy/)
  const example = await render('```html\n<h1>example</h1>\n```')
  assert.match(example, /<pre><code class="language-html">/)
  assert.doesNotMatch(example, /<iframe/)
  assert.match(await render('<div>legacy HTML</div>'), /<iframe/)
})

test('hostile media URLs are rejected and embed quotes stay escaped', async () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,test', '//evil.test', '/\\evil.test', 'https://user:pass@evil.test', 'http://example.com/x', 'https:\n//evil.test']) {
    assert.equal(safeMediaUrl(url), null, url)
  }
  const html = await render(embedFence('embed', 'https://example.com/"onload="alert(1)'))
  assert.doesNotMatch(html, /" onload=/)
  assert.match(await render(embedFence('video', 'javascript:alert(1)')), /无法展示/)
})

test('embedded backticks round-trip as one block', async () => {
  const source = '<pre>```js\nconst x = 1\n```</pre>'
  const tree = unified().use(remarkParse).parse(embedFence('html-preview', source))
  assert.equal(tree.children.length, 1)
  assert.equal((tree.children[0] as any).value, source)
})
