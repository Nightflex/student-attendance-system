// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

interface JWTPayload {
  role: string;
  id: string;
  email: string;
  [key: string]: unknown;
}

async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not set");
      return null;
    }
    
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as JWTPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  
  // Protected paths are anything under /dashboard/
  const isProtectedPath = request.nextUrl.pathname.startsWith('/dashboard/')
  
  // Handle protected paths
  if (isProtectedPath) {
    // If no token, redirect to auth
    if (!token) {
      const loginUrl = new URL('/auth', request.url)
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Verify token and get role
    const payload = await verifyToken(token)
    if (!payload) {
      // Invalid token, redirect to auth
      const loginUrl = new URL('/auth', request.url)
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    const userRole = payload.role
    const currentPath = request.nextUrl.pathname
    
    // Role-based path access control
    if (userRole === 'student') {
      // Student can only access student dashboard
      if (currentPath.startsWith('/dashboard/teacher') || currentPath.startsWith('/dashboard/admin')) {
        return NextResponse.redirect(new URL('/dashboard/student', request.url))
      }
    } else if (userRole === 'teacher') {
      // Teacher can only access teacher dashboard
      if (currentPath.startsWith('/dashboard/student') || currentPath.startsWith('/dashboard/admin')) {
        return NextResponse.redirect(new URL('/dashboard/teacher', request.url))
      }
    } else if (userRole === 'admin') {
      // Admin can only access admin dashboard
      if (currentPath.startsWith('/dashboard/student') || currentPath.startsWith('/dashboard/teacher')) {
        return NextResponse.redirect(new URL('/dashboard/admin', request.url))
      }
    } else {
      // Unknown role, redirect to auth
      const loginUrl = new URL('/auth', request.url)
      return NextResponse.redirect(loginUrl)
    }
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