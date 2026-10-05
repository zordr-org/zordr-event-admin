import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { mockDetailStore } from '@/features/organizers/api'
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const organizer = mockDetailStore[params.id]

  if (!organizer) {
    return NextResponse.json({ success: false, error: { message: 'Not Found' } }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    data: { organizer }
  })
}
