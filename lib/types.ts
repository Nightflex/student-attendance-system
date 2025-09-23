// lib/types.ts

// --- Core Entity Types ---

export interface Department {
  department_id: number;
  department_name: string;
  created_at: string; // ISO string
  updated_at: string; // ISO string
}

export interface Course {
  course_id: number;
  course_name: string;
  course_code: string;
  department_id: number;
  duration_years: number;
  created_at: string; // ISO string
  updated_at: string; // ISO string
  // Computed fields (joined data)
  department?: Department; // Optional if joined
  department_name?: string; // From JOIN
}

export interface Subject {
  subject_id: number;
  subject_code: string;
  subject_name: string;
  course_id: number;
  semester_offered: number;
  credits: number;
  created_at: string; // ISO string
  updated_at: string; // ISO string
  // Computed fields (joined data)
  course?: Course; // Optional if joined
  course_name?: string; // From JOIN
  course_code_ref?: string; // From JOIN (alias to avoid conflict)
}

export interface Teacher {
  teacher_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string | null;
  department_id: number;
  designation: string;
  // password_hash: string; // Removed from public type, kept in DB type if needed
  is_active: boolean;
  created_at: string; // ISO string
  updated_at: string; // ISO string
  // Computed/Joined fields
  name?: string; // Often computed as first_name + last_name
  department?: Department; // Joined Department object
  department_name?: string; // Joined Department name string
  subjects?: Subject[]; // If fetching assigned subjects
}

// Specific type for database records including password_hash
export interface TeacherDBRecord extends Omit<Teacher, 'password_hash'> {
  password_hash: string; // Required in DB record
}

export interface Student {
  student_id: string; // Using string as per your preference, can be number
  first_name: string;
  last_name: string;
  roll_number: string;
  email: string;
  phone_number: string | null;
  course_id: number;
  semester: number;
  batch_year: number;
  is_active: boolean;
  created_at: string; // ISO string
  updated_at: string; // ISO string
  // Computed/Joined fields
  name?: string; // Often computed as first_name + last_name
  course_name?: string | null; // From JOIN
  course_code?: string | null; // From JOIN
  // password_hash is intentionally omitted from this public type
}

// Specific type for database records including password_hash
export interface StudentDBRecord extends Omit<Student, 'password_hash'> {
  password_hash: string; // Required in DB record
}

export interface TeacherSubjectAssignment {
  assignment_id: number;
  teacher_id: number;
  subject_id: number;
  semester: number;
  batch_year: number;
  is_active: boolean;
  created_at: string; // ISO string
  updated_at: string; // ISO string
  // Computed fields (joined data)
  teacher?: Teacher; // Optional if joined
  subject?: Subject; // Optional if joined
  teacher_name?: string; // From JOIN
  subject_name?: string; // From JOIN
}

export interface AttendanceRecord {
  attendance_id: number;
  teacher_id: number;
  subject_id: number;
  semester: number;
  batch_year: number;
  student_id: number;
  attendance_date: string; // YYYY-MM-DD
  attendance_time: string; // HH:MM:SS
  status: "present" | "absent" | "late";
  qr_code_id?: string | null;
  created_at: string; // ISO string
  updated_at: string; // ISO string
  // Computed fields (joined data)
  student?: Student; // Optional if joined
  subject?: Subject; // Optional if joined
  teacher?: Teacher; // Optional if joined
  student_name?: string; // From JOIN
  roll_number?: string; // From JOIN
  subject_name?: string; // From JOIN
  subject_code?: string; // From JOIN
  teacher_name?: string; // From JOIN
}

// --- API Request/Response Types ---

export interface CreateStudentRequest {
  first_name: string;
  last_name: string;
  roll_number: string; 
  email: string;
  phone_number?: string | null;
  password: string;
  confirm_password: string; // For confirmation on frontend, not stored
  course_id: number;
  semester: number;
  batch_year: number;
}

export interface CreateTeacherRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string | null;
  department_id: number;
  designation: string;
  password: string; // Plaintext, will be hashed server-side
}

export interface LoginRequest {
  email: string;
  password: string; // Plaintext
  user_type: "student" | "teacher" | "admin";
}

// Updated LoginResponse to include the JWT token
export interface LoginResponse {
  success: boolean;
  user?: User; // Use the User type defined below
  token?: string; // JWT token for successful login
  message?: string;
}

// Unified User type for responses, combining relevant fields
export interface User {
  id: string; // Student ID or Teacher ID
  name: string;
  email: string;
  role: string;
  // Student specific fields
  roll_number?: string;
  course?: string; // Course name
  course_code?: string;
  semester?: string; // String for consistency in response
  batch_year?: string; // String for consistency in response
  course_id?: number;
  phone_number?: string | null;
  // Teacher/Admin specific fields
  department?: string; // Department name
  designation?: string;
  teacher_id?: number; // Useful if admin is also a teacher
}

export interface MarkAttendanceRequest {
  student_id: number;
  subject_id: number;
  teacher_id: number; // Derived from assignment, but sent for clarity/validation?
  semester: number;  // Derived from student/subject, but sent for clarity/validation?
  batch_year: number; // Derived from student/subject, but sent for clarity/validation?
  status: "present" | "late";
  qr_code_id?: string;
}

// --- Student Dashboard / Schedule Types ---

export interface ClassScheduleItem {
  day: string;        // Monday, Tuesday, etc.
  startTime: string;  // HH:MM format
  endTime: string;    // HH:MM format
}

export interface StudentClass {
  id: string;                 // Subject code or unique ID
  name: string;               // Subject name
  code: string;               // Subject code
  teacherName: string;        // Full teacher name
  location?: string;          // Optional classroom location
  schedule: ClassScheduleItem[]; // Array of schedule slots
  students?: string[];        // Optional: enrolled student IDs
}


export interface CreateQRCodeRequest {
  subject_id: number;
  teacher_id: number;
  semester: number;
  batch_year: number;
  expiration_minutes: number;
}

export interface QRCodeData {
  qr_code_id: string; // Primary identifier
  subject_id: number;
  teacher_id: number;
  semester: number;
  batch_year: number;
  generated_at: string; // ISO string
  expires_at: string; // ISO string
  // Potentially include subject/teacher names for quick display if needed
  // subject_name?: string;
  // teacher_name?: string;
}

// --- Analytics Types ---

export interface AttendanceAnalytics {
  total_students: number;
  present_today: number;
  absent_today: number;
  late_today: number;
  attendance_rate: number;
  weekly_trends: {
    date: string; // YYYY-MM-DD
    present: number;
    absent: number;
    late: number;
  }[];
  department_stats: {
    department_name: string;
    total_students: number;
    present: number; // Present today for this dept
    attendance_rate: number; // Rate for today for this dept
  }[];
  subject_wise_stats: {
    subject_name: string;
    subject_code: string; // Added subject code
    total_classes: number; // In the period considered (e.g., last 30 days)
    avg_attendance: number; // Average attendance percentage
  }[];
}

export interface StudentAttendanceHistory {
  subject_name: string;
  subject_code: string;
  teacher_name: string;
  attendance_date: string; // YYYY-MM-DD
  attendance_time: string; // HH:MM:SS
  status: "present" | "absent" | "late";
  total_classes: number; // Total classes for this subject
  attended_classes: number; // Classes attended for this subject
  attendance_percentage: number; // Percentage for this subject
}

// --- Utility Types ---

// Roll number generation helper concept (implementation logic would be server-side)
// export interface RollNumberPattern {
//   year: number;
//   course_code: string;
//   sequence: number; // Padded sequence number
// }

// Form validation errors
export interface FormErrors {
  [key: string]: string;
}

// Dashboard stats (example, adjust based on your dashboard needs)
export interface DashboardStats {
  total_students: number;
  total_teachers: number;
  total_subjects: number;
  today_attendance_rate: number;
  recent_activities: {
    type: string; // e.g., 'login', 'qr_generated', 'attendance_marked'
    message: string;
    timestamp: string; // ISO string
  }[];
}
