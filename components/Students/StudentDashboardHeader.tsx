"use client"

import { Users } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  roll_number?: string
  course_code?: string
  semester?: string
  year?: string
  role: string
  courseId?: number
  teacherId?: number
}

export function StudentDashboardHeader({ user }: { user: User | null }) {
  return (
    <div className="text-center space-y-3 sm:space-y-4">
      <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-primary/10 rounded-full">
        <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        <span className="text-base sm:text-lg font-semibold text-primary">Student Portal</span>
      </div>
      <h1 className="text-2xl sm:text-4xl font-bold text-balance">Welcome Back, {user?.name || "Student"}!</h1>
      <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty px-4">
        Scan QR codes to mark your attendance and track your academic progress
      </p>
      {user && (
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground px-4">
          <span>ID: {user.roll_number}</span>
          <span className="hidden sm:inline">•</span>
          <span>{user.course_code}</span>
          <span className="hidden sm:inline">•</span>
          <span>Semester {user.semester}th</span>
        </div>
      )}
    </div>
  )
}