import { NextRequest, NextResponse } from 'next/server'
import { mockReviewStore } from '@/features/events/api'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const review = mockReviewStore[params.id]
  if (!review) {
    return NextResponse.json({ success: false, error: { message: 'Event not found' } }, { status: 404 })
  }
  return NextResponse.json({ success: true, data: { review } })
}
