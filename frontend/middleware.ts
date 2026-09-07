import { NextRequest, NextResponse } from 'next/server'

// Mantido em sincronia com ADMIN_COOKIE em lib/admin-server.ts
const ADMIN_COOKIE = 'admin_token'

export function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === '/admin/login'
  const hasToken = request.cookies.has(ADMIN_COOKIE)

  if (!isLoginPage && !hasToken) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
