import { NextRequest, NextResponse } from "next/server"
import { storeSession, SessionData } from "@/lib/attendance-store"

export async function POST(req: NextRequest) {
  try {
    const { sessionId, teacherId, subjectId, semester, assignmentId, students, date } = await req.json()

    // Verify teacher authorization
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ') || authHeader.substring(7) !== teacherId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate required fields
    if (!sessionId || !teacherId || !subjectId || !students || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Initialize attendance list with all students as absent
    const attendanceList = students.map((student: { student_id: number; first_name: string; last_name: string }) => ({
      student_id: student.student_id,
      first_name: student.first_name,
      last_name: student.last_name,
      status: 'absent' as const,
      marked_at: null
    }))

    // Store session data
    const sessionData: SessionData = {
      teacherId: teacherId.toString(),
      subjectId,
      semester: semester ?? 0,
      assignmentId: assignmentId ?? 0,
      students,
      date,
      startTime: new Date().toISOString(),
      attendanceList
    }

    await storeSession(sessionId, sessionData)

    return NextResponse.json({ 
      success: true, 
      attendanceList,
      sessionId 
    })

  } catch (error) {
    console.error('Error initializing session:', error)
    return NextResponse.json({ error: 'Failed to initialize session' }, { status: 500 })
  }
}