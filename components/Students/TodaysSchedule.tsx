"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import { StudentClass } from "@/lib/types"

export function TodaysSchedule({ classes }: { classes: StudentClass[] }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const now = new Date()

  // Filter today's classes
  const todaysClasses = classes.filter(cls => 
    cls.schedule?.some(schedule => schedule.day === today)
  )

  // Determine badge status for each class
  const getBadgeStatus = (schedule: { startTime: string, endTime: string }) => {
    const [startHour, startMinute] = schedule.startTime.split(':').map(Number)
    const [endHour, endMinute] = schedule.endTime.split(':').map(Number)
    const start = new Date()
    start.setHours(startHour, startMinute, 0, 0)
    const end = new Date()
    end.setHours(endHour, endMinute, 0, 0)

    if (now < start) return 'Upcoming'
    if (now >= start && now <= end) return 'Now'
    return 'Completed'
  }

  return (
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
            {todaysClasses.map(cls => {
              const schedule = cls.schedule.find(s => s.day === today)
              const status = schedule ? getBadgeStatus(schedule) : 'Upcoming'

              const badgeClass = status === 'Completed'
                ? 'bg-green-500 text-white'
                : status === 'Now'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'

              return (
                <div 
                  key={cls.id} 
                  className={`relative p-3 sm:p-4 rounded-xl border ${
                    status === 'Completed'
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
                      : status === 'Now'
                        ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800'
                        : 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <div className="absolute top-2 right-2">
                    <Badge className={badgeClass}>{status}</Badge>
                  </div>
                  <div className="pr-16 sm:pr-20">
                    <div className="font-semibold text-base sm:text-lg">{cls.name}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {cls.teacherName || 'TBA'} • {cls.location || 'Room TBA'}
                    </div>
                    <div className="text-xs sm:text-sm font-medium mt-1">
                      {schedule?.startTime || '09:00'} - {schedule?.endTime || '10:30'}
                    </div>
                  </div>
                </div>
              )
            })}
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
  )
}