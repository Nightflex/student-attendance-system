// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/dashboard/student',
  '/dashboard/teacher',
  '/dashboard/admin',
]

// Define public routes
const publicRoutes = [
  '/',
  '/auth',
  '/api/auth/login',
  '/api/students', // Registration endpoint
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  )
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // If it's not a protected route, allow access
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // For protected routes, verify the JWT token from cookies
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    // Redirect to login if no token
    const redirectUrl = new URL('/auth', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  try {
    // Verify the JWT token using jose
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set')
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    // Add user info to headers for downstream use
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.id as string)
    requestHeaders.set('x-user-role', payload.role as string)
    requestHeaders.set('x-user-email', payload.email as string)

    // Continue with the request
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

  } catch (error) {
    console.error('JWT verification error:', error)
    // Redirect to login if token is invalid
    const redirectUrl = new URL('/auth', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}