// lib/auth/login.ts
import { executeQuery } from "@/lib/db";
import type { LoginRequest, LoginResponse, User } from "@/lib/types";
import bcrypt from "bcryptjs";

interface DatabaseError extends Error {
  message: string;
}

interface UserRecord {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  roll_number?: string | null;
  course_id?: number | null;
  semester?: number | null;
  batch_year?: number | null;
  phone_number?: string | null;
  department_id?: number | null;
  designation?: string | null;
}

interface Course {
  course_name: string;
  course_code: string;
}

interface Department {
  department_name: string;
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

export async function authenticateUser(loginData: LoginRequest): Promise<LoginResponse> {
  try {
    // Use roll_number instead of email
    const rollNumber = loginData.roll_number?.trim();
    
    if (!rollNumber) {
      return { success: false, message: "Roll number is required." };
    }

    let result: UserRecord[] = [];

    switch (loginData.user_type) {
      case "student":
        const studentResult = await executeQuery`
          SELECT 
            student_id AS id, first_name, last_name, email, password_hash,
            roll_number, course_id, semester, batch_year, phone_number
          FROM students
          WHERE roll_number = ${rollNumber} AND is_active = true
        `;
        result = studentResult as unknown as UserRecord[];
        break;

      case "teacher":
        const teacherResult = await executeQuery`
          SELECT 
            teacher_id AS id, first_name, last_name, email, password_hash,
            department_id, designation, phone_number
          FROM teachers
          WHERE email = ${rollNumber} AND is_active = true
          // For teachers, you might want to keep email as identifier
          // Or create a teacher_id field if needed
        `;
        result = teacherResult as unknown as UserRecord[];
        break;

      case "admin":
        const adminResult = await executeQuery`
          SELECT 
            teacher_id AS id, first_name, last_name, email, password_hash,
            department_id, designation, phone_number
          FROM teachers
          WHERE email = ${rollNumber} AND is_active = true AND LOWER(designation) LIKE '%admin%'
          // For admins, keep email as identifier
        `;
        result = adminResult as unknown as UserRecord[];
        break;

      default:
        return { success: false, message: "Invalid user type." };
    }

    const userRecord = result[0];
    if (!userRecord) return { success: false, message: "Invalid roll number or password." };

    const isValidPassword = await bcrypt.compare(loginData.password, userRecord.password_hash);
    if (!isValidPassword) return { success: false, message: "Invalid roll number or password." };

    // Build user object
    let additionalData: Record<string, string | number | null> = {};

    if (loginData.user_type === "student" && userRecord.course_id) {
      const courseResult = await executeQuery`
        SELECT course_name, course_code FROM courses WHERE course_id = ${userRecord.course_id}
      `;
      const [course] = courseResult as unknown as Course[];
      additionalData = {
        course: course?.course_name || "Unknown",
        course_code: course?.course_code || "",
        roll_number: userRecord.roll_number ?? null,
        semester: userRecord.semester?.toString() ?? null,
        batch_year: userRecord.batch_year?.toString() ?? null,
        course_id: userRecord.course_id,
        phone_number: userRecord.phone_number ?? null,
      };
    } else if (loginData.user_type === "teacher" || loginData.user_type === "admin") {
      const deptResult = await executeQuery`
        SELECT department_name FROM departments WHERE department_id = ${userRecord.department_id}
      `;
      const [dept] = deptResult as unknown as Department[];
      additionalData = {
        department: dept?.department_name || "Unknown",
        designation: userRecord.designation ?? null,
        phone_number: userRecord.phone_number ?? null,
        teacher_id: userRecord.id,
      };
    }

    const user: User = {
      id: userRecord.id.toString(),
      name: `${userRecord.first_name} ${userRecord.last_name}`,
      email: userRecord.email,
      role: loginData.user_type,
      ...additionalData,
    };

    return { success: true, user, message: "Login successful!" };
  } catch (error) {
    const dbError = error as DatabaseError;
    console.error("Authentication Error:", dbError);
    return { success: false, message: "Authentication failed due to server error." };
  }
}