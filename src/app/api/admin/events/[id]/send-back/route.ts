import { NextRequest, NextResponse } from 'next/server'
import { mockReviewStore, mockEventsList } from '@/features/events/api'

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const body = await request.json()
  const { notes } = body

  if (!notes || String(notes).trim().length < 10) {
    return NextResponse.json(
      { success: false, error: { message: 'notes is required and must be at least 10 characters' } },
      { status: 400 }
    )
  }

  const review = mockReviewStore[params.id]
  if (!review) {
    return NextResponse.json({ success: false, error: { message: 'Event not found' } }, { status: 404 })
  }

  const listItem = mockEventsList.find((e) => e.id === params.id)
  if (listItem) listItem.status = 'sent_back'
  review.event.status = 'sent_back'

  const lastCycle = review.reviewHistory[review.reviewHistory.length - 1]
  if (lastCycle && lastCycle.action === 'pending') {
    lastCycle.action = 'sent_back'
    lastCycle.resolvedAt = new Date().toISOString()
    lastCycle.adminName = 'Admin'
    lastCycle.notes = notes
  }

  return NextResponse.json({ success: true })
}
