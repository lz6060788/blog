import assert from 'node:assert/strict'
import { test } from 'node:test'
import { articleReadingLength, calculateArticleReadTime } from '../lib/article-reading'
import { embedFence } from '../lib/article-embeds'

test('interactive sources do not inflate reading time; surrounding prose remains counted', () => {
  const prose = '书'.repeat(801)
  const largeEmbed = embedFence('html-preview', '<script>' + 'x'.repeat(40000) + '</script>')
  const article = prose + '\n\n' + largeEmbed + '\n\n结束'
  assert.equal(articleReadingLength(article), 803)
  assert.equal(calculateArticleReadTime(article), 3)
})

test('ordinary code examples remain readable while media URLs and raw HTML do not', () => {
  assert.equal(articleReadingLength('```html\n<div>code</div>\n```'), 15)
  assert.equal(articleReadingLength('前文\n\n<div>embedded</div>\n\n后文'), 4)
  for (const kind of ['video', 'audio', 'embed', 'html-url'] as const) {
    assert.equal(articleReadingLength(embedFence(kind, 'https://example.com/long-url')), 0)
  }
  assert.equal(calculateArticleReadTime(''), 1)
})

test('long Markdown fences preserve embedded shorter fences without swallowing later prose', () => {
  const content = embedFence('html-preview', '<pre>```js\nx\n```</pre>') + '\n\n后文'
  assert.equal(articleReadingLength(content), 2)
})
