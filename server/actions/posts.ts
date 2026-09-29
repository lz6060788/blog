'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/server/auth'
import { db } from '@/server/db'
import { categories, tags } from '@/server/db/schema'
import { DraftRepository, type DraftInput } from '@/server/repositories/draft.repository'
import { PostRepository } from '@/server/repositories/post.repository'
import { PostService } from '@/server/services/post.service'
import { revalidatePublicContent } from '@/server/cache/public-content'

const draftRepository = new DraftRepository()

function createPostService() {
  return new PostService(new PostRepository())
}

async function currentUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')
  return session.user.id
}

function revalidateAdmin(documentId?: string) {
  revalidatePath('/admin/posts')
  revalidatePath('/admin/drafts')
  if (documentId) revalidatePath(`/admin/posts/${documentId}/edit`)
}

function validateDraft(input: Partial<DraftInput>) {
  if (input.title !== undefined && !input.title.trim()) throw new Error('标题不能为空')
  if (input.content !== undefined && !input.content.trim()) throw new Error('内容不能为空')
  if (input.tags && input.tags.length > 3) throw new Error('每篇文章最多只能设置 3 个标签')
}

export async function createDraft(data: DraftInput) {
  validateDraft(data)
  const id = await draftRepository.create(await currentUserId(), data)
  revalidateAdmin(id)
  const draft = await draftRepository.findById(id, await currentUserId())
  return { success: true, draftId: id, updatedAt: draft?.updatedAt }
}

export async function getDraftSnapshot(id: string) {
  return draftRepository.findById(id, await currentUserId())
}

/** Compatibility entrypoint: creation always passes through a draft instance. */
export async function createPost(data: DraftInput & { published?: boolean; publishedDate?: string }) {
  const userId = await currentUserId()
  validateDraft(data)
  const draftId = await draftRepository.create(userId, data)
  if (!data.published) {
    revalidateAdmin(draftId)
    return { success: true, postId: draftId, draftId }
  }

  const postId = await draftRepository.publish(draftId, userId)
  revalidateAdmin()
  revalidatePublicContent(postId)
  return { success: true, postId, draftId: null }
}

export async function getEditorDocument(id: string) {
  const userId = await currentUserId()
  const existingDraft = await draftRepository.findById(id, userId)
  const draft = existingDraft || await draftRepository.getOrCreateForPost(userId, id)
  return {
    ...draft,
    documentType: 'draft' as const,
    isRevision: Boolean(draft.postId),
  }
}

export async function saveDraft(id: string, data: Partial<DraftInput>, expectedUpdatedAt?: string) {
  validateDraft(data)
  const updatedAt = await draftRepository.update(id, await currentUserId(), data, expectedUpdatedAt)
  revalidateAdmin(id)
  return { success: true, draftId: id, updatedAt }
}

export async function publishDraft(id: string, expectedUpdatedAt?: string) {
  const postId = await draftRepository.publish(id, await currentUserId(), expectedUpdatedAt)
  revalidateAdmin()
  revalidatePublicContent(postId)
  return { success: true, postId }
}

export async function deleteDraft(id: string, expectedUpdatedAt?: string) {
  await draftRepository.delete(id, await currentUserId(), expectedUpdatedAt)
  revalidateAdmin()
  return { success: true }
}

export async function getDrafts(options?: { search?: string; page?: number; pageSize?: number }) {
  return draftRepository.listForAuthor(await currentUserId(), {
    search: options?.search,
    page: options?.page,
    limit: options?.pageSize,
  })
}

export async function deletePendingArticle(draftId: string, expectedUpdatedAt: string) {
  const postId = await draftRepository.deletePendingArticle(draftId, await currentUserId(), expectedUpdatedAt)
  revalidateAdmin()
  revalidatePublicContent(postId)
  return { success: true }
}

/**
 * Compatibility update: a published article is never mutated while editing.
 * Updating a post id creates/reuses its single revision draft; publishing then
 * atomically applies and removes that draft.
 */
export async function updatePost(
  id: string,
  data: Partial<DraftInput> & { published?: boolean; publishedDate?: string },
) {
  const userId = await currentUserId()
  validateDraft(data)
  const directDraft = await draftRepository.findById(id, userId)
  const draft = directDraft || await draftRepository.getOrCreateForPost(userId, id)
  const { published, publishedDate: _publishedDate, ...draftData } = data
  const updatedAt = await draftRepository.update(draft.id, userId, draftData, draft.updatedAt)

  if (published) {
    const postId = await draftRepository.publish(draft.id, userId, updatedAt)
    revalidateAdmin()
    revalidatePublicContent(postId)
    return { success: true, postId }
  }

  revalidateAdmin(draft.id)
  return { success: true, draftId: draft.id }
}

export async function deletePost(id: string) {
  await createPostService().deletePost(id, await currentUserId())
  revalidateAdmin()
  revalidatePublicContent(id)
  return { success: true }
}

export async function unpublishPost(id: string) {
  const draftId = await draftRepository.unpublish(id, await currentUserId())
  revalidateAdmin(draftId)
  revalidatePublicContent(id)
  return { success: true, postId: id, draftId }
}

export async function getPost(id: string) {
  const userId = await currentUserId()
  const draft = await draftRepository.findById(id, userId)
  if (draft) return { ...draft, published: false }
  return createPostService().getPostById(id, userId)
}

export async function getCategoriesForSelect() {
  await currentUserId()
  return db.select().from(categories).orderBy(categories.name)
}

export async function getTagsForSelect() {
  await currentUserId()
  return db.select().from(tags).orderBy(tags.name)
}

export async function getInternalPostOptions(search?: string) {
  const result = await new PostRepository().listForAuthor(await currentUserId(), {
    status: 'published',
    search,
    page: 1,
    limit: 100,
  })
  return result.data.map((post) => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt || '',
    category: post.category?.name || null,
  }))
}

export async function getPosts(options?: {
  publishedOnly?: boolean
  draftsOnly?: boolean
  search?: string
  page?: number
  pageSize?: number
}) {
  const userId = await currentUserId()
  if (options?.draftsOnly) {
    return draftRepository.listForAuthor(userId, {
      search: options.search,
      page: options.page,
      limit: options.pageSize,
    })
  }
  return new PostRepository().listForAuthor(userId, {
    status: 'published',
    search: options?.search,
    page: options?.page,
    limit: options?.pageSize,
  })
}
