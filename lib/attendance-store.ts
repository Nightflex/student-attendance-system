// lib/attendance-store.ts
export interface QRTokenData {
  qrToken: string
  sessionId: string
  teacherId: string
  subjectId: number
  semester: number
  assignmentId: number
  expiresAt: string
  qrNumber: number
  students?: Array<{
    student_id: number
    first_name: string
    last_name: string
  }>
}

export interface SessionData {
  teacherId: string
  subjectId: number
  semester: number
  assignmentId: number
  students: Array<{
    student_id: number
    first_name: string
    last_name: string
  }>
  date: string
  startTime: string
  attendanceList: Array<{
    student_id: number
    first_name: string
    last_name: string
    status: 'present' | 'absent'
    marked_at: string | null
  }>
}

interface AttendanceListItem {
  student_id: number
  first_name: string
  last_name: string
  status: 'present' | 'absent'
  marked_at: string | null
}

// Global stores (in-memory - use Redis in production)
export const activeQRTokens = new Map<string, QRTokenData>()
export const activeSessions = new Map<string, SessionData>()

// Cleanup function for expired tokens
export function cleanupExpiredTokens() {
  const now = new Date()
  for (const [token, data] of activeQRTokens.entries()) {
    if (new Date(data.expiresAt) < now) {
      activeQRTokens.delete(token)
    }
  }
  
  // Also cleanup expired sessions (older than 1 hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  for (const [sessionId, session] of activeSessions.entries()) {
    if (new Date(session.startTime) < oneHourAgo) {
      activeSessions.delete(sessionId)
    }
  }
}

// QR Token operations
export function storeQRToken(token: string, data: QRTokenData): void {
  console.log("Storing QR token:", token, data);
  activeQRTokens.set(token, data)
  cleanupExpiredTokens()
}

export function getQRToken(token: string): QRTokenData | null {
  const data = activeQRTokens.get(token)
  if (!data) {
    console.log("QR token not found:", token);
    return null
  }
  
  // Check if expired
  if (new Date(data.expiresAt) < new Date()) {
    console.log("QR token expired:", token);
    activeQRTokens.delete(token)
    return null
  }
  
  console.log("QR token found:", token, data);
  return data
}

export function deleteQRToken(token: string): void {
  console.log("Deleting QR token:", token);
  activeQRTokens.delete(token)
}

// Session operations
export function storeSession(sessionId: string, data: SessionData): void {
  console.log("Storing session:", sessionId, data);
  activeSessions.set(sessionId, JSON.parse(JSON.stringify(data))) // Deep copy
}

export function getSession(sessionId: string): SessionData | null {
  const session = activeSessions.get(sessionId)
  console.log("Getting session:", sessionId, session);
  return session ? JSON.parse(JSON.stringify(session)) : null // Deep copy
}

export function updateSessionAttendance(sessionId: string, attendanceList: AttendanceListItem[]): void {
  const session = activeSessions.get(sessionId)
  if (session) {
    console.log("Updating session attendance:", sessionId, attendanceList);
    // Create a new session object instead of modifying in place
    const updatedSession: SessionData = {
      ...session,
      attendanceList: attendanceList.map(item => ({ ...item })) // Deep copy of attendance items
    }
    activeSessions.set(sessionId, updatedSession)
  } else {
    console.log("Session not found for update:", sessionId);
  }
}

export function deleteSession(sessionId: string): void {
  console.log("Deleting session:", sessionId);
  activeSessions.delete(sessionId)
}

// Periodic cleanup (run every 5 minutes)
setInterval(cleanupExpiredTokens, 5 * 60 * 1000)