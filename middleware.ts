import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from '@/i18n.config'

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
    } catch (error) {
      console.error('❌ [Middleware] Auth error:', error)
    }
  }

  // Check if the pathname has a locale prefix
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Redirect to locale-prefixed path if missing
  if (pathnameIsMissingLocale) {
    // Special handling for admin routes - don't add locale prefix
    if (pathname.startsWith('/admin')) {
      return NextResponse.next()
    }

    // For other routes, add default locale prefix
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, req.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/',
  ],
}
