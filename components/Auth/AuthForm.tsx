// components/auth-forms.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Phone, BookOpen, Calendar, GraduationCap, User } from "lucide-react"

interface UserData {
  id: string;
  name: string;
  email: string;
  roll_number: string;
  department: string;
  semester: string;
  batch_year: string;
  role: string;
  course_id: number;
}

interface AuthFormsProps {
  onLogin: (userData: UserData) => void
}

interface Course {
  course_id: number;
  course_name: string;
  course_code: string;
}

interface FormData {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  roll_number: string;
  course_id: string;
  semester: string;
  batch_year: string;
}

// Mock course data
const mockCourses: Course[] = [
  { course_id: 1, course_name: "Computer Science", course_code: "CS" },
  { course_id: 2, course_name: "Mathematics", course_code: "MATH" },
  { course_id: 3, course_name: "Physics", course_code: "PHYS" },
  { course_id: 4, course_name: "Chemistry", course_code: "CHEM" },
  { course_id: 5, course_name: "Biology", course_code: "BIOL" },
]

export function AuthForms({ onLogin }: AuthFormsProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    roll_number: "",
    course_id: "",
    semester: "",
    batch_year: new Date().getFullYear().toString(),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    try {
      if (isLogin) {
        // Mock login logic
        setTimeout(() => {
          // Mock user data
          const mockUser: UserData = {
            id: "1",
            name: `${formData.first_name || "Alex"} ${formData.last_name || "Johnson"}`,
            email: formData.email,
            roll_number: formData.roll_number || "CS2024001",
            department: mockCourses.find(c => c.course_id === Number(formData.course_id))?.course_name || "Computer Science",
            semester: formData.semester || "6",
            batch_year: formData.batch_year || "2024",
            role: "student",
            course_id: Number(formData.course_id) || 1,
          }
          
          onLogin(mockUser)
          setIsLoading(false)
        }, 800)
      } else {
        // Registration logic
        if (formData.password !== formData.confirm_password) {
          throw new Error("Passwords do not match")
        }

        // Validate required fields
        const requiredFields = [
          { value: formData.first_name, name: "First Name" },
          { value: formData.last_name, name: "Last Name" },
          { value: formData.roll_number, name: "Roll Number" },
          { value: formData.email, name: "Email" },
          { value: formData.course_id, name: "Course" },
          { value: formData.semester, name: "Semester" },
          { value: formData.batch_year, name: "Batch Year" },
          { value: formData.password, name: "Password" },
        ]

        const missingField = requiredFields.find(field => !field.value.trim())
        if (missingField) {
          throw new Error(`${missingField.name} is required`)
        }

        // Password strength validation
        if (formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters long")
        }

        // Mock registration
        setTimeout(() => {
          setSuccess("Registration successful! Please log in.")
          setIsLogin(true)
          // Clear form except email for login
          setFormData(prev => ({
            ...prev,
            password: "",
            confirm_password: "",
            first_name: "",
            last_name: "",
            phone_number: "",
            roll_number: "",
            course_id: "",
            semester: "",
            batch_year: new Date().getFullYear().toString(),
          }))
          setIsLoading(false)
        }, 800)
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || "An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
    if (success) setSuccess("")
  }

  // Reset form when switching between login/register
  const toggleFormMode = () => {
    setIsLogin(!isLogin)
    setError("")
    setSuccess("")
    if (!isLogin) {
      // When switching to login, preserve email
      setFormData(prev => ({
        ...prev,
        password: "",
        confirm_password: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        roll_number: "",
        course_id: "",
        semester: "",
        batch_year: new Date().getFullYear().toString(),
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-full mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">EduAttend</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isLogin ? "Welcome Back" : "Join EduAttend"}
          </h1>
          <p className="text-muted-foreground">
            {isLogin 
              ? "Sign in to access your student portal" 
              : "Create your student account to get started"}
          </p>
        </div>

        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {isLogin ? "Sign In" : "Create Account"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Enter your credentials to access your dashboard"
                : "Fill in your details to register as a student"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        placeholder="Enter your first name"
                        value={formData.first_name}
                        onChange={(e) => handleInputChange("first_name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        placeholder="Enter your last name"
                        value={formData.last_name}
                        onChange={(e) => handleInputChange("last_name", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roll_number">Roll Number *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="roll_number"
                        placeholder="Enter your roll number"
                        className="pl-10"
                        value={formData.roll_number}
                        onChange={(e) => handleInputChange("roll_number", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone_number"
                        type="tel"
                        placeholder="Enter your phone number"
                        className="pl-10"
                        value={formData.phone_number}
                        onChange={(e) => handleInputChange("phone_number", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course_id">Course *</Label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <select
                        id="course_id"
                        className="w-full pl-10 pr-3 py-2 border border-input bg-background rounded-md text-sm"
                        value={formData.course_id}
                        onChange={(e) => handleInputChange("course_id", e.target.value)}
                        required
                      >
                        <option value="">Select Course</option>
                        {mockCourses.map((course) => (
                          <option key={course.course_id} value={course.course_id}>
                            {course.course_name} ({course.course_code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="semester">Current Semester *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <select
                          id="semester"
                          className="w-full pl-10 pr-3 py-2 border border-input bg-background rounded-md text-sm"
                          value={formData.semester}
                          onChange={(e) => handleInputChange("semester", e.target.value)}
                          required
                        >
                          <option value="">Select Semester</option>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <option key={sem} value={sem}>
                              {sem}{sem === 1 ? "st" : sem === 2 ? "nd" : sem === 3 ? "rd" : "th"} Semester
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="batch_year">Batch Year *</Label>
                      <Input
                        id="batch_year"
                        type="number"
                        placeholder="e.g., 2024"
                        value={formData.batch_year}
                        onChange={(e) => handleInputChange("batch_year", e.target.value)}
                        min={new Date().getFullYear() - 10}
                        max={new Date().getFullYear() + 5}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isLogin ? "Enter your password" : "Create a secure password"}
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

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm Password *</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirm_password}
                    onChange={(e) => handleInputChange("confirm_password", e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
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
                    {isLogin ? "Signing In..." : "Creating Account..."}
                  </div>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button 
                variant="link" 
                className="p-0 h-auto font-semibold" 
                onClick={toggleFormMode}
              >
                {isLogin ? "Register as Student" : "Sign In"}
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Teachers and Administrators: Contact your system admin for access
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}