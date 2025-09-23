// components/teachers/manual-attendance.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"

interface ClassData {
  schedule_id: number
  subject_id: number
  subject_name: string
  subject_code: string
  semester: number
  students: { student_id: number; first_name: string; last_name: string }[]
}

interface ManualAttendanceProps {
  allClasses: ClassData[]
  classesBySemester: Record<number, ClassData[]>
}

export function ManualAttendance({ allClasses, classesBySemester }: ManualAttendanceProps) {
  const [selectedSemester, setSelectedSemester] = useState<string>("")
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [attendance, setAttendance] = useState<Record<number, 'present' | 'absent'>>({})

  const semesters = Object.keys(classesBySemester).sort((a, b) => Number(a) - Number(b))
  const currentClasses = selectedSemester ? classesBySemester[Number(selectedSemester)] || [] : []

  const handleAttendanceChange = (studentId: number, status: 'present' | 'absent') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }))
  }

  const handleSubmit = () => {
    console.log("Attendance submitted:", attendance)
    // Here you would typically send the attendance data to your API
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manual Attendance
          </CardTitle>
          <CardDescription>
            Mark attendance manually for your classes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => {
                  setSelectedSemester(e.target.value)
                  setSelectedClass("")
                }}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Choose a semester</option>
                {semesters.map(sem => (
                  <option key={sem} value={sem}>
                    Semester {sem} ({classesBySemester[Number(sem)]?.length || 0} classes)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={!selectedSemester}
                className="w-full p-2 border rounded-md disabled:opacity-50"
              >
                <option value="">Choose a class</option>
                {currentClasses.map(cls => (
                  <option key={cls.schedule_id} value={cls.schedule_id}>
                    {cls.subject_name} ({cls.subject_code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedClass && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  {currentClasses.find(c => c.schedule_id === Number(selectedClass))?.subject_name}
                </h3>
                <Button onClick={handleSubmit}>Submit Attendance</Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3">Student</th>
                      <th className="text-center p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentClasses
                      .find(c => c.schedule_id === Number(selectedClass))
                      ?.students.map(student => (
                        <tr key={student.student_id} className="border-b last:border-b-0">
                          <td className="p-3">
                            {student.first_name} {student.last_name}
                            <div className="text-sm text-muted-foreground">ID: {student.student_id}</div>
                          </td>
                          <td className="p-3">
                            <div className="flex justify-center gap-2">
                              <Button
                                variant={attendance[student.student_id] === 'present' ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleAttendanceChange(student.student_id, 'present')}
                              >
                                Present
                              </Button>
                              <Button
                                variant={attendance[student.student_id] === 'absent' ? "destructive" : "outline"}
                                size="sm"
                                onClick={() => handleAttendanceChange(student.student_id, 'absent')}
                              >
                                Absent
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!selectedClass && allClasses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>You don&apos;t have any classes assigned yet.</p>
              <p className="text-sm mt-2">Contact your administrator to assign classes.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}