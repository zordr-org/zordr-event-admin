import { NextRequest, NextResponse } from 'next/server'
import { mockReviewStore, mockEventsList } from '@/features/events/api'

export async function POST(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const review = mockReviewStore[params.id]
  if (!review) {
    return NextResponse.json({ success: false, error: { message: 'Event not found' } }, { status: 404 })
  }

  // Server-side checklist gate
  const incomplete = review.checklist.filter((c) => c.status !== 'looks_good')
  if (incomplete.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Cannot approve: checklist incomplete',
          blockers: incomplete.map((c) => c.label),
        },
      },
      { status: 400 }
    )
  }

  // Update stores
  const listItem = mockEventsList.find((e) => e.id === params.id)
  if (listItem) listItem.status = 'published'
  review.event.status = 'published'
  const lastCycle = review.reviewHistory[review.reviewHistory.length - 1]
  if (lastCycle) {
    lastCycle.action = 'approved'
    lastCycle.resolvedAt = new Date().toISOString()
    lastCycle.adminName = 'Admin'
  }

  return NextResponse.json({ success: true })
}
