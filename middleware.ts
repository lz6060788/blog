import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from '@/i18n.config'
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/app/i18n/routing'

const intlMiddleware = createMiddleware(routing)

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
  const isLoginPage = pathWithoutLocale.includes('/login')

  // Admin route protection - must come BEFORE locale handling
  if (isAdminRoute && !isLoginPage) {
    console.log('🔍 [Middleware] Admin route detected:', pathWithoutLocale)

    try {
      // Check for both possible cookie names
      let token = await getToken({ req })

      // If token not found with default, try with authjs prefix
      if (!token) {
        token = await getToken({
          req,
          cookieName: 'authjs.session-token',
        })
      }

      console.log('🔐 [Middleware] Token check:', {
        path: pathWithoutLocale,
        hasToken: !!token,
        tokenKeys: token ? Object.keys(token) : [],
        userId: token?.id,
        userEmail: token?.email,
      })

      // Check auth
      if (!token) {
        let locale: string = defaultLocale
        const localeMatch = pathname.match(/^\/(en|zh)(\/|$)/)
        if (localeMatch) {
          locale = localeMatch[1]
        }

        console.log('🚫 [Middleware] No token, redirecting to login')
        const loginUrl = new URL(`/${locale}/login`, req.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
      }

      console.log('✅ [Middleware] Auth verified, allowing access')
      
      // If authorized admin route, we skip intlMiddleware as admin routes are not localized
      return NextResponse.next()
    } catch (error) {
      console.error('❌ [Middleware] Auth error:', error)
      // On error, we might want to redirect to login or just let it fail safely
      // For now, falling through to next() which might be intlMiddleware or Next.js handler
    }
  }

  // If it's an admin route (even if public like login, though login is excluded above),
  // we need to decide if we run intlMiddleware.
  // The login page IS localized (app/[locale]/login), so it needs intlMiddleware.
  // The admin dashboard (app/admin) is NOT localized, so it should skip intlMiddleware.
  
  if (pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // For all other routes (including login), use next-intl middleware
  // This handles locale detection, redirection, and setting headers for getRequestConfig
  return intlMiddleware(req)
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/',
  ],
}
