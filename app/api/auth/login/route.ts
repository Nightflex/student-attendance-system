import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/login";
import { SignJWT } from "jose";
import type { LoginRequest, LoginResponse } from "@/lib/types";

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
      const token = await new SignJWT({ id: loginResult.user.id, role: loginResult.user.role })
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(new TextEncoder().encode(process.env.JWT_SECRET!));

      const response = NextResponse.json<LoginResponse>({
        success: true,
        user: loginResult.user,
        token,
        message: "Login successful!",
      });

      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
        sameSite: "strict",
      });

      return response;
    } else {
      return NextResponse.json(loginResult, { status: 401 });
    }
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during login. Please try again." },
      { status: 500 }
    );
  }
}

// Disallow other methods
export const GET = () => new Response("Method Not Allowed", { status: 405 });
export const PUT = () => new Response("Method Not Allowed", { status: 405 });
export const DELETE = () => new Response("Method Not Allowed", { status: 405 });
