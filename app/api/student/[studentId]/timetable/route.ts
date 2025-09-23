import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { studentId: string } }) {
  const studentId = params.studentId;

  try {
    // Get student's course_id
    const student = await executeQuery`
      SELECT course_id FROM students WHERE student_id = ${studentId} AND is_active = true
    `;
    if (!student[0]) return NextResponse.json({ success: false, message: "Student not found" });

    const courseId = student[0].course_id;

    // Fetch timetable for that course
    const timetable = await executeQuery`
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

    return NextResponse.json({ success: true, data: timetable });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Failed to fetch timetable" });
  }
}
