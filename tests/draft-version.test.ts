import assert from 'node:assert/strict'
import { test } from 'node:test'
import { canAdoptDraftVersion } from '../lib/draft-version'

const baseline = { title: 'Title', content: 'Saved body', excerpt: '', coverImageUrl: null, aiCoverStatus: 'pending' }

test('known AI results allow continued editing without losing local unsaved text', () => {
  const remote = { ...baseline, excerpt: 'AI summary', coverImageUrl: '/cover.png', aiCoverStatus: 'done' }
  const local = { ...remote, content: 'Unsaved local changes' }
  assert.equal(canAdoptDraftVersion(baseline, local, remote, true, true), true)
})

test('withdrawal invalidates an editor even when content is unchanged', () => {
  assert.equal(canAdoptDraftVersion(baseline, baseline, baseline, true, false), false)
})

test('unseen AI output and concurrent human edits cannot be overwritten', () => {
  assert.equal(canAdoptDraftVersion(baseline, baseline, { ...baseline, excerpt: 'unseen result' }, true, true), false)
  assert.equal(canAdoptDraftVersion(baseline, baseline, { ...baseline, title: 'Other window' }, true, true), false)
})
