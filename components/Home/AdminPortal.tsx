// components/admin-portal.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserCog, BarChart3, Users } from "lucide-react"
import { AdminAnalyticsCharts } from "@/components/Admin/AdminAnalyticsCharts"
import { TeacherManagement } from "@/components/Admin/TeacherManagement"

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

// Mock data for admin dashboard
const mockAdminData = {
  totalStudents: 1247,
  totalTeachers: 89,
  totalClasses: 156,
  attendanceRate: 92.5,
  departments: [
    { id: 1, name: "Computer Science", studentCount: 342, teacherCount: 12 },
    { id: 2, name: "Mathematics", studentCount: 278, teacherCount: 8 },
    { id: 3, name: "Physics", studentCount: 198, teacherCount: 6 },
    { id: 4, name: "Chemistry", studentCount: 167, teacherCount: 7 },
    { id: 5, name: "Biology", studentCount: 142, teacherCount: 5 },
  ],
  recentActivities: [
    { id: 1, type: "user_login", message: "Dr. Sarah Wilson logged in", timestamp: "2 minutes ago", status: "success" },
    { id: 2, type: "qr_generated", message: "QR code generated for CS201", timestamp: "5 minutes ago", status: "info" },
    { id: 3, type: "attendance_marked", message: "24 students marked attendance in MATH101", timestamp: "8 minutes ago", status: "success" },
    { id: 4, type: "low_attendance", message: "Low attendance alert for PHYS102 (65%)", timestamp: "15 minutes ago", status: "warning" },
  ]
}

export function AdminPortal({ user }: { user: User | null }) {
  const [activeTab, setActiveTab] = useState<"analytics" | "teachers">("analytics")

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center space-y-3 sm:space-y-4">
        <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-primary/10 rounded-full">
          <UserCog className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span className="text-base sm:text-lg font-semibold text-primary">Admin Portal</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold text-balance">Welcome, {user?.name || "Administrator"}!</h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty px-4">
          Manage the attendance system, faculty, and view comprehensive analytics
        </p>
      </div>

      <div className="flex justify-center px-4">
        <div className="flex bg-muted/50 rounded-xl p-1 sm:p-1.5 border w-full sm:w-auto">
          <Button
            variant={activeTab === "analytics" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("analytics")}
            className={`flex-1 sm:flex-none text-xs sm:text-sm ${activeTab === "analytics" ? "bg-primary text-primary-foreground shadow-sm" : ""}`}
          >
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Analytics & </span>Reports
          </Button>
          <Button
            variant={activeTab === "teachers" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("teachers")}
            className={`flex-1 sm:flex-none text-xs sm:text-sm ${activeTab === "teachers" ? "bg-primary text-primary-foreground shadow-sm" : ""}`}
          >
            <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Teacher </span>Management
          </Button>
        </div>
      </div>

      {activeTab === "analytics" ? 
        <AdminAnalyticsCharts /> : 
        <TeacherManagement />
      }
    </div>
  )
}