import { NextResponse } from 'next/server'

import { auth } from '@/server/auth'
import { DraftRepository } from '@/server/repositories/draft.repository'
import { PostRepository } from '@/server/repositories/post.repository'
import { revalidatePublicContent } from '@/server/cache/public-content'

export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: '未认证' }, { status: 401 })
  try {
    const drafts = new DraftRepository()
    const draft = await drafts.findById(params.id, session.user.id)
    if (draft) return NextResponse.json({ ...draft, documentType: 'draft', published: false })
    const post = await new PostRepository().findById(params.id, session.user.id)
    if (!post) return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    return NextResponse.json({ ...post, documentType: post.published ? 'published' : 'pending' })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '获取文章失败' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: '未认证' }, { status: 401 })
  try {
    const body = await request.json()
    const drafts = new DraftRepository()
    const direct = await drafts.findById(params.id, session.user.id)
    const draft = direct || await drafts.getOrCreateForPost(session.user.id, params.id)
    const { published, expectedUpdatedAt, ...changes } = body
    const updatedAt = await drafts.update(draft.id, session.user.id, changes, expectedUpdatedAt)
    if (published) {
      const postId = await drafts.publish(draft.id, session.user.id, updatedAt)
      revalidatePublicContent(postId)
      return NextResponse.json({ id: postId, documentType: 'published' })
    }
    return NextResponse.json({ ...(await drafts.findById(draft.id, session.user.id)), documentType: 'draft', published: false })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '更新草稿失败' }, { status: 400 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: '未认证' }, { status: 401 })
  try {
    const drafts = new DraftRepository()
    const draft = await drafts.findById(params.id, session.user.id)
    if (draft) await drafts.delete(params.id, session.user.id)
    else await new PostRepository().delete(params.id, session.user.id)
    revalidatePublicContent(draft?.postId || params.id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '删除失败' }, { status: 400 })
  }
}

/** Explicit withdrawal; PUT published:false continues to mean save a draft. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: '未认证' }, { status: 401 })
  try {
    const body = await request.json()
    if (body.action !== 'unpublish') return NextResponse.json({ error: '不支持的状态操作' }, { status: 400 })
    const draftId = await new DraftRepository().unpublish(params.id, session.user.id)
    revalidatePublicContent(params.id)
    return NextResponse.json({ id: params.id, draftId, published: false, documentType: 'pending' })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '撤回失败' }, { status: 400 })
  }
}
