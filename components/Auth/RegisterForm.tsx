// components/RegisterForm.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Phone, BookOpen, Calendar, User } from "lucide-react"

// Use mock data for now, replace with real data fetching if needed
const mockCourses = [
  { course_id: 1, course_name: "Computer Science", course_code: "CS" },
  { course_id: 2, course_name: "Mathematics", course_code: "MATH" },
  { course_id: 3, course_name: "Physics", course_code: "PHYS" },
  { course_id: 4, course_name: "Chemistry", course_code: "CHEM" },
  { course_id: 5, course_name: "Biology", course_code: "BIOL" },
]

interface RegisterFormProps {
  onRegisterSuccess: () => void
  onSwitchToLogin: () => void
}

export function RegisterForm({ onRegisterSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    roll_number: "", // User will input this
    course_id: "",
    semester: "",
    batch_year: new Date().getFullYear().toString(),
  })

  const handleSubmit = async (e: React.FormEvent) => { // Make it async
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Simple client-side email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    // Client-side password match validation
    if (formData.password !== formData.confirm_password) {
       setError("Passwords do not match")
       setIsLoading(false)
       return
    }

    // Client-side password strength validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      // --- Prepare data for API call ---
      // Ensure all fields expected by the API are sent, converting types as needed.
      const registrationData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        roll_number: formData.roll_number.trim(), // Crucial: Send the user-provided roll number
        email: formData.email.toLowerCase().trim(),
        phone_number: formData.phone_number?.trim() || "", // Ensure empty string if null/undefined
        password: formData.password, // Plain text, will be hashed by the API
        confirm_password: formData.confirm_password, // For confirmation check in API/lib
        course_id: Number(formData.course_id), // Convert to number
        semester: Number(formData.semester),   // Convert to number
        batch_year: Number(formData.batch_year), // Convert to number
      };
      // -------------------------------

      // --- Make API Call ---
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();
      //

      if (response.ok && result.success) {
        // Success! API returned 201 Created
        setSuccess(result.message || "Registration successful!");
        // Notify parent component (e.g., to switch view or show login)
        onRegisterSuccess();
        // Optionally clear the form:
        // setFormData({...initialState}); // You'd need to define initialState
      } else {
        // Handle API errors (e.g., 400 Bad Request, 409 Conflict)
        // The API should return a specific error message
        setError(result.error || "Registration failed. Please try again.");
      }

    } catch (err) {
      console.error("Registration error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear messages on input change
    if (error) setError("")
    if (success) setSuccess("")
  }

  return (
    <Card className="border-2 shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>Fill in your details to register as a student</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Create a secure password"
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
             {/* Show password-specific errors */}
             {(error && (error.toLowerCase().includes("password") || error.toLowerCase().includes("pass"))) ? (
                <p className="text-sm text-red-600">{error}</p>
             ) : null}
          </div>

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
             {/* Show password match error */}
             {error && error.includes("Passwords do not match") ? (
                <p className="text-sm text-red-600">{error}</p>
             ) : null}
          </div>

          {/* Display general errors */}
          {error && !error.toLowerCase().includes("password") && !error.includes("Passwords do not match") && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Display success message */}
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
                Creating Account...
              </div>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">Already have an account?</p>
          <Button
            variant="link"
            className="p-0 h-auto font-semibold"
            onClick={onSwitchToLogin}
            disabled={isLoading} // Prevent switching during submission
          >
            Sign In
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Teachers and Administrators: Contact your system admin for access
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
