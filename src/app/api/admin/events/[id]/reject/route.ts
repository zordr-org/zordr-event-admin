import { NextRequest, NextResponse } from 'next/server'
import { mockReviewStore, mockEventsList } from '@/features/events/api'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const { reason } = body

  if (!reason || String(reason).trim().length < 10) {
    return NextResponse.json(
      { success: false, error: { message: 'reason is required and must be at least 10 characters' } },
      { status: 400 }
    )
  }

  const review = mockReviewStore[params.id]
  if (!review) {
    return NextResponse.json({ success: false, error: { message: 'Event not found' } }, { status: 404 })
  }

  const listItem = mockEventsList.find((e) => e.id === params.id)
  if (listItem) listItem.status = 'rejected'
  review.event.status = 'rejected'

  const lastCycle = review.reviewHistory[review.reviewHistory.length - 1]
  if (lastCycle && lastCycle.action === 'pending') {
    lastCycle.action = 'rejected'
    lastCycle.resolvedAt = new Date().toISOString()
    lastCycle.adminName = 'Admin'
    lastCycle.reason = reason
  }

  return NextResponse.json({ success: true })
}
