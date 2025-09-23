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

    // Now require roll_number instead of email
    if (!body.roll_number || !body.password || !body.user_type) {
      return NextResponse.json(
        { success: false, message: "Roll number, password, and user type are required." },
        { status: 400 }
      );
    }

    const sanitizedData: LoginRequest = {
      roll_number: body.roll_number.trim(), // Use roll_number instead of email
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
        // Include roll_number in JWT payload
        roll_number: loginResult.user.roll_number || loginResult.user.email // Fallback to email if needed
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

      // Set cookie with Vercel-compatible settings
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
        sameSite: "lax",
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