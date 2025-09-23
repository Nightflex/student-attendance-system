// pages/api/attendance/session/[sessionId]/status/route.ts
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
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Await the params since it's a Promise in the App Router
    const { sessionId } = await params
    console.log("Session status request for:", sessionId);
    
    // Get session data from memory
    const sessionData = await getSession(sessionId)
    
    if (!sessionData) {
      console.log("Session not found:", sessionId);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Verify teacher authorization
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ') || authHeader.substring(7) !== sessionData.teacherId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch current attendance from database for this session
    const currentDate = sessionData.date
    console.log("Fetching attendance for:", {
      teacherId: sessionData.teacherId,
      subjectId: sessionData.subjectId,
      date: currentDate
    });

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
      ORDER BY a.attendance_date DESC
    `

    // Type the database results properly
    const attendanceRecords = attendanceRecordsResult as unknown as DatabaseAttendanceRecord[]

    // Create a map of attendance records (latest record per student)
    const attendanceMap = new Map<string, DatabaseAttendanceRecord>()
    attendanceRecords.forEach((record) => {
      // Only keep the first (latest) record for each student
      if (!attendanceMap.has(record.student_id.toString())) {
        attendanceMap.set(record.student_id.toString(), record)
      }
    })

    console.log("Database attendance records:", Array.from(attendanceMap.entries()));

    // Update attendance list with current status from database
    const updatedAttendanceList = sessionData.students.map((student: Student) => {
      const attendanceRecord = attendanceMap.get(student.student_id.toString())
      const status: "present" | "absent" = 
        attendanceRecord?.status === "present" ? "present" : "absent"
      
      return {
        student_id: student.student_id,
        first_name: student.first_name,
        last_name: student.last_name,
        status,
        marked_at: attendanceRecord ? attendanceRecord.attendance_date : null
      }
    })

    console.log("Updated attendance list:", updatedAttendanceList);

    // CRITICAL: Update session data in memory with the latest attendance data
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