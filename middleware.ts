// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  
  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/login', 
    '/register', 
    '/api/auth/login', 
    '/api/auth/register',
    '/_next/static', 
    '/_next/image', 
    '/favicon.ico'
  ]
  
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path)
  )
  
  // Protected paths are anything under /dashboard/
  const isProtectedPath = request.nextUrl.pathname.startsWith('/dashboard/')
  
  // Only redirect if it's a protected path AND no token
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.url)
    // Add redirect parameter to bring user back after login
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Redirect root to login
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Continue with the request for all other cases
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static assets
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}