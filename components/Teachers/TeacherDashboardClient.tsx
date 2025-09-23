"use client"
import { useState } from "react"
import { TeacherDashboardHeader } from "@/components/Teachers/TeacherDashboardHeader"
import { TeacherNavigationTabs } from "@/components/Teachers/TeacherNavigationTabs"
import { ManualAttendance } from "@/components/Teachers/ManualAttendance"
import { QRGenerator } from "@/components/Teachers/QRGenerator"

// Mock data for ManualAttendance (you can keep this for now)
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
]

interface ClassData {
  schedule_id: number // This is now assignment_id from teacher_subject_assignments
  subject_id: number
  subject_name: string
  subject_code: string
  semester: number
  students: { student_id: number; first_name: string; last_name: string }[]
}

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

interface TeacherDashboardClientProps {
  user: User
  allClasses: ClassData[]
  classesBySemester: Record<number, ClassData[]>
}

export function TeacherDashboardClient({ user, allClasses, classesBySemester }: TeacherDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"qr-generator" | "attendance">("qr-generator")
  
  // Add debugging
  console.log("TeacherDashboardClient props:", { 
    user: user?.name, 
    allClassesLength: allClasses?.length, 
    classesBySemesterKeys: Object.keys(classesBySemester || {}) 
  })
  
  // Handle QR generation callback
  const handleQRGenerated = (qrData: any) => {
    console.log("QR Code generated:", qrData)
    // You can add additional logic here if needed
  }

  // Filter mock classes for ManualAttendance (you can update this to use real data later)
  const teacherClassData = mockClasses.filter(cls =>
    cls.teacherId?.toString() === user?.teacherId?.toString()
  )

  // Handle case where teacherId is undefined
  if (!user.teacherId) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <TeacherDashboardHeader user={user} />
        <div className="text-center py-8">
          <p className="text-red-500">Error: Teacher ID not found. Cannot load dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <TeacherDashboardHeader user={user} />
      <TeacherNavigationTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      {activeTab === "qr-generator" ? (
        <QRGenerator
          teacherId={user.teacherId.toString()}
          allClasses={allClasses}
          classesBySemester={classesBySemester}
          onQRGenerated={handleQRGenerated}
        />
      ) : (
        <ManualAttendance 
          allClasses={allClasses}
          classesBySemester={classesBySemester}
        />
      )}
    </div>
  )
}