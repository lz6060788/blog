import { siteConfig } from '@/config/site'
import { absoluteUrl, localizedPath, safeDate } from '@/lib/seo'
import { getPublishedPosts } from '@/server/db/queries/posts'
import { getSettings } from '@/server/db/queries/settings'
import { defaultLocale } from '@/i18n.config'

export const dynamic = 'force-dynamic'

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export async function GET() {
  let blogName = siteConfig.blog.name
  let blogDescription = siteConfig.blog.description
  let posts: Awaited<ReturnType<typeof getPublishedPosts>> = []

  try {
    const [settings, publishedPosts] = await Promise.all([
      getSettings(),
      getPublishedPosts(),
    ])
    blogName = settings.blogName
    blogDescription = settings.blogDescription
    posts = publishedPosts
  } catch (error) {
    console.error('Failed to load RSS data:', error)
  }

  const selfUrl = absoluteUrl('/rss.xml')
  const homeUrl = absoluteUrl(localizedPath(defaultLocale, '/'))
  const items = posts.map((post) => {
    const postUrl = absoluteUrl(localizedPath(defaultLocale, `/post/${post.id}`))
    const publishedDate = safeDate(post.date)
    const categories = [post.category, ...post.tags]
      .filter(Boolean)
      .map((category) => `<category>${escapeXml(category)}</category>`)
      .join('')

    return [
      '<item>',
      `<title>${escapeXml(post.title)}</title>`,
      `<link>${postUrl}</link>`,
      `<guid isPermaLink="true">${postUrl}</guid>`,
      `<description>${escapeXml(post.excerpt)}</description>`,
      publishedDate ? `<pubDate>${publishedDate.toUTCString()}</pubDate>` : '',
      categories,
      '</item>',
    ].join('')
  }).join('')

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    `<title>${escapeXml(blogName)}</title>`,
    `<link>${homeUrl}</link>`,
    `<description>${escapeXml(blogDescription)}</description>`,
    '<language>zh-CN</language>',
    `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    `<atom:link href="${selfUrl}" rel="self" type="application/rss+xml" />`,
    items,
    '</channel>',
    '</rss>',
  ].join('')

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600',
    },
  })
}
