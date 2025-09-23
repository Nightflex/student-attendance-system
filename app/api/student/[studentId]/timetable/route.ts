import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

interface Student {
  course_id: number;
}

interface TimetableEntry {
  name: string;
  code: string;
  teacherName: string;
  day: string;
  startTime: string;
  endTime: string;
}

export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    // Await the params since it's a Promise in the App Router
    const { studentId } = await params;

    // Get student's course_id
    const studentResult = await executeQuery`
      SELECT course_id FROM students WHERE student_id = ${studentId} AND is_active = true
    `;
    const student = studentResult as unknown as Student[];
    
    if (!student[0]) return NextResponse.json({ success: false, message: "Student not found" });

    const courseId = student[0].course_id;

    // Fetch timetable for that course
    const timetableResult = await executeQuery`
      SELECT 
        s.subject_name AS name,
        s.subject_code AS code,
        t.first_name || ' ' || t.last_name AS teacherName,
        cs.day,
        cs.start_time AS "startTime",
        cs.end_time AS "endTime"
      FROM class_schedule cs
      JOIN subjects s ON cs.subject_id = s.subject_id
      JOIN teachers t ON cs.teacher_id = t.teacher_id
      WHERE s.course_id = ${courseId}
      ORDER BY 
        CASE 
          WHEN cs.day='Monday' THEN 1
          WHEN cs.day='Tuesday' THEN 2
          WHEN cs.day='Wednesday' THEN 3
          WHEN cs.day='Thursday' THEN 4
          WHEN cs.day='Friday' THEN 5
          ELSE 6
        END,
        cs.start_time
    `;
    const timetable = timetableResult as unknown as TimetableEntry[];

    return NextResponse.json({ success: true, data: timetable });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Failed to fetch timetable" }, { status: 500 });
  }
}