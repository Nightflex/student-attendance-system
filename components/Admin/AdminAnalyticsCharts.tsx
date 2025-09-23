// components/admin-analytics-charts.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, TrendingDown, Download, Filter } from "lucide-react"
import { useState } from "react"

// Mock data types
interface WeeklyTrend {
  day: string
  percentage: number
  students: number
}

interface DepartmentStat {
  name: string
  students: number
  attendance: number
  trend: "up" | "down"
}

interface TimeSlotStat {
  time: string
  classes: number
  attendance: number
}

interface MockAnalyticsData {
  weeklyTrends: WeeklyTrend[]
  departmentStats: DepartmentStat[]
  timeSlotStats: TimeSlotStat[]
  averageAttendance: number
  peakDay: string
}

// Mock data
const mockAnalyticsData: MockAnalyticsData = {
  weeklyTrends: [
    { day: "Mon", percentage: 85, students: 1200 },
    { day: "Tue", percentage: 88, students: 1220 },
    { day: "Wed", percentage: 82, students: 1180 },
    { day: "Thu", percentage: 90, students: 1250 },
    { day: "Fri", percentage: 78, students: 1150 },
    { day: "Sat", percentage: 92, students: 1100 },
    { day: "Sun", percentage: 75, students: 980 },
  ],
  departmentStats: [
    { name: "Computer Science", students: 342, attendance: 88, trend: "up" },
    { name: "Mathematics", students: 278, attendance: 85, trend: "down" },
    { name: "Physics", students: 198, attendance: 82, trend: "up" },
    { name: "Chemistry", students: 167, attendance: 79, trend: "down" },
    { name: "Biology", students: 142, attendance: 84, trend: "up" },
  ],
  timeSlotStats: [
    { time: "8:00 AM - 9:30 AM", classes: 12, attendance: 87 },
    { time: "9:45 AM - 11:15 AM", classes: 15, attendance: 85 },
    { time: "11:30 AM - 1:00 PM", classes: 18, attendance: 82 },
    { time: "1:15 PM - 2:45 PM", classes: 14, attendance: 79 },
    { time: "3:00 PM - 4:30 PM", classes: 10, attendance: 84 },
    { time: "4:45 PM - 6:15 PM", classes: 8, attendance: 81 },
  ],
  averageAttendance: 84,
  peakDay: "Saturday",
}

interface AdminAnalyticsChartsProps {
  mockData?: MockAnalyticsData
}

export function AdminAnalyticsCharts({ mockData = mockAnalyticsData }: AdminAnalyticsChartsProps) {
  const [timeRange, setTimeRange] = useState("week")
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    setIsExporting(true)
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false)
      // In a real app, this would trigger a file download
      alert("Report exported successfully!")
    }, 1000)
  }

  const {
    weeklyTrends,
    departmentStats,
    timeSlotStats,
    averageAttendance,
    peakDay
  } = mockData

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="semester">This Semester</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Export Report"}
        </Button>
      </div>

      {/* Weekly Attendance Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Weekly Attendance Trends
          </CardTitle>
          <CardDescription>Daily attendance patterns across all classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {weeklyTrends.map((day) => (
                <div key={day.day} className="text-center">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">{day.day}</div>
                  <div className="relative h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-end justify-center p-2">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-sm flex items-end justify-center text-white text-xs font-medium transition-all duration-300 hover:opacity-90"
                      style={{ height: `${day.percentage}%` }}
                    >
                      {day.percentage}%
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{day.students} students</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Attendance Rate</span>
              </div>
              <div className="text-gray-500">
                Average: {averageAttendance}% | Peak: {peakDay}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
          <CardDescription>Attendance rates by academic department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentStats.map((dept) => (
              <div
                key={dept.name}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-1 mb-3 sm:mb-0">
                  <h4 className="font-medium">{dept.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{dept.students} students enrolled</p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="text-right">
                    <div className="text-lg font-semibold">{dept.attendance}%</div>
                    <div className="flex items-center gap-1 text-xs">
                      {dept.trend === "up" ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span className={dept.trend === "up" ? "text-green-600" : "text-red-600"}>
                        {dept.trend === "up" ? "+2.1%" : "-1.3%"}
                      </span>
                    </div>
                  </div>

                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${dept.attendance}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Slot Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Time Slot Analysis</CardTitle>
          <CardDescription>Attendance patterns by class timing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {timeSlotStats.slice(0, Math.ceil(timeSlotStats.length / 2)).map((slot) => (
                <div
                  key={slot.time}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="mb-2 sm:mb-0">
                    <div className="font-medium">{slot.time}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{slot.classes} classes</div>
                  </div>
                  <div className="text-right w-full sm:w-auto">
                    <div className="font-semibold">{slot.attendance}%</div>
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                      <div 
                        className="bg-green-500 h-1 rounded-full transition-all duration-500" 
                        style={{ width: `${slot.attendance}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {timeSlotStats.slice(Math.ceil(timeSlotStats.length / 2)).map((slot) => (
                <div
                  key={slot.time}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="mb-2 sm:mb-0">
                    <div className="font-medium">{slot.time}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{slot.classes} classes</div>
                  </div>
                  <div className="text-right w-full sm:w-auto">
                    <div className="font-semibold">{slot.attendance}%</div>
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                      <div 
                        className="bg-green-500 h-1 rounded-full transition-all duration-500" 
                        style={{ width: `${slot.attendance}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}