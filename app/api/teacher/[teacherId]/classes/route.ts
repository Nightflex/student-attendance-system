import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

interface StudentEnrollment {
  student_id: number;
  first_name: string;
  last_name: string;
}

interface ClassData {
  schedule_id: number;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  semester: number;
  students: { student_id: number; first_name: string; last_name: string }[];
}

export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    // Await the params since it's a Promise in the App Router
    const { teacherId: teacherIdParam } = await params;
    const teacherId = Number(teacherIdParam);
    const semester = req.nextUrl.searchParams.get("semester")
    
    console.log("API called with:", { teacherId, semester, isValidTeacherId: !isNaN(teacherId) })
    
    if (!teacherId || isNaN(teacherId)) {
      return NextResponse.json({ error: "Invalid teacher ID" }, { status: 400 })
    }
    
    // Check if teacher exists
    const teacherExists = await executeQuery`
      SELECT teacher_id FROM teachers WHERE teacher_id = ${teacherId} LIMIT 1
    ` as unknown as { teacher_id: number }[];
    
    if (!teacherExists || teacherExists.length === 0) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }
    
    // MAIN FIX: Use class_schedule instead of teacher_subject_assignments
    const classesResult = await executeQuery`
      SELECT 
        cs.schedule_id as schedule_id,
        s.subject_id, 
        s.subject_name, 
        s.subject_code, 
        cs.semester
      FROM class_schedule cs
      JOIN subjects s ON s.subject_id = cs.subject_id
      WHERE cs.teacher_id = ${teacherId}
      ${semester ? `AND cs.semester = ${Number(semester)}` : ""}
      ORDER BY cs.semester, s.subject_name
    `
    
    const classes = classesResult as unknown as {
      schedule_id: number;
      subject_id: number;
      subject_name: string;
      subject_code: string;
      semester: number;
    }[];
    
    // For each class, fetch enrolled students
    const classesWithStudents = await Promise.all(
      classes.map(async (classItem) => {
        // FIX: Use schedule_id to match student_enrollments table
        const studentsResult = await executeQuery`
          SELECT 
            se.student_id,
            s.first_name,
            s.last_name
          FROM student_enrollments se
          JOIN students s ON se.student_id = s.student_id
          WHERE se.schedule_id = ${classItem.schedule_id}
          AND se.status = 'active'
          ORDER BY s.first_name, s.last_name
        `
        
        const students = studentsResult as unknown as StudentEnrollment[];
        
        return {
          ...classItem,
          students: students.map(student => ({
            student_id: student.student_id,
            first_name: student.first_name,
            last_name: student.last_name
          }))
        }
      })
    )
    
    console.log("Classes with students:", classesWithStudents)
    return NextResponse.json(classesWithStudents)
    
  } catch (error) {
    console.error("Error in API route:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}