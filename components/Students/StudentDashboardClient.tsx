"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { StudentDashboardHeader } from "@/components/Students/StudentDashboardHeader"
import { StudentNavigationTabs } from "@/components/Students/StudentNavigationTabs"
import { TodaysSchedule } from "@/components/Students/TodaysSchedule"
import { WeeklyAttendanceStats } from "@/components/Students/WeeklyAttendanceStats"
import { QRScanner } from "@/components/Students/QRScanner"
import { StudentAttendanceHistory } from "@/components/Students/StudentAttendanceHistory"
import { StudentClass } from "@/lib/types"

interface AttendanceRecord {
  id: string
  studentId: string
  status: "present" | "late" | "absent"
  date: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface TimetableClass {
  code: string
  name: string
  teacherName: string
  day: string
  startTime: string
  endTime: string
}

export function StudentDashboardClient({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<"scanner" | "history">("scanner")
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [isLoadingAttendance] = useState(false) // Marked as unused but kept for future use
  const [enrolledClasses, setEnrolledClasses] = useState<StudentClass[]>([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get(`/api/student/${user.id}/attendance`)
        if (res.data.success) setAttendanceRecords(res.data.data)
      } catch (err) {
        console.error("Failed to fetch attendance:", err)
      }
    }

    const fetchClasses = async () => {
      try {
        const res = await axios.get(`/api/student/${user.id}/timetable`);
        if (res.data.success) {
          // Convert timetable data into the format TodaysSchedule expects
          const grouped: Record<string, StudentClass> = {};
          res.data.data.forEach((cls: TimetableClass) => {
            if (!grouped[cls.code]) {
              grouped[cls.code] = {
                id: cls.code,
                name: cls.name,
                code: cls.code,
                teacherName: cls.teacherName,
                location: "Room TBA",
                schedule: [],
                students: [user.id],
              };
            }
            grouped[cls.code].schedule.push({ day: cls.day, startTime: cls.startTime, endTime: cls.endTime });
          });

          setEnrolledClasses(Object.values(grouped));
        }
      } catch (err) {
        console.error("Failed to fetch timetable:", err);
      }
    };

    fetchClasses()
    fetchAttendance()
  }, [user.id])

  const handleScanSuccess = (data: unknown) => {
    console.log("QR scanned:", data)
  }

  const handleScanError = (error: string) => {
    console.error("QR scan error:", error)
  }

  return (
    <div className="space-y-6 sm:space-y-8 pt-10">
      <StudentDashboardHeader user={user} />
      <StudentNavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />

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
            <TodaysSchedule classes={enrolledClasses} />
            <WeeklyAttendanceStats attendanceRecords={attendanceRecords} />
          </div>
        </div>
      ) : (
        <StudentAttendanceHistory studentId={user.id} />
      )}
    </div>
  )
}