import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { readFile, readdir } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { eq } from 'drizzle-orm'
import * as schema from '../server/db/schema'

// In-memory PostgreSQL: never load .env or connect to the application's database.
process.env.DATABASE_URL = 'postgres://unused:unused@127.0.0.1:1/unused'
const memory = new PGlite()
const database = drizzle(memory, { schema })
let repo: InstanceType<typeof import('../server/repositories/draft.repository').DraftRepository>
const author = 'lifecycle-test-author'

before(async () => {
  for (const file of (await readdir('drizzle')).filter((name) => /^\d+.*\.sql$/.test(name)).sort()) {
    await memory.exec(await readFile(`drizzle/${file}`, 'utf8'))
  }
  await database.insert(schema.users).values({ id: author, name: 'Test', email: 'test@example.invalid' })
  const { DraftRepository } = await import('../server/repositories/draft.repository')
  repo = new DraftRepository(database as unknown as typeof import('../server/db').db)
})
after(async () => { await memory.close() })

async function post(id: string) {
  const [value] = await database.select().from(schema.posts).where(eq(schema.posts.id, id))
  return value
}

test('withdrawal preserves an existing revision and republishes the same URL and first publication date', async () => {
  const id = await repo.create(author, { title: 'Original', content: 'Published body', tags: ['original'], coverImageUrl: 'https://example.com/cover.png' })
  assert.equal(await repo.publish(id, author), id)
  const original = await post(id)
  const draft = await repo.getOrCreateForPost(author, id)
  const version = await repo.update(draft.id, author, { title: 'Revision', content: '```video\nhttps://example.com/v.mp4\n```', tags: ['revised'] }, draft.updatedAt)
  assert.equal((await post(id)).content, original.content)
  assert.equal(await repo.unpublish(id, author), draft.id)
  assert.equal((await post(id)).published, false)
  const pending = (await repo.findById(draft.id, author))!
  assert.equal(pending.postPublished, false)
  assert.equal(pending.title, 'Revision')
  assert.deepEqual(pending.tags.map((tag) => tag.name), ['revised'])
  await assert.rejects(repo.update(draft.id, author, { title: 'stale overwrite' }, version), /改变/)
  await assert.rejects(repo.publish(draft.id, author, version), /改变/)
  await assert.rejects(repo.delete(draft.id, author), /不能单独删除/)
  assert.equal(await repo.publish(draft.id, author, pending.updatedAt), id)
  assert.equal((await post(id)).title, 'Revision')
  assert.equal((await post(id)).publishedDate, original.publishedDate)
  assert.equal((await post(id)).coverImageUrl, original.coverImageUrl)
  assert.equal(await repo.findById(draft.id, author), null)
  await assert.rejects(repo.publish(draft.id, author), /草稿/)
})

test('withdrawal without a revision copies the article once; wrong owners cannot change visibility', async () => {
  const id = await repo.create(author, { title: 'Snapshot', content: 'body', tags: ['snapshot'] })
  await repo.publish(id, author)
  await assert.rejects(repo.unpublish(id, 'another-user'), /无权/)
  assert.equal((await post(id)).published, true)
  const draftId = await repo.unpublish(id, author)
  assert.equal(await repo.unpublish(id, author), draftId)
  const draft = (await repo.findById(draftId, author))!
  assert.equal(draft.content, 'body')
  assert.equal(draft.tags[0].name, 'snapshot')
  const rows = await database.select().from(schema.postDrafts).where(eq(schema.postDrafts.postId, id))
  assert.equal(rows.length, 1)
})

test('save versus publish with one version has only one winner and no partial writes', async () => {
  const id = await repo.create(author, { title: 'Concurrent', content: 'body' })
  const draft = (await repo.findById(id, author))!
  const results = await Promise.allSettled([
    repo.update(id, author, { content: 'new content' }, draft.updatedAt),
    repo.publish(id, author, draft.updatedAt),
  ])
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1)
  const saved = await repo.findById(id, author)
  if (saved) {
    assert.equal(saved.content, 'new content')
    assert.equal(await post(id), undefined)
  } else assert.equal((await post(id)).content, 'body')
})

test('deleting a live revision keeps the published article; failed save rolls back content and tags', async () => {
  const id = await repo.create(author, { title: 'Delete revision', content: 'body', tags: ['kept'] })
  await repo.publish(id, author)
  const draft = await repo.getOrCreateForPost(author, id)
  await assert.rejects(repo.update(draft.id, author, { title: 'must rollback', categoryId: 'missing-category', tags: ['wrong'] }))
  assert.equal((await repo.findById(draft.id, author))!.title, draft.title)
  await repo.delete(draft.id, author)
  assert.equal((await post(id)).published, true)
  assert.equal(await repo.findByPostId(id, author), null)
})

test('pending deletion is atomic and an old draft cannot delete a republished article', async () => {
  const id = await repo.create(author, { title: 'Pending delete', content: 'body' })
  await repo.publish(id, author)
  const draftId = await repo.unpublish(id, author)
  const draft = (await repo.findById(draftId, author))!
  await repo.publish(draftId, author, draft.updatedAt)
  await assert.rejects(repo.deletePendingArticle(draftId, author, draft.updatedAt), /草稿/)
  assert.equal((await post(id)).published, true)
  const nextId = await repo.unpublish(id, author)
  const next = (await repo.findById(nextId, author))!
  await repo.deletePendingArticle(nextId, author, next.updatedAt)
  assert.equal(await post(id), undefined)
  assert.equal(await repo.findById(nextId, author), null)
})

test('publish racing withdrawal leaves a complete pending draft and a hidden article', async () => {
  const id = await repo.create(author, { title: 'Race', content: 'body', tags: ['race'] })
  await repo.publish(id, author)
  const revision = await repo.getOrCreateForPost(author, id)
  await repo.update(revision.id, author, { content: 'revised body' })
  const ready = (await repo.findById(revision.id, author))!
  await Promise.allSettled([repo.publish(ready.id, author, ready.updatedAt), repo.unpublish(id, author)])
  assert.equal((await post(id)).published, false)
  const pending = (await repo.findByPostId(id, author))!
  assert.equal(pending.content, 'revised body')
  assert.equal(pending.tags[0].name, 'race')
})
