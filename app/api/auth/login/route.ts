// pages/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/login";
import { SignJWT } from "jose";
import type { LoginRequest, LoginResponse } from "@/lib/types";

interface DatabaseError extends Error {
  message: string;
}

export async function POST(request: Request) {
  try {
    const body: LoginRequest = await request.json();

    if (!body.email || !body.password || !body.user_type) {
      return NextResponse.json(
        { success: false, message: "Email, password, and user type are required." },
        { status: 400 }
      );
    }

    const sanitizedData: LoginRequest = {
      email: body.email.toLowerCase().trim(),
      password: body.password,
      user_type: body.user_type,
    };

    const loginResult = await authenticateUser(sanitizedData);

    if (loginResult.success && loginResult.user) {
      // Create JWT with jose
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-key-change-in-production");
      
      const token = await new SignJWT({ 
        id: loginResult.user.id, 
        role: loginResult.user.role,
        email: loginResult.user.email
      })
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(secret);

      // Create response
      const response = NextResponse.json<LoginResponse>({
        success: true,
        user: loginResult.user,
        token,
        message: "Login successful!",
      });

      // Set cookie with Vercel-compatible settings (REMOVE domain setting)
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: true, // Always true for Vercel
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
        sameSite: "lax",
        // Remove the domain setting - let browser handle it automatically
      });

      return response;
    } else {
      return NextResponse.json(loginResult, { status: 401 });
    }
  } catch (error) {
    const dbError = error as DatabaseError;
    console.error("Login API Error:", dbError);
    return NextResponse.json(
      { success: false, message: "An error occurred during login. Please try again." },
      { status: 500 }
    );
  }
}