"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthLayout } from "@/components/Auth/AuthLayout"
import { LoginForm } from "@/components/Auth/LoginForm"
import { RegisterForm } from "@/components/Auth/RegisterForm"

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  [key: string]: string | undefined;
}

export function AuthClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLogin, setIsLogin] = useState(true)
  const redirectUrl = searchParams.get('redirect') || '/dashboard/student'

  const handleLogin = (userData: UserData) => {
    // In a real app, you would:
    // 1. Make API call to authenticate
    // 2. Store token in cookies/session
    // 3. Redirect to appropriate dashboard
    
    console.log("User logged in:", userData)
    
    // Redirect logic based on user role or the redirect parameter
    router.push(redirectUrl)
  }

  const handleRegisterSuccess = () => {
    // Switch to login form after successful registration
    setIsLogin(true)
  }

  return (
    <AuthLayout
      title={isLogin ? "Welcome Back" : "Join EduAttend"}
      subtitle={
        isLogin
          ? "Sign in to access your student portal"
          : "Create your student account to get started"
      }
    >
      {isLogin ? (
        <LoginForm
          onLogin={handleLogin}
          onSwitchToRegister={() => setIsLogin(false)}
        />
      ) : (
        <RegisterForm
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setIsLogin(true)}
        />
      )}
    </AuthLayout>
  )
}