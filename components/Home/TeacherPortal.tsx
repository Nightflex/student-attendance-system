// components/teacher-portal.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, Users } from "lucide-react"
import { QRGenerator } from "@/components/Teachers/QRGenerator"

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

// Mock data
const mockClasses = [
  {
    id: "1",
    name: "Data Structures",
    code: "CS201",
    teacherId: "1",
    teacherName: "Dr. Sarah Wilson",
    schedule: [
      { day: "Monday", startTime: "09:00", endTime: "10:30" },
      { day: "Wednesday", startTime: "09:00", endTime: "10:30" },
      { day: "Friday", startTime: "09:00", endTime: "10:30" },
    ],
    students: ["1", "2", "3", "4", "5"],
  },
  {
    id: "2",
    name: "Algorithms",
    code: "CS301",
    teacherId: "1",
    teacherName: "Dr. Sarah Wilson",
    schedule: [
      { day: "Tuesday", startTime: "14:00", endTime: "15:30" },
      { day: "Thursday", startTime: "14:00", endTime: "15:30" },
    ],
    students: ["2", "3", "6", "7", "8"],
  },
  {
    id: "3",
    name: "Database Systems",
    code: "CS401",
    teacherId: "1",
    teacherName: "Dr. Sarah Wilson",
    schedule: [
      { day: "Monday", startTime: "11:00", endTime: "12:30" },
      { day: "Wednesday", startTime: "11:00", endTime: "12:30" },
    ],
    students: ["1", "4", "5", "9", "10"],
  },
  {
    id: "4",
    name: "Calculus I",
    code: "MATH101",
    teacherId: "2",
    teacherName: "Prof. Michael Brown",
    schedule: [
      { day: "Tuesday", startTime: "11:00", endTime: "12:30" },
      { day: "Thursday", startTime: "11:00", endTime: "12:30" },
    ],
    students: ["1", "2", "11", "12", "13"],
  },
]

export function TeacherPortal({ user }: { user: User | null }) {
  const [activeTab, setActiveTab] = useState<"qr-generator" | "attendance">("qr-generator")

  const teacherClassData = mockClasses.filter(cls => 
    cls.teacherId?.toString() === user?.teacherId?.toString()
  )

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center space-y-3 sm:space-y-4">
        <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-primary/10 rounded-full">
          <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span className="text-base sm:text-lg font-semibold text-primary">Teacher Portal</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold text-balance">Welcome, {user?.name || "Teacher"}!</h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty px-4">
          Generate QR codes for attendance and manage your classes
        </p>
      </div>

      <div className="flex justify-center px-4">
        <div className="flex bg-muted/50 rounded-xl p-1 sm:p-1.5 border sm:w-auto flex-row gap-1.5 w-[110%] mr-0">
          <Button
            variant={activeTab === "qr-generator" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("qr-generator")}
            className={`flex-1 sm:flex-none text-xs sm:text-sm ${activeTab === "qr-generator" ? "bg-primary text-primary-foreground shadow-sm" : ""}`}
          >
            <QrCode className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            QR Generator
          </Button>
          <Button
            variant={activeTab === "attendance" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("attendance")}
            className={`flex-1 sm:flex-none text-xs sm:text-sm ${activeTab === "attendance" ? "bg-primary text-primary-foreground shadow-sm" : ""}`}
          >
            <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Manual Attendance
          </Button>
        </div>
      </div>

      {activeTab === "qr-generator" ? (
        <QRGenerator teacherId={user?.teacherId?.toString() || "1"} />
      ) : (
        <div className="text-center text-muted-foreground px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Manual Attendance</CardTitle>
              <CardDescription>
                Manage attendance for your classes manually
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teacherClassData.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Select a class to manage attendance manually:
                  </p>
                  <div className="grid gap-3">
                    {teacherClassData.map((cls) => (
                      <Button 
                        key={cls.id} 
                        variant="outline" 
                        className="justify-between"
                      >
                        <span>{cls.name} ({cls.code})</span>
                        <Badge variant="secondary">
                          {cls.students?.length || 0} students
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    You don't have any classes assigned yet.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Contact your administrator to assign classes.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}