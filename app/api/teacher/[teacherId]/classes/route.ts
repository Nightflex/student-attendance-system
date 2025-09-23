import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

interface TeacherAssignment {
  assignment_id: number;
  subject_id: number;
  semester: number;
}

interface ClassData {
  schedule_id: number;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  semester: number;
  students: string; // JSON string
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
    
    // Start with a simple query to test the connection
    try {
      const testQuery = await executeQuery`SELECT 1 as test`
      console.log("Database connection test:", testQuery)
    } catch (dbError) {
      console.error("Database connection failed:", dbError)
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }
    
    // Check if teacher exists
    try {
      const teacherExists = await executeQuery`
        SELECT teacher_id FROM teachers WHERE teacher_id = ${teacherId} LIMIT 1
      ` as unknown as { teacher_id: number }[];
      console.log("Teacher exists check:", teacherExists)
      
      if (!teacherExists || teacherExists.length === 0) {
        return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
      }
    } catch (error) {
      console.error("Teacher check error:", error)
      return NextResponse.json({ error: "Error checking teacher" }, { status: 500 })
    }
    
    // Check teacher assignments
    try {
      const assignmentsResult = await executeQuery`
        SELECT assignment_id, subject_id, semester 
        FROM teacher_subject_assignments 
        WHERE teacher_id = ${teacherId}
        ${semester ? `AND semester = ${Number(semester)}` : ""}
      `
      const assignments = assignmentsResult as unknown as TeacherAssignment[];
      console.log("Teacher assignments:", assignments)
      
      if (!assignments || assignments.length === 0) {
        console.log("No assignments found for teacher")
        return NextResponse.json([])
      }
    } catch (error) {
      console.error("Assignments check error:", error)
      return NextResponse.json({ error: "Error checking assignments" }, { status: 500 })
    }
    
    // Main query - simplified first
    try {
      const classesResult = await executeQuery`
        SELECT 
          tsa.assignment_id as schedule_id,
          s.subject_id, 
          s.subject_name, 
          s.subject_code, 
          tsa.semester,
          '[]'::json AS students
        FROM teacher_subject_assignments tsa
        JOIN subjects s ON s.subject_id = tsa.subject_id
        WHERE tsa.teacher_id = ${teacherId}
        ${semester ? `AND tsa.semester = ${Number(semester)}` : ""}
        ORDER BY s.subject_name
      `
      const classes = classesResult as unknown as ClassData[];
      
      console.log("Classes query result:", classes)
      return NextResponse.json(classes)
      
    } catch (error) {
      console.error("Main query error:", error)
      return NextResponse.json({ error: "Error fetching classes" }, { status: 500 })
    }
    
  } catch (error) {
    console.error("Unexpected error in API route:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}