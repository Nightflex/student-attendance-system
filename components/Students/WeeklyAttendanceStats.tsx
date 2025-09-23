"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import { useMemo } from "react"

interface AttendanceRecord {
  id: string
  studentId: string
  status: "present" | "late" | "absent"
  date: string
}

interface WeeklyAttendanceStatsProps {
  attendanceRecords: AttendanceRecord[]
}

export function WeeklyAttendanceStats({ attendanceRecords }: WeeklyAttendanceStatsProps) {
  // Compute stats for this week
  const stats = useMemo(() => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const thisWeekRecords = attendanceRecords.filter(r => new Date(r.date) >= oneWeekAgo)
    const totalClasses = thisWeekRecords.length
    const attendedClasses = thisWeekRecords.filter(r => r.status === "present" || r.status === "late").length
    const perfectDays = thisWeekRecords.filter(r => r.status === "present").length

    const attendanceRate = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0

    return { totalClasses, attendedClasses, perfectDays, attendanceRate }
  }, [attendanceRecords])

  return (
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
            <span className="text-xl sm:text-2xl font-bold text-primary">{stats.attendanceRate}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: `${stats.attendanceRate}%` }}></div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div>
              <div className="text-muted-foreground text-xs sm:text-sm">Classes Attended</div>
              <div className="font-semibold">{stats.attendedClasses} / {stats.totalClasses}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs sm:text-sm">Perfect Days</div>
              <div className="font-semibold">{stats.perfectDays} / {stats.totalClasses}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
