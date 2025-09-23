import { NextRequest, NextResponse } from "next/server"
import { getSession, deleteSession } from "@/lib/attendance-store"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Await the params since it's a Promise in the App Router
    const { sessionId } = await params
    
    // Verify teacher authorization
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get session data to verify ownership
    const sessionData = await getSession(sessionId)
    if (!sessionData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const teacherId = authHeader.substring(7)
    if (teacherId !== sessionData.teacherId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete the session
    await deleteSession(sessionId)

    return NextResponse.json({ 
      success: true, 
      message: 'Session finalized successfully' 
    })

  } catch (error) {
    console.error('Error finalizing session:', error)
    return NextResponse.json({ error: 'Failed to finalize session' }, { status: 500 })
  }
}