// components/teachers/qr-generator.tsx
"use client"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import QRCodeLib from "qrcode"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrCode, RefreshCw, Clock, Users, Download, CheckCircle, UserCheck } from "lucide-react"

interface QRGeneratorProps {
  teacherId: string
  allClasses: ClassData[]
  classesBySemester: Record<number, ClassData[]>
  onQRGenerated?: (qrData: unknown) => void
}

export interface ClassData {
  schedule_id: number
  subject_id: number
  subject_name: string
  subject_code: string
  semester: number
  students: { student_id: number; first_name: string; last_name: string }[]
}

interface AttendanceStatus {
  student_id: number
  first_name: string
  last_name: string
  status: 'present' | 'absent'
  marked_at?: string
}

interface QRTokenData {
  sessionId: string
  qrToken: string
  assignmentId: number
  subjectId: number
  teacherId: string
  semester: number
  qrNumber: number
  generatedAt: string
  expiresAt: string
  type: string
  scanUrl: string
}

export function QRGenerator({ teacherId, allClasses, classesBySemester, onQRGenerated }: QRGeneratorProps) {
  // Always initialize hooks at the top level
  const [selectedSemester, setSelectedSemester] = useState<string>("1")
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [qrDataURL, setQrDataURL] = useState<string>("")
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [currentQRNumber, setCurrentQRNumber] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [sessionId, setSessionId] = useState<string>("")
  const [attendanceList, setAttendanceList] = useState<AttendanceStatus[]>([])
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const regenerationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const attendancePollingRef = useRef<NodeJS.Timeout | null>(null)
  
  const sessionDuration = 480 // 8 minutes in seconds
  const qrLifetime = 3 // 3 seconds per QR code

  const currentClasses = classesBySemester[Number(selectedSemester)] || []

  useEffect(() => {
    setSelectedClass("")
  }, [selectedSemester])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSessionActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            stopAttendanceSession()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isSessionActive, timeRemaining, stopAttendanceSession])

  const pollAttendanceUpdates = async (currentSessionId: string) => {
    try {
      const response = await fetch(`/api/attendance/session/${currentSessionId}/status`, {
        headers: {
          'Authorization': `Bearer ${teacherId}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setAttendanceList(data.attendanceList || [])
      }
    } catch (error) {
      console.error('Error polling attendance:', error)
    }
  }

  const generateSingleQR = async (currentSessionId: string, qrNumber: number): Promise<boolean> => {
    if (!selectedClass) return false
    const selectedClassData = currentClasses.find(c => c.schedule_id.toString() === selectedClass)
    if (!selectedClassData) return false

    setIsGeneratingQR(true)
    try {
      const qrToken = `${currentSessionId}_${qrNumber}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const attendanceData: QRTokenData = {
        sessionId: currentSessionId,
        qrToken,
        assignmentId: selectedClassData.schedule_id,
        subjectId: selectedClassData.subject_id,
        teacherId,
        semester: selectedClassData.semester,
        qrNumber,
        generatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + qrLifetime * 1000).toISOString(),
        type: "attendance",
        scanUrl: `/api/attendance/scan/${qrToken}`
      }

      const qrString = JSON.stringify(attendanceData)
      
      // Register QR token first
      const registerResponse = await fetch('/api/attendance/register-qr', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${teacherId}`
        },
        body: JSON.stringify(attendanceData)
      })

      if (!registerResponse.ok) {
        throw new Error('Failed to register QR token')
      }

      // Generate QR code only after successful registration
      const qrURL = await QRCodeLib.toDataURL(qrString, { width: 256, margin: 2 })
      
      setQrDataURL(qrURL)
      setCurrentQRNumber(qrNumber)
      onQRGenerated?.(attendanceData)
      
      return true
    } catch (error) {
      console.error('Error generating QR:', error)
      return false
    } finally {
      setIsGeneratingQR(false)
    }
  }

  const initializeAttendanceSession = async (currentSessionId: string, selectedClassData: ClassData) => {
    try {
      const response = await fetch('/api/attendance/initialize-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${teacherId}`
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          teacherId,
          subjectId: selectedClassData.subject_id,
          semester: selectedClassData.semester,
          assignmentId: selectedClassData.schedule_id,
          students: selectedClassData.students,
          date: new Date().toISOString().split('T')[0]
        })
      })

      if (!response.ok) {
        throw new Error('Failed to initialize session')
      }

      const data = await response.json()
      setAttendanceList(data.attendanceList || [])
      return true
    } catch (error) {
      console.error('Error initializing session:', error)
      return false
    }
  }

  const startAttendanceSession = async () => {
    if (!selectedClass) return
    
    const selectedClassData = currentClasses.find(c => c.schedule_id.toString() === selectedClass)
    if (!selectedClassData) return

    const newSessionId = `session_${teacherId}_${selectedClass}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setSessionId(newSessionId)
    setIsSessionActive(true)
    setTimeRemaining(sessionDuration)
    setCurrentQRNumber(0)

    // Initialize attendance session
    const initSuccess = await initializeAttendanceSession(newSessionId, selectedClassData)
    if (!initSuccess) {
      stopAttendanceSession()
      return
    }

    let qrCounter = 1
    const firstQRSuccess = await generateSingleQR(newSessionId, qrCounter)
    if (!firstQRSuccess) {
      stopAttendanceSession()
      return
    }

    // Generate new QR every 3 seconds
    regenerationIntervalRef.current = setInterval(async () => {
      qrCounter++
      await generateSingleQR(newSessionId, qrCounter)
    }, qrLifetime * 1000)

    // Poll for attendance updates every 2 seconds
    attendancePollingRef.current = setInterval(() => {
      pollAttendanceUpdates(newSessionId)
    }, 2000)
  }

  function stopAttendanceSession() {
    setIsSessionActive(false)
    setQrDataURL("")
    setCurrentQRNumber(0)
    setIsGeneratingQR(false)
    
    if (regenerationIntervalRef.current) {
      clearInterval(regenerationIntervalRef.current)
      regenerationIntervalRef.current = null
    }
    
    if (attendancePollingRef.current) {
      clearInterval(attendancePollingRef.current)
      attendancePollingRef.current = null
    }

    // Finalize session on server
    if (sessionId) {
      try {
        fetch(`/api/attendance/finalize-session/${sessionId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${teacherId}`
          }
        }).catch(error => {
          console.error('Error finalizing session:', error)
        })
      } catch (error) {
        console.error('Error finalizing session:', error)
      }
    }

    setSessionId("")
    setAttendanceList([])
  }

  useEffect(() => {
    return () => {
      if (regenerationIntervalRef.current) clearInterval(regenerationIntervalRef.current)
      if (attendancePollingRef.current) clearInterval(attendancePollingRef.current)
    }
  }, [])

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`

  const downloadQRCode = () => {
    if (!qrDataURL) return
    const link = document.createElement("a")
    link.href = qrDataURL
    link.download = `attendance-qr-${selectedClass}-${Date.now()}.png`
    link.click()
  }

  const availableSemesters = Array.from(new Set(allClasses.map(cls => cls.semester))).sort()
  const selectedClassData = currentClasses.find(c => c.schedule_id.toString() === selectedClass)
  const presentCount = attendanceList.filter(a => a.status === 'present').length
  const totalStudents = selectedClassData?.students.length || 0

  if (!teacherId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Secure QR Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>Teacher ID not available. Cannot generate QR codes.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Live QR Generator
          </CardTitle>
          <CardDescription>
            Total Classes: {allClasses.length} | Current Semester: {currentClasses.length} classes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedSemester} onValueChange={setSelectedSemester} disabled={isSessionActive}>
            <SelectTrigger><SelectValue placeholder="Select semester" /></SelectTrigger>
            <SelectContent>
              {availableSemesters.length > 0 ? (
                availableSemesters.map(sem => (
                  <SelectItem key={sem} value={sem.toString()}>
                    Semester {sem} ({classesBySemester[sem]?.length || 0} classes)
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-semesters" disabled>No classes assigned</SelectItem>
              )}
            </SelectContent>
          </Select>

          <Select value={selectedClass} onValueChange={setSelectedClass} disabled={isSessionActive}>
            <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
            <SelectContent>
              {currentClasses.length > 0 ? (
                currentClasses.map(cls => (
                  <SelectItem key={cls.schedule_id} value={cls.schedule_id.toString()}>
                    {cls.subject_name} ({cls.subject_code}) - {cls.students.length} students
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-classes" disabled>No classes found for this semester</SelectItem>
              )}
            </SelectContent>
          </Select>

          {isSessionActive && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <div className="flex justify-between items-center">
                  <span>QR #{currentQRNumber} | {formatTime(timeRemaining)}</span>
                  <Badge variant="secondary">
                    {presentCount}/{totalStudents} Present
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="aspect-square bg-white border-2 border-dashed rounded-lg flex items-center justify-center relative">
            {isSessionActive && qrDataURL ? (
              <div className="text-center">
                {/* Using next/image as recommended */}
                <div className="w-48 h-48 mx-auto flex items-center justify-center">
                  <Image 
                    src={qrDataURL} 
                    alt="QR Code" 
                    width={192} 
                    height={192}
                    unoptimized
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Expires in {qrLifetime} seconds • Auto-refreshing
                </p>
                {isGeneratingQR && (
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
                    <RefreshCw className="h-8 w-8 text-white animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {allClasses.length === 0 ? "No classes assigned" : "Select a class to start"}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!isSessionActive ? (
              <Button 
                onClick={startAttendanceSession} 
                disabled={!selectedClass || currentClasses.length === 0 || isGeneratingQR} 
                className="flex-1"
              >
                {isGeneratingQR ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Starting Session...
                  </>
                ) : (
                  "Start 8-Minute Session"
                )}
              </Button>
            ) : (
              <>
                <Button onClick={stopAttendanceSession} variant="destructive" className="flex-1">
                  Stop Session
                </Button>
                <Button variant="outline" size="icon" onClick={downloadQRCode} disabled={isGeneratingQR}>
                  <Download className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {isSessionActive && selectedClassData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Live Attendance
            </CardTitle>
            <CardDescription>
              {selectedClassData.subject_name} ({selectedClassData.subject_code})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {attendanceList.length > 0 ? (
                attendanceList.map((student) => (
                  <div
                    key={student.student_id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      student.status === 'present'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div>
                      <p className="font-medium">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-sm text-gray-500">ID: {student.student_id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {student.status === 'present' ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Present
                          </Badge>
                        </>
                      ) : (
                        <Badge variant="outline">Absent</Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <p>Waiting for students to scan...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}