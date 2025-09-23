import { getSession, deleteSession } from "@/lib/attendance-store"
import { executeQuery } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    
    // Get session data
    const sessionData = await getSession(sessionId)
    if (!sessionData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Verify teacher authorization
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ') || authHeader.substring(7) !== sessionData.teacherId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mark all remaining students as absent if not already marked
    const currentDate = sessionData.date
    const currentYear = new Date().getFullYear()
    const batchYear = currentYear - Math.floor((sessionData.semester - 1) / 2)

    for (const student of sessionData.students) {
      // Use UPSERT to prevent race conditions
      await executeQuery`
        INSERT INTO attendance (
          teacher_id, 
          subject_id, 
          semester, 
          batch_year, 
          student_id, 
          attendance_date, 
          status
        )
        VALUES (
          ${parseInt(sessionData.teacherId)},
          ${sessionData.subjectId},
          ${sessionData.semester},
          ${batchYear},
          ${student.student_id},
          ${currentDate},
          'absent'
        )
        ON DUPLICATE KEY UPDATE status = VALUES(status)
      `
    }

    // Clean up session data
    await deleteSession(sessionId)

    return NextResponse.json({ 
      success: true, 
      message: 'Session finalized successfully' 
    })

  } catch (error) {
    console.error('Error finalizing session:', error)
    return NextResponse.json({ error: 'Failed to finalize session' }, { status: 500 })
  }
}