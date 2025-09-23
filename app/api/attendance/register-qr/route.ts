import { NextRequest, NextResponse } from "next/server"
import { storeQRToken, QRTokenData } from "@/lib/attendance-store"

export async function POST(req: NextRequest) {
  try {
    // Verify teacher authorization
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

  // const token = authHeader.substring(7) // Reserved for JWT verification
  // Add JWT verification here if using JWT tokens
    
    const qrData: QRTokenData = await req.json()
    const { qrToken, sessionId, teacherId, subjectId, semester, assignmentId, expiresAt, qrNumber, students } = qrData

    // Validate required fields
    if (!qrToken || !sessionId || !teacherId || !subjectId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Store the QR token with TTL
    storeQRToken(qrToken, {
      qrToken,  // Include the qrToken in the stored data
      sessionId,
      teacherId: teacherId.toString(),
      subjectId,
      semester,
      assignmentId,
      expiresAt,
      qrNumber,
      students
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error registering QR token:', error)
    return NextResponse.json({ error: 'Failed to register QR token' }, { status: 500 })
  }
}