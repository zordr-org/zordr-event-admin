import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { mockDetailStore } from '../route'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const organizer = mockDetailStore[params.id]
  
  if (!organizer) {
    return NextResponse.json({ success: false, error: { message: 'Not Found' } }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    data: { organizer }
  })
}
