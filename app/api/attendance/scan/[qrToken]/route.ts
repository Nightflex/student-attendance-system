import { NextRequest, NextResponse } from "next/server"
import { getQRToken, deleteQRToken } from "@/lib/attendance-store"
import { executeQuery } from "@/lib/db"

export async function POST(
  req: NextRequest,
  { params }: { params: { qrToken: string } }
) {
  try {
    const { qrToken } = params
    const { student_id } = await req.json()

    if (!student_id) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
    }

    // Get QR token data
    const qrData = await getQRToken(qrToken)
    
    if (!qrData) {
      return NextResponse.json({ error: 'Invalid or expired QR code' }, { status: 400 })
    }

    // Check if QR code has expired
    const now = new Date()
    const expiresAt = new Date(qrData.expiresAt)
    if (now > expiresAt) {
      await deleteQRToken(qrToken)
      return NextResponse.json({ error: 'QR code has expired' }, { status: 400 })
    }

    // Verify student is enrolled in this class
    const studentEnrolled = qrData.students?.some((s: any) => s.student_id === student_id)
    if (!studentEnrolled) {
      return NextResponse.json({ error: 'Student not enrolled in this class' }, { status: 403 })
    }

    // Get student details
    const studentResult = await executeQuery`
      SELECT first_name, last_name FROM students WHERE student_id = ${student_id}
    `
    
    if (studentResult.length === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const student = studentResult[0]

    // Record attendance
    const currentYear = new Date().getFullYear()
    const batchYear = currentYear - Math.floor((qrData.semester - 1) / 2)
    const currentDate = new Date().toISOString().split('T')[0]

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
        ${parseInt(qrData.teacherId)},
        ${qrData.subjectId},
        ${qrData.semester},
        ${batchYear},
        ${student_id},
        ${currentDate},
        'present'
      )
      ON DUPLICATE KEY UPDATE 
        status = VALUES(status),
        attendance_date = VALUES(attendance_date)
    `

    // Delete QR token after successful use
    await deleteQRToken(qrToken)

    return NextResponse.json({ 
      success: true,
      student: {
        student_id,
        first_name: student.first_name,
        last_name: student.last_name
      },
      session: qrData.sessionId
    })

  } catch (error) {
    console.error('Error processing attendance scan:', error)
    return NextResponse.json({ error: 'Failed to process attendance' }, { status: 500 })
  }
}