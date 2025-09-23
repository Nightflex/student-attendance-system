// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Define protected routes
const protectedRoutes = [
  "/dashboard",
  "/dashboard/student",
  "/dashboard/teacher",
  "/dashboard/admin",
];

// Define public routes (accessible without login)
const publicRoutes = [
  "/",
  "/auth",
  "/api/auth/login",
  "/api/students", // Registration endpoint
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Debug logging
  console.log("🔎 Middleware pathname:", pathname);

  // Check if route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Allow public routes
  if (isPublicRoute) {
    console.log("✅ Public route, allowing access");
    return NextResponse.next();
  }

  // Allow non-protected routes
  if (!isProtectedRoute) {
    console.log("✅ Non-protected route, allowing access");
    return NextResponse.next();
  }

  // For protected routes → check token
  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    console.warn("⚠️ No token found, redirecting to /auth");
    const redirectUrl = new URL("/auth", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("❌ JWT_SECRET environment variable is not set");
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    console.log("✅ JWT verified:", payload);

    // Add user info to request headers
    const requestHeaders = new Headers(request.headers);
    if (payload.id) requestHeaders.set("x-user-id", String(payload.id));
    if (payload.role) requestHeaders.set("x-user-role", String(payload.role));
    if (payload.email) requestHeaders.set("x-user-email", String(payload.email));

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch (error) {
    console.error("❌ JWT verification error:", error);
    const redirectUrl = new URL("/auth", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }
}

// ✅ Config: include API protection if you want
export const config = {
  matcher: [
    // Match all paths except static files & favicon
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
