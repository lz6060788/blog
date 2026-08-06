import { NextResponse } from 'next/server'

import { auth } from '@/server/auth'
import { DraftRepository } from '@/server/repositories/draft.repository'
import { PostRepository } from '@/server/repositories/post.repository'

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
    return NextResponse.json({ ...post, documentType: 'published' })
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
    const { published, ...changes } = body
    await drafts.update(draft.id, session.user.id, changes)
    if (published) {
      const postId = await drafts.publish(draft.id, session.user.id)
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
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '删除失败' }, { status: 400 })
  }
}
