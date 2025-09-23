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

interface ClassData {
  schedule_id: number
  subject_id: number
  subject_name: string
  subject_code: string
  semester: number
  students: { student_id: number; first_name: string; last_name: string }[]
}

// Mock data
const mockClasses: ClassData[] = [
  {
    schedule_id: 1,
    subject_id: 1,
    subject_name: "Data Structures",
    subject_code: "CS201",
    semester: 1,
    students: [
      { student_id: 1, first_name: "Alice", last_name: "Johnson" },
      { student_id: 2, first_name: "Bob", last_name: "Smith" },
      { student_id: 3, first_name: "Charlie", last_name: "Brown" },
      { student_id: 4, first_name: "Diana", last_name: "Prince" },
      { student_id: 5, first_name: "Edward", last_name: "Nigma" },
    ],
  },
  {
    schedule_id: 2,
    subject_id: 2,
    subject_name: "Algorithms",
    subject_code: "CS301",
    semester: 2,
    students: [
      { student_id: 2, first_name: "Bob", last_name: "Smith" },
      { student_id: 3, first_name: "Charlie", last_name: "Brown" },
      { student_id: 6, first_name: "Fiona", last_name: "Gallagher" },
      { student_id: 7, first_name: "George", last_name: "Costanza" },
      { student_id: 8, first_name: "Helen", last_name: "Keller" },
    ],
  },
  {
    schedule_id: 3,
    subject_id: 3,
    subject_name: "Database Systems",
    subject_code: "CS401",
    semester: 3,
    students: [
      { student_id: 1, first_name: "Alice", last_name: "Johnson" },
      { student_id: 4, first_name: "Diana", last_name: "Prince" },
      { student_id: 5, first_name: "Edward", last_name: "Nigma" },
      { student_id: 9, first_name: "Ian", last_name: "Malcolm" },
      { student_id: 10, first_name: "Julia", last_name: "Roberts" },
    ],
  },
  {
    schedule_id: 4,
    subject_id: 4,
    subject_name: "Calculus I",
    subject_code: "MATH101",
    semester: 1,
    students: [
      { student_id: 1, first_name: "Alice", last_name: "Johnson" },
      { student_id: 2, first_name: "Bob", last_name: "Smith" },
      { student_id: 11, first_name: "Kevin", last_name: "Malone" },
      { student_id: 12, first_name: "Linda", last_name: "Belcher" },
      { student_id: 13, first_name: "Marty", last_name: "McFly" },
    ],
  },
]

export function TeacherPortal({ user }: { user: User | null }) {
  const [activeTab, setActiveTab] = useState<"qr-generator" | "attendance">("qr-generator")

  const teacherClassData = mockClasses.filter(cls => 
    cls.schedule_id.toString() === user?.teacherId?.toString()
  )

  // Group classes by semester
  const classesBySemester: Record<number, ClassData[]> = {}
  mockClasses.forEach(cls => {
    if (!classesBySemester[cls.semester]) {
      classesBySemester[cls.semester] = []
    }
    classesBySemester[cls.semester].push(cls)
  })

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
        <QRGenerator 
          teacherId={user?.teacherId?.toString() || "1"} 
          allClasses={mockClasses}
          classesBySemester={classesBySemester}
        />
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
                        key={cls.schedule_id} 
                        variant="outline" 
                        className="justify-between"
                      >
                        <span>{cls.subject_name} ({cls.subject_code})</span>
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
                    You don&apos;t have any classes assigned yet.
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