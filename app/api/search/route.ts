import { NextResponse } from 'next/server'
import { searchPublishedPosts } from '@/server/db/queries/posts'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.trim().slice(0, 100) || ''
  if (!query) return NextResponse.json({ results: [] })

  try {
    const results = await searchPublishedPosts(query)
    return NextResponse.json(
      { results },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
        },
      },
    )
  } catch (error) {
    console.error('Article search failed:', error)
    return NextResponse.json({ error: 'Search is temporarily unavailable' }, { status: 500 })
  }
}
