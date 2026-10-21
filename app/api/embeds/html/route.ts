import { getHtmlEmbedObject } from '@/server/services/cos-service'

export const runtime = 'nodejs'

const HTML_EMBED_KEY_PATTERN = /^\d{4}\/\d{2}\/\d{10,}-[a-z0-9]{1,6}\.html?$/i
const HTML_EMBED_CSP = [
  "sandbox allow-scripts",
  "default-src 'none'",
  "script-src 'unsafe-inline' https:",
  "style-src 'unsafe-inline' https:",
  'img-src https: data:',
  'media-src https:',
  'font-src https: data:',
  "connect-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
  'frame-src https:',
].join('; ')

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get('key') || ''
  if (!HTML_EMBED_KEY_PATTERN.test(key)) {
    return new Response('Invalid HTML embed key', { status: 400 })
  }

  try {
    const html = await getHtmlEmbedObject(key)
    const body = new Uint8Array(html.byteLength)
    body.set(html)
    return new Response(body, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': 'inline',
        'Content-Security-Policy': HTML_EMBED_CSP,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('HTML embed delivery failed:', error)
    return new Response('HTML embed not found', { status: 404 })
  }
}
