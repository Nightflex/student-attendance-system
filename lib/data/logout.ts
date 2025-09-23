"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function logout() {
  const cookieStore = await cookies()

  // Clear the cookie (set it to empty and expired)
  cookieStore.set("auth-token", "", {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 0, // expire immediately
  })

  redirect("/auth") // send back to login page
}
