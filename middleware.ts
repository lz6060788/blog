import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from '@/i18n.config'
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/app/i18n/routing'

const intlMiddleware = createMiddleware(routing)
const privateRobotsPolicy = 'noindex, nofollow, noarchive'

function preventIndexing(response: NextResponse): NextResponse {
  response.headers.set('X-Robots-Tag', privateRobotsPolicy)
  return response
}

function redirectToLogin(req: NextRequest, pathname: string): NextResponse {
  let locale: string = defaultLocale
  const localeMatch = pathname.match(/^\/(en|zh)(\/|$)/)
  if (localeMatch) {
    locale = localeMatch[1]
  }

  const loginUrl = new URL(`/${locale}/login`, req.url)
  loginUrl.searchParams.set('callbackUrl', pathname)
  return preventIndexing(NextResponse.redirect(loginUrl))
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('.') ||
    pathname.includes('/favicon')
  ) {
    return NextResponse.next()
  }

  // Helper function to get path without locale prefix
  const getPathWithoutLocale = (path: string): string => {
    return locales.reduce(
      (acc, locale) => acc.replace(`/${locale}`, ''),
      path
    ) || path
  }

  const pathWithoutLocale = getPathWithoutLocale(pathname)

  // Check if accessing admin routes (excluding login page)
  // Note: We check pathWithoutLocale to handle cases like /zh/admin if they existed,
  // but strictly speaking admin routes are at root /admin in this app.
  // However, keeping this logic for consistency with existing auth checks.
  const isAdminRoute = pathWithoutLocale.startsWith('/admin')
  const isLoginPage = pathWithoutLocale === '/login'

  // Admin route protection - must come BEFORE locale handling
  if (isAdminRoute && !isLoginPage) {

    // Debug: Log all cookies
    const cookieStore = req.cookies
    const cookieNames = cookieStore.getAll().map(c => c.name)

    try {
      // Check for both possible cookie names
      // 1. Try default (NextAuth v4 style or auto-detect)
      let token = await getToken({ 
        req, 
        secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET 
      })

      // 2. If token not found, try with authjs prefix (NextAuth v5 default)
      if (!token) {
        token = await getToken({
          req,
          cookieName: 'authjs.session-token',
          secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET 
        })
      }

      // 3. If still not found, try with __Secure- prefix (Production/HTTPS)
      if (!token) {
        token = await getToken({
          req,
          cookieName: '__Secure-authjs.session-token',
          secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET 
        })
      }

      // 4. Fallback: Auto-detect any cookie that looks like a session token
      if (!token) {
        const sessionCookie = cookieNames.find(name => 
          name.includes('session-token') || 
          name.includes('next-auth.session-token') || 
          name.includes('authjs.session-token')
        )
        
        if (sessionCookie) {
          token = await getToken({
            req,
            cookieName: sessionCookie,
            secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET 
          })
        }
      }

      // Check auth
      if (!token) {
        return redirectToLogin(req, pathname)
      }

      
      // If authorized admin route, we skip intlMiddleware as admin routes are not localized
      return preventIndexing(NextResponse.next())
    } catch (error) {
      console.error('❌ [Middleware] Auth error:', error)
      return redirectToLogin(req, pathname)
    }
  }

  // If it's an admin route (even if public like login, though login is excluded above),
  // we need to decide if we run intlMiddleware.
  // The login page IS localized (app/[locale]/login), so it needs intlMiddleware.
  // The admin dashboard (app/admin) is NOT localized, so it should skip intlMiddleware.
  
  if (pathname.startsWith('/admin')) {
    return preventIndexing(NextResponse.next())
  }

  // For all other routes (including login), use next-intl middleware
  // This handles locale detection, redirection, and setting headers for getRequestConfig
  const response = intlMiddleware(req)
  return isLoginPage ? preventIndexing(response) : response
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/',
  ],
}
