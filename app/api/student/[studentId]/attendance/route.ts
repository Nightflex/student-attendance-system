import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    // Await the params since it's a Promise in the App Router
    const { studentId } = await params;

    // Fetch attendance joined with subject table
    const records = await executeQuery`
      SELECT 
        a.attendance_id AS id,
        a.student_id AS studentId,
        s.subject_code AS classId,
        s.subject_name AS className,
        a.attendance_date AS date,
        a.attendance_date || ' ' || '09:00:00' AS timestamp, -- or real time if you have
        a.status
      FROM attendance a
      JOIN subjects s ON a.subject_id = s.subject_id
      WHERE a.student_id = ${studentId}
      ORDER BY a.attendance_date DESC
    `;

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error("Attendance fetch error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch attendance" }, { status: 500 });
  }
}