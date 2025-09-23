"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Calendar, BookOpen, ArrowLeft } from "lucide-react"

interface ClassData {
  schedule_id: number // This is now assignment_id from teacher_subject_assignments
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
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  // Get available semesters
  const availableSemesters = Array.from(new Set(allClasses.map(cls => cls.semester))).sort()
  
  // Get classes for selected semester
  const currentClasses = selectedSemester ? classesBySemester[Number(selectedSemester)] || [] : []

  const handleClassSelect = (cls: ClassData) => {
    setSelectedClass(cls)
  }

  const handleBackToClassList = () => {
    setSelectedClass(null)
  }

  const handleAttendanceSubmit = () => {
    // TODO: Implement attendance submission logic
    console.log("Attendance submitted for:", selectedClass, "on", attendanceDate)
  }

  // If no classes assigned
  if (allClasses.length === 0) {
    return (
      <div className="text-center text-muted-foreground px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Manual Attendance</CardTitle>
            <CardDescription>
              Manage attendance for your classes manually
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                You don't have any classes assigned yet.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Contact your administrator to assign classes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If a specific class is selected, show attendance interface
  if (selectedClass) {
    return (
      <div className="text-center text-muted-foreground px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBackToClassList}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Classes
              </Button>
            </div>
            <CardTitle className="text-left">
              {selectedClass.subject_name} ({selectedClass.subject_code})
            </CardTitle>
            <CardDescription className="text-left">
              Semester {selectedClass.semester} • {selectedClass.students.length} students enrolled
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Selection */}
            <div className="flex items-center gap-4">
              <label htmlFor="attendance-date" className="text-sm font-medium">
                Attendance Date:
              </label>
              <input
                id="attendance-date"
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            {/* Student List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-left">Mark Attendance</h3>
              <div className="grid gap-3">
                {selectedClass.students.map((student) => (
                  <div
                    key={student.student_id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="text-left">
                      <p className="font-medium">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ID: {student.student_id}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="default">
                        Present
                      </Button>
                      <Button size="sm" variant="outline">
                        Absent
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button onClick={handleAttendanceSubmit} className="w-full">
                Submit Attendance
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main class selection interface
  return (
    <div className="text-center text-muted-foreground px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Manual Attendance</CardTitle>
          <CardDescription>
            Select a class to manage attendance manually
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Semester Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-left block">Select Semester:</label>
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a semester" />
              </SelectTrigger>
              <SelectContent>
                {availableSemesters.map(sem => (
                  <SelectItem key={sem} value={sem.toString()}>
                    Semester {sem} ({classesBySemester[sem]?.length || 0} classes)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class Selection */}
          {selectedSemester && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select a class from Semester {selectedSemester}:
              </p>
              <div className="grid gap-3">
                {currentClasses.map((cls) => (
                  <Button
                    key={cls.schedule_id}
                    variant="outline"
                    className="justify-between h-auto p-4"
                    onClick={() => handleClassSelect(cls)}
                  >
                    <div className="text-left">
                      <div className="font-medium">
                        {cls.subject_name} ({cls.subject_code})
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Assignment ID: {cls.schedule_id}
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      <Users className="h-3 w-3 mr-1" />
                      {cls.students.length} students
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {selectedSemester && currentClasses.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No classes found for Semester {selectedSemester}.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}