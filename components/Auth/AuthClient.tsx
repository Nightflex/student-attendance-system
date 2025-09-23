"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthLayout } from "@/components/Auth/AuthLayout"
import { LoginForm } from "@/components/Auth/LoginForm"
import { User } from "@/lib/types"

export function AuthClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect') || '/dashboard/student'

  const handleLogin = (userData: User) => {
    
    console.log("User logged in:", userData)
    
    // Redirect logic based on user role or the redirect parameter
    router.push(redirectUrl)
  }

  return (
    <AuthLayout
      title={"Welcome Back"}
      subtitle={
        "Sign in to access your student portal"
      }
    >
        <LoginForm
          onLogin={handleLogin}
        />
    </AuthLayout>
  )
}