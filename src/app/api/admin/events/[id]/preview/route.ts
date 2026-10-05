import { NextRequest, NextResponse } from 'next/server'
import { mockReviewStore } from '@/features/events/api'

export async function GET(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const review = mockReviewStore[params.id]
  if (!review) {
    return NextResponse.json({ success: false, error: { message: 'Event not found' } }, { status: 404 })
  }
  // Returns the full event detail — bypasses published-only gate (admin preview)
  return NextResponse.json({ success: true, data: { event: review.event } })
}
