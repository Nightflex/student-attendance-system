"use client"
import { useState } from "react"
import { TeacherDashboardHeader } from "@/components/Teachers/TeacherDashboardHeader"
import { TeacherNavigationTabs } from "@/components/Teachers/TeacherNavigationTabs"
import { ManualAttendance } from "@/components/Teachers/ManualAttendance"
import { QRGenerator } from "@/components/Teachers/QRGenerator"


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