"use server";

import { AuthClient } from "@/components/Auth/AuthClient";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

export default async function AuthPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (token) {
    try {
      // Verify token using jose
      const { payload }: any = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET!)
      );

      console.log("User role:", payload.role);

      // Redirect based on role
      if (payload.role === "student") redirect("/dashboard/student");
      if (payload.role === "teacher") redirect("/dashboard/teacher");
      if (payload.role === "admin") redirect("/dashboard/admin");

      console.warn("Unknown role:", payload.role);
    } catch (err) {
      console.warn("Invalid token:", err);
      // optionally clear invalid cookie:
      // cookies().delete("auth-token");
    }
  }

  return <AuthClient />;
}
