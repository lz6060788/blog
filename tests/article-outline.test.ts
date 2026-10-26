import assert from 'node:assert/strict'
import { test } from 'node:test'
import { measureArticleOutline } from '../lib/article-outline'

function heading(id: string, top: number, options: { connected?: boolean; visible?: boolean } = {}) {
  return {
    id,
    tagName: 'H2',
    dataset: { outlineTitle: id },
    textContent: id,
    isConnected: options.connected ?? true,
    getClientRects: () => options.visible === false ? [] : [{}],
    getBoundingClientRect: () => ({ top }),
  }
}

function article(elements: ReturnType<typeof heading>[]) {
  return { querySelectorAll: () => elements } as unknown as ParentNode
}

test('the introduction selects the first section, never the final section', () => {
  const measured = measureArticleOutline(article([heading('first', 700), heading('middle', 2400), heading('last', 5000)]))
  assert.equal(measured.activeId, 'first')
  assert.deepEqual(measured.headings.map((item) => item.id), ['first', 'middle', 'last'])
})

test('the active section follows the viewport in both scroll directions', () => {
  const positions = [-1400, 96, 1800]
  const root = article(['first', 'middle', 'last'].map((id, index) => ({
    ...heading(id, 0),
    getBoundingClientRect: () => ({ top: positions[index] }),
  })))
  assert.equal(measureArticleOutline(root).activeId, 'middle')
  positions[2] = 128
  assert.equal(measureArticleOutline(root).activeId, 'last')
  positions[1] = 400
  positions[2] = 2200
  assert.equal(measureArticleOutline(root).activeId, 'first')
})

test('replacing rendered headings with the same IDs refreshes their positions', () => {
  const oldNodes = [heading('first', -5000), heading('last', 96)]
  let liveNodes = oldNodes
  const root = { querySelectorAll: () => liveNodes } as unknown as ParentNode
  assert.equal(measureArticleOutline(root).activeId, 'last')

  // Removed DOM nodes report a zero rectangle. A cached NodeList would select
  // the last section even though the newly rendered introduction is visible.
  for (const node of oldNodes) {
    node.isConnected = false
    node.getBoundingClientRect = () => ({ top: 0 })
  }
  liveNodes = [heading('first', 700), heading('last', 5000)]
  assert.equal(measureArticleOutline(root).activeId, 'first')
})

test('detached and unrendered headings cannot become the active section', () => {
  const measured = measureArticleOutline(article([
    heading('first', 600),
    heading('hidden', 0, { visible: false }),
    heading('detached', 0, { connected: false }),
  ]))
  assert.equal(measured.activeId, 'first')
  assert.deepEqual(measured.headings.map((item) => item.id), ['first'])
})

test('temporarily absent content clears stale sections and recovers on render', () => {
  let liveNodes = [heading('old', 96)]
  const root = { querySelectorAll: () => liveNodes } as unknown as ParentNode
  assert.equal(measureArticleOutline(root).activeId, 'old')
  liveNodes = []
  assert.deepEqual(measureArticleOutline(root), { headings: [], activeId: '' })
  liveNodes = [heading('new', 600)]
  assert.equal(measureArticleOutline(root).activeId, 'new')
})
