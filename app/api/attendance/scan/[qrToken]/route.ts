// pages/api/attendance/scan/[qrToken]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getQRToken, deleteQRToken } from "@/lib/attendance-store"
import { executeQuery } from "@/lib/db"

interface Student {
  student_id: number;
  first_name: string;
  last_name: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ qrToken: string }> }
) {
  try {
    // Await the params since it's a Promise in the App Router
    const { qrToken } = await params
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

    console.log("Received student_id:", student_id, "Type:", typeof student_id)
    console.log("QR Data students:", qrData?.students)
    console.log("Student enrolled check:", qrData?.students?.some((s) => {
      console.log("Comparing:", s.student_id, typeof s.student_id, "with", student_id, typeof student_id)
      console.log("Equal?", s.student_id === student_id)
      return s.student_id === student_id
    }))

    // Verify student is enrolled in this class
    const studentEnrolled = qrData.students?.some((s) => s.student_id === student_id)
    console.log("Scan:"+studentEnrolled+":Student_ID:"+student_id)
    if (!studentEnrolled) {
      return NextResponse.json({ error: 'Student not enrolled in this class' }, { status: 403 })
    }

    // Get student details
    const studentResultResponse = await executeQuery`
      SELECT first_name, last_name FROM students WHERE student_id = ${student_id}
    `
    const studentResult = studentResultResponse as unknown as Student[]

    if (studentResult.length === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const student = studentResult[0]

    // Record attendance - FIXED POSTGRESQL SYNTAX
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
      ON CONFLICT (teacher_id, subject_id, student_id, attendance_date)
      DO UPDATE SET 
        status = EXCLUDED.status,
        attendance_date = EXCLUDED.attendance_date
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