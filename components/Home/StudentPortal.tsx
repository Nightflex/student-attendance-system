// components/student-portal.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, Users, BarChart3, Calendar, Clock } from "lucide-react"
import { QRScanner } from "@/components/Students/QRScanner"
import { StudentAttendanceHistory } from "@/components/Students/StudentAttendanceHistory"

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

interface ClassSchedule {
  day: string
  startTime: string
  endTime: string
}

interface Class {
  id: string
  name: string
  code: string
  teacherName?: string
  location?: string
  schedule?: ClassSchedule[]
  students?: string[]
}

// Mock data
const mockClasses: Class[] = [
  {
    id: "1",
    name: "Data Structures",
    code: "CS201",
    teacherName: "Dr. Sarah Wilson",
    location: "Room 204",
    schedule: [
      { day: "Monday", startTime: "09:00", endTime: "10:30" },
      { day: "Wednesday", startTime: "09:00", endTime: "10:30" },
      { day: "Friday", startTime: "09:00", endTime: "10:30" },
    ],
    students: ["1", "2", "3"],
  },
  {
    id: "2",
    name: "Calculus I",
    code: "MATH101",
    teacherName: "Prof. Michael Brown",
    location: "Room 301",
    schedule: [
      { day: "Tuesday", startTime: "11:00", endTime: "12:30" },
      { day: "Thursday", startTime: "11:00", endTime: "12:30" },
    ],
    students: ["1", "2"],
  },
  {
    id: "3",
    name: "Physics Lab",
    code: "PHYS102L",
    teacherName: "Dr. Emily Chen",
    location: "Lab 205",
    schedule: [
      { day: "Monday", startTime: "14:00", endTime: "16:00" },
    ],
    students: ["1", "3"],
  },
]

export function StudentPortal({ user }: { user: User | null }) {
  const [activeTab, setActiveTab] = useState<"scanner" | "history">("scanner")

  const handleScanSuccess = (data: any) => {
    // Handle scan success logic here
    console.log("Scan successful:", data)
  }

  const handleScanError = (error: string) => {
    console.error("Scan error:", error)
  }

  // Filter classes for current student
  const enrolledClasses = mockClasses.filter(cls => 
    cls.students?.includes(user?.id || "1")
  )

  // Get today's classes
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const todaysClasses = enrolledClasses.filter(cls => 
    cls.schedule?.some(schedule => schedule.day === today)
  )

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center space-y-3 sm:space-y-4">
        <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-primary/10 rounded-full">
          <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span className="text-base sm:text-lg font-semibold text-primary">Student Portal</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold text-balance">Welcome Back, {user?.name || "Student"}!</h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty px-4">
          Scan QR codes to mark your attendance and track your academic progress
        </p>
        {user && (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground px-4">
            <span>ID: {user.studentId}</span>
            <span className="hidden sm:inline">•</span>
            <span>{user.department}</span>
            <span className="hidden sm:inline">•</span>
            <span>Semester {user.semester}</span>
          </div>
        )}
      </div>

      <div className="flex justify-center px-4">
        <div className="flex bg-muted/50 rounded-xl p-1 sm:p-1.5 border w-full sm:w-auto">
          <Button
            variant={activeTab === "scanner" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("scanner")}
            className={`flex-1 sm:flex-none text-xs sm:text-sm ${activeTab === "scanner" ? "bg-primary text-primary-foreground shadow-sm" : ""}`}
          >
            <QrCode className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            QR Scanner
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("history")}
            className={`flex-1 sm:flex-none text-xs sm:text-sm ${activeTab === "history" ? "bg-primary text-primary-foreground shadow-sm" : ""}`}
          >
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Attendance </span>History
          </Button>
        </div>
      </div>

      {activeTab === "scanner" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2">
            <QRScanner 
              studentId={user?.id || "1"} 
              onScanSuccess={handleScanSuccess} 
              onScanError={handleScanError} 
            />
          </div>

          <div className="space-y-4 sm:space-y-6">
            <Card className="border-2">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Today&apos;s Schedule
                </CardTitle>
                <CardDescription className="text-sm">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todaysClasses.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {todaysClasses.slice(0, 3).map((cls, index) => (
                      <div 
                        key={cls.id} 
                        className={`relative p-3 sm:p-4 rounded-xl border ${
                          index === 0 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800' 
                            : index === 1 
                              ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800' 
                              : 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-800'
                        }`}
                      >
                        <div className="absolute top-2 right-2">
                          <Badge 
                            className={
                              index === 0 
                                ? 'bg-green-500 text-white' 
                                : index === 1 
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }
                          >
                            {index === 0 ? 'Completed' : index === 1 ? 'Now' : 'Upcoming'}
                          </Badge>
                        </div>
                        <div className="pr-16 sm:pr-20">
                          <div className="font-semibold text-base sm:text-lg">{cls.name}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            {cls.teacherName || 'TBA'} • {cls.location || 'Room TBA'}
                          </div>
                          <div className="text-xs sm:text-sm font-medium mt-1">
                            {cls.schedule?.find(s => s.day === today)?.startTime || '09:00'} - 
                            {cls.schedule?.find(s => s.day === today)?.endTime || '10:30'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No classes scheduled for today</p>
                    <p className="text-sm mt-2">Check with your department for class updates</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Attendance Rate</span>
                    <span className="text-xl sm:text-2xl font-bold text-primary">85%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "85%" }}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs sm:text-sm">Classes Attended</div>
                      <div className="font-semibold">12 / 15</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs sm:text-sm">Perfect Days</div>
                      <div className="font-semibold">3 / 5</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <StudentAttendanceHistory studentId={user?.id || "1"} />
      )}
    </div>
  )
}