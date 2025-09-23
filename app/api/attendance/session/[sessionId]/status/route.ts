import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getSession, updateSessionAttendance } from "@/lib/attendance-store"

interface Student {
  student_id: number;
  first_name: string;
  last_name: string;
}

interface DatabaseAttendanceRecord {
  student_id: number;
  first_name: string;
  last_name: string;
  status: string;
  attendance_date: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    
    // Get session data from Redis
    const sessionData = await getSession(sessionId)
    
    if (!sessionData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Verify teacher authorization (could be done with JWT in header)
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ') || authHeader.substring(7) !== sessionData.teacherId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch current attendance from database for this session
    const currentDate = sessionData.date
    const attendanceRecordsResult = await executeQuery`
      SELECT 
        a.student_id,
        s.first_name,
        s.last_name,
        a.status,
        a.attendance_date
      FROM attendance a
      JOIN students s ON a.student_id = s.student_id
      WHERE a.teacher_id = ${parseInt(sessionData.teacherId)}
      AND a.subject_id = ${sessionData.subjectId}
      AND a.attendance_date = ${currentDate}
    `

    // Type the database results properly
    const attendanceRecords = attendanceRecordsResult as unknown as DatabaseAttendanceRecord[]

    // Create a map of attendance records
    const attendanceMap = new Map<string, DatabaseAttendanceRecord>()
    attendanceRecords.forEach((record) => {
      attendanceMap.set(record.student_id.toString(), record)
    })

    // Update attendance list with current status
    const updatedAttendanceList = sessionData.students.map((student: Student) => {
      const attendanceRecord = attendanceMap.get(student.student_id.toString())
      const status: "present" | "absent" =
        attendanceRecord && (attendanceRecord.status === "present" || attendanceRecord.status === "absent")
          ? (attendanceRecord.status as "present" | "absent")
          : "absent"
      return {
        student_id: student.student_id,
        first_name: student.first_name,
        last_name: student.last_name,
        status,
        marked_at: attendanceRecord ? attendanceRecord.attendance_date : null
      }
    })

    // Update session data in Redis
    await updateSessionAttendance(sessionId, updatedAttendanceList)

    return NextResponse.json({ 
      success: true,
      attendanceList: updatedAttendanceList,
      sessionInfo: {
        sessionId,
        subject_id: sessionData.subjectId,
        total_students: sessionData.students.length,
        present_count: updatedAttendanceList.filter(s => s.status === 'present').length
      }
    })

  } catch (error) {
    console.error('Error fetching session status:', error)
    return NextResponse.json({ error: 'Failed to fetch session status' }, { status: 500 })
  }
}