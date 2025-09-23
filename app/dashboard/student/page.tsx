// app/dashboard/student/page.tsx
"use server";

import { StudentDashboardClient } from "@/components/Students/StudentDashboardClient";
import StudentNavbar from "@/components/Students/StudentNavBar";
import { executeQuery } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { logout } from "@/lib/data/logout";

interface JWTPayload {
  role: string;
  id: string;
  [key: string]: unknown;
}

interface StudentRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  roll_number: string;
  course_id: number;
  semester: number | null;
  batch_year: number | null;
  phone_number: string | null;
}

interface CourseRow {
  course_name: string;
  course_code: string;
}

export default async function StudentDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    throw new Error("No token found — should have been caught by middleware");
  }

  let payload: JWTPayload;
  try {
    // Verify token with jose
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");
    const verified = await jwtVerify(token, secret);
    payload = verified.payload as JWTPayload;
  } catch (error) {
    console.error("Token verification error:", error); // Add logging
    throw new Error("Invalid token — should have been caught by middleware");
  }

  if (payload.role !== "student") {
    throw new Error("Unauthorized access — should have been caught by middleware");
  }

  // Add error handling for database query
  let studentRows: StudentRow[] = [];
  try {
    const studentRowsResult = await executeQuery`
      SELECT 
        student_id AS id,
        first_name,
        last_name,
        email,
        roll_number,
        course_id,
        semester,
        batch_year,
        phone_number
      FROM students
      WHERE student_id = ${Number(payload.id)} AND is_active = true
    `;
    studentRows = studentRowsResult as unknown as StudentRow[];
  } catch (error) {
    console.error("Database query error:", error);
    throw new Error("Failed to fetch student data");
  }

  if (studentRows.length === 0) {
    throw new Error("Student not found — middleware should block this case");
  }

  const student = studentRows[0];

  // Add error handling for course query
  let courseRows: CourseRow[] = [];
  try {
    const courseRowsResult = await executeQuery`
      SELECT course_name, course_code
      FROM courses
      WHERE course_id = ${student.course_id}
    `;
    courseRows = courseRowsResult as unknown as CourseRow[];
  } catch (error) {
    console.error("Course query error:", error);
    // Don't throw error, just use default values
  }

  const course = courseRows[0] || { course_name: "Unknown", course_code: "" };

  const user = {
    id: student.id.toString(),
    name: `${student.first_name} ${student.last_name}`,
    email: student.email,
    roll_number: student.roll_number,
    semester: student.semester?.toString(),
    year: student.batch_year?.toString(),
    courseId: student.course_id,
    course: course.course_name,
    course_code: course.course_code,
    phone_number: student.phone_number,
    role: "student",
  };

  return (
    <div>
      <StudentNavbar user={user} handleLogout={logout} />
      <StudentDashboardClient user={user} />
    </div>
  );
}