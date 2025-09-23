"use client"

import { QrCode } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  studentId?: string
  department?: string
  semester?: string
  year?: string
  role: string
  courseId?: number
  teacherId?: number
}

export function TeacherDashboardHeader({ user }: { user: User | null }) {
  return (
    <div className="text-center space-y-3 sm:space-y-4">
      <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-primary/10 rounded-full">
        <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        <span className="text-base sm:text-lg font-semibold text-primary">Teacher Portal</span>
      </div>
      <h1 className="text-2xl sm:text-4xl font-bold text-balance">Welcome, {user?.name || "Teacher"}!</h1>
      <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty px-4">
        Generate QR codes for attendance and manage your classes
      </p>
    </div>
  )
}