// components/login-form.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, User } from "lucide-react" // Removed Mail icon
import axios from "axios"
import type { LoginRequest, LoginResponse, User as UserType } from "@/lib/types"
import { useRouter } from "next/navigation"

interface LoginFormProps {
  onLogin: (userData: UserType) => void
}

interface AxiosError {
  response?: {
    data: {
      message?: string
    }
  }
}

export function LoginForm({ onLogin}: LoginFormProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState<LoginRequest>({
    roll_number: "", // Changed from email to roll_number
    password: "",
    user_type: "student",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simple roll number validation (adjust as needed)
    if (!formData.roll_number || formData.roll_number.trim().length < 1) {
      setError("Please enter your roll number")
      setIsLoading(false)
      return
    }

    try {
      const response = await axios.post<LoginResponse>('/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      })

      if (response.data.success && response.data.user) {
        onLogin(response.data.user)
        
        // Redirect based on user role
        if (response.data.user.role) {
          switch (response.data.user.role) {
            case 'student':
              router.push('/dashboard/student')
              break
            case 'teacher':
              router.push('/dashboard/teacher')
              break
            case 'admin':
              router.push('/dashboard/admin')
              break
            default:
              router.push('/dashboard')
          }
        } else {
          router.push('/dashboard')
        }
      } else {
        setError(response.data.message || "Login failed")
      }
    } catch (err) {
      console.error("Login error:", err)
      const axiosError = err as AxiosError;
      if (axiosError.response?.data?.message) {
        setError(axiosError.response.data.message)
      } else {
        setError("Network error. Please check your connection and try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  return (
    <Card className="border-2 shadow-xl max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="user_type_login">Login As *</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <select
                id="user_type_login"
                className="w-full pl-10 pr-3 py-2 border border-input bg-background rounded-md text-sm"
                value={formData.user_type}
                onChange={(e) => handleInputChange("user_type", e.target.value)}
                required
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Roll Number Input */}
          <div className="space-y-2">
            <Label htmlFor="roll_number_login">Roll Number *</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="roll_number_login"
                type="text"
                placeholder="Enter your roll number"
                className="pl-10"
                value={formData.roll_number}
                onChange={(e) => handleInputChange("roll_number", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password_login">Password *</Label>
            <div className="relative">
              <Input
                id="password_login"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pr-10"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing In...
              </div>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">Contact admin for account access</p>
        </div>
      </CardContent>
    </Card>
  )
}