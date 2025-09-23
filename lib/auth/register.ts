// lib/auth/register.ts
import bcrypt from 'bcryptjs';
import { executeQuery } from '@/lib/db';
import type { CreateStudentRequest, Student } from '@/lib/types'; // Adjust path if needed

/**
 * Registers a new student.
 * Hashes the password and saves the student data to the database.
 * Uses the roll_number provided by the user.
 *
 * @param studentData The data collected from the registration form.
 * @returns A promise that resolves to the created Student object (without password_hash).
 */
export async function registerStudent(studentData: CreateStudentRequest): Promise<Student> {
  try {
    // 1. Basic validation (ensure essential data exists)
    // This should ideally be done by the API route as well, but double-checking is good.
    if (!studentData.email || !studentData.password || !studentData.roll_number) {
        throw new Error("Essential student data (email, password, roll_number) is missing.");
    }

    // 2. Normalize and sanitize inputs
    const email = studentData.email.toLowerCase().trim();
    const rollNumber = studentData.roll_number.trim();
    const firstName = studentData.first_name.trim();
    const lastName = studentData.last_name.trim();
    const phoneNumber = studentData.phone_number?.trim() || null; // Handle optional phone

    // 3. Check for existing email (prevent duplicates)
    const [existingEmail] = await executeQuery`
      SELECT student_id FROM students WHERE email = ${email}
    `;
    if (existingEmail) {
      throw new Error("A student with this email already exists.");
    }

    // 4. Check for existing roll number (prevent duplicates)
    // This is crucial since roll_number is supposed to be unique.
    const [existingRoll] = await executeQuery`
      SELECT student_id FROM students WHERE roll_number = ${rollNumber}
    `;
    if (existingRoll) {
        throw new Error("A student with this roll number already exists.");
    }

    // 5. Hash the password using bcrypt
    const passwordHash = await bcrypt.hash(studentData.password, 10); // 10 is a common salt round

    // 6. Insert the new student into the database
    // IMPORTANT: We use the roll_number provided by the user (rollNumber variable)
    // and do NOT generate a new one here.
    const [newStudent] = await executeQuery`
      INSERT INTO students (
        first_name, last_name, roll_number, email, phone_number,
        course_id, semester, batch_year, password_hash
      )
      VALUES (
        ${firstName}, ${lastName}, ${rollNumber}, ${email},
        ${phoneNumber},
        ${Number(studentData.course_id)}, ${Number(studentData.semester)},
        ${Number(studentData.batch_year)}, ${passwordHash}
      )
      RETURNING
        student_id,
        first_name,
        last_name,
        roll_number,
        email,
        phone_number,
        course_id,
        semester,
        batch_year,
        is_active,
        created_at,
        updated_at
    `;

    if (!newStudent) {
        // This indicates a problem with the INSERT, though it shouldn't happen if the query is valid.
        throw new Error("Failed to create student record in the database.");
    }

    // 7. Fetch course details to enrich the response object
    // This assumes you have a `courses` table linked by `course_id`.
    const [courseDetails] = await executeQuery`
      SELECT course_name, course_code
      FROM courses
      WHERE course_id = ${newStudent.course_id}
    `;

    // 8. Construct and return the Student object
    // This object should match your `Student` type definition (excluding password_hash).
    const studentResponse: Student = {
      student_id: newStudent.student_id.toString(), // Ensure ID is a string if your type requires it
      first_name: newStudent.first_name,
      last_name: newStudent.last_name,
      roll_number: newStudent.roll_number, // This is the user-provided one
      email: newStudent.email,
      phone_number: newStudent.phone_number,
      course_id: newStudent.course_id,
      semester: newStudent.semester,
      batch_year: newStudent.batch_year,
      is_active: newStudent.is_active,
      created_at: newStudent.created_at, // Ensure correct format (ISO string)
      updated_at: newStudent.updated_at, // Ensure correct format (ISO string)
      name: `${newStudent.first_name} ${newStudent.last_name}`, // Computed field
      course_name: courseDetails?.course_name || null, // From JOIN
      course_code: courseDetails?.course_code || null,  // From JOIN
      // password_hash is intentionally NOT included for security
    };

    return studentResponse;

  } catch (error: any) {
    console.error("Register Student Library Function Error:", error);
    // Re-throw the error so the API route can catch and handle it appropriately.
    // Specific errors like "already exists" can be handled differently by the API.
    throw error;
  }
}
