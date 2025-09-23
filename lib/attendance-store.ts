export interface QRTokenData {
  qrToken: string  // Added this missing property
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
  activeQRTokens.set(token, data)
  cleanupExpiredTokens()
}

export function getQRToken(token: string): QRTokenData | null {
  const data = activeQRTokens.get(token)
  if (!data) return null
  
  // Check if expired
  if (new Date(data.expiresAt) < new Date()) {
    activeQRTokens.delete(token)
    return null
  }
  
  return data
}

export function deleteQRToken(token: string): void {
  activeQRTokens.delete(token)
}

// Session operations
export function storeSession(sessionId: string, data: SessionData): void {
  activeSessions.set(sessionId, data)
}

export function getSession(sessionId: string): SessionData | null {
  return activeSessions.get(sessionId) || null
}

export function updateSessionAttendance(sessionId: string, attendanceList: any[]): void {
  const session = activeSessions.get(sessionId)
  if (session) {
    session.attendanceList = attendanceList
    activeSessions.set(sessionId, session)
  }
}

export function deleteSession(sessionId: string): void {
  activeSessions.delete(sessionId)
}

// Periodic cleanup (run every 5 minutes)
setInterval(cleanupExpiredTokens, 5 * 60 * 1000)