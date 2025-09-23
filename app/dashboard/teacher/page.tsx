// app/dashboard/teacher/page.tsx
import { TeacherDashboardClient } from '@/components/Teachers/TeacherDashboardClient';
import TeacherNavBar from '@/components/Teachers/TeacherNavBar';
import { logout } from '@/lib/data/logout';
import { cookies } from 'next/headers';
import { executeQuery } from '@/lib/db';
import { jwtVerify } from 'jose';

interface ClassData {
  schedule_id: number; // This is now assignment_id from teacher_subject_assignments
  subject_id: number;
  subject_name: string;
  subject_code: string;
  semester: number;
  students: { student_id: number; first_name: string; last_name: string }[];
}

export default async function TeacherDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token");
  
  if (!token) {
    throw new Error("No token found — should have been caught by middleware");
  }
  
  let payload: any;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload: verifiedPayload } = await jwtVerify(token.value, secret);
    payload = verifiedPayload;
  } catch (error) {
    throw new Error("Invalid token — should have been caught by middleware");
  }
  
  // Ensure user is a teacher or admin
  if (payload.role !== "teacher" && payload.role !== "admin") {
    throw new Error("Unauthorized access — should have been caught by middleware");
  }
  
  // Fetch teacher data
  const teacherRows = await executeQuery`
    SELECT
      teacher_id AS id,
      first_name,
      last_name,
      email,
      department_id,
      designation,
      phone_number
    FROM teachers
    WHERE teacher_id = ${Number(payload.id)} AND is_active = true
  `;
  
  if (teacherRows.length === 0) {
    throw new Error("Teacher not found — middleware should block this case");
  }
  
  const teacher = teacherRows[0];
  
  const deptRows = await executeQuery`
    SELECT department_name
    FROM departments
    WHERE department_id = ${teacher.department_id}
  `;
  
  const department = deptRows[0] || { department_name: "Unknown Department" };
  
  // Fetch all classes for this teacher (all semesters)
  const allClasses = await executeQuery`
    SELECT 
      tsa.assignment_id as schedule_id,
      s.subject_id, 
      s.subject_name, 
      s.subject_code, 
      tsa.semester,
      COALESCE(
        json_agg(
          CASE 
            WHEN st.student_id IS NOT NULL THEN
              json_build_object(
                'student_id', st.student_id,
                'first_name', st.first_name,
                'last_name', st.last_name
              )
            ELSE NULL
          END
        ) FILTER (WHERE st.student_id IS NOT NULL),
        '[]'::json
      ) AS students
    FROM teacher_subject_assignments tsa
    JOIN subjects s ON s.subject_id = tsa.subject_id
    LEFT JOIN students st ON st.course_id = s.course_id AND st.semester = tsa.semester
    WHERE tsa.teacher_id = ${teacher.id}
    GROUP BY tsa.assignment_id, s.subject_id, s.subject_name, s.subject_code, tsa.semester
    ORDER BY tsa.semester, s.subject_name
  `;
  
  // Group classes by semester for easier filtering
  const classesBySemester: Record<number, ClassData[]> = {};
  allClasses.forEach((cls: ClassData) => {
    if (!classesBySemester[cls.semester]) {
      classesBySemester[cls.semester] = [];
    }
    classesBySemester[cls.semester].push(cls);
  });
  
  const user = {
    id: teacher.id.toString(),
    name: `${teacher.first_name} ${teacher.last_name}`,
    email: teacher.email,
    teacherId: Number(teacher.id), // Ensure this is always a number
    department: department.department_name,
    designation: teacher.designation,
    phone_number: teacher.phone_number,
    role: payload.role, // "teacher" or "admin"
  };
  
  return (
    <div>
      <TeacherNavBar user={user} handleLogout={logout} />
      <TeacherDashboardClient 
        user={user} 
        allClasses={allClasses}
        classesBySemester={classesBySemester}
      />
    </div>
  );
}