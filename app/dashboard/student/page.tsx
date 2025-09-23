"use server";

import { StudentDashboardClient } from "@/components/Students/StudentDashboardClient";
import StudentNavbar from "@/components/Students/StudentNavBar";
import { executeQuery } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { logout } from "@/lib/data/logout";

export default async function StudentDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    throw new Error("No token found — should have been caught by middleware");
  }

  let payload: any;
  try {
    // Verify token with jose
    const verified = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
    payload = verified.payload;
  } catch (error) {
    throw new Error("Invalid token — should have been caught by middleware");
  }

  if (payload.role !== "student") {
    throw new Error("Unauthorized access — should have been caught by middleware");
  }

  const studentRows = await executeQuery`
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

  if (studentRows.length === 0) {
    throw new Error("Student not found — middleware should block this case");
  }

  const student = studentRows[0];

  const courseRows = await executeQuery`
    SELECT course_name, course_code
    FROM courses
    WHERE course_id = ${student.course_id}
  `;

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
