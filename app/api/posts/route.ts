import { NextResponse } from 'next/server'

import { auth } from '@/server/auth'
import { DraftRepository } from '@/server/repositories/draft.repository'
import { PostRepository } from '@/server/repositories/post.repository'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: '未认证' }, { status: 401 })

  try {
    const params = new URL(request.url).searchParams
    const options = {
      search: params.get('search') || undefined,
      page: Number(params.get('page') || 1),
      limit: Number(params.get('limit') || 20),
    }
    if (params.get('drafts') === 'true') {
      return NextResponse.json(await new DraftRepository().listForAuthor(session.user.id, options))
    }
    return NextResponse.json(await new PostRepository().listForAuthor(session.user.id, { ...options, status: 'published' }))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '获取文章失败' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: '未认证' }, { status: 401 })

  try {
    const body = await request.json()
    const repository = new DraftRepository()
    const draftId = await repository.create(session.user.id, body)
    if (body.published) {
      const postId = await repository.publish(draftId, session.user.id)
      return NextResponse.json({ id: postId, documentType: 'published' }, { status: 201 })
    }
    return NextResponse.json({ id: draftId, documentType: 'draft' }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '创建草稿失败' }, { status: 400 })
  }
}
