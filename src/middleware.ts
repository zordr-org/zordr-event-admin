import { NextRequest, NextResponse } from 'next/server'

// Name of the httpOnly session cookie set by the backend
export const SESSION_COOKIE = 'zordr_admin_session'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hasSession = req.cookies.has(SESSION_COOKIE)

  // Authenticated user hitting /login → redirect to dashboard
  if (pathname === '/login' && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Unauthenticated user hitting any /(admin) route → redirect to login
  const isAdminRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/organizers') ||
    pathname.startsWith('/events') ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/customers') ||
    pathname.startsWith('/settlements') ||
    pathname.startsWith('/refunds') ||
    pathname.startsWith('/support') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/employees') ||
    pathname.startsWith('/roles') ||
    pathname.startsWith('/settings')

  if (isAdminRoute && !hasSession) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
