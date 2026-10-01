import { NextRequest, NextResponse } from 'next/server'
import { mockReviewStore } from '@/features/events/api'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const review = mockReviewStore[params.id]
  if (!review) {
    return NextResponse.json({ success: false, error: { message: 'Event not found' } }, { status: 404 })
  }

  const body = await request.json()
  const { item, status, comment } = body

  if (!item || !status) {
    return NextResponse.json({ success: false, error: { message: 'item and status are required' } }, { status: 400 })
  }

  const idx = review.checklist.findIndex((c) => c.key === item)
  if (idx === -1) {
    return NextResponse.json({ success: false, error: { message: 'Checklist item not found' } }, { status: 404 })
  }

  review.checklist[idx] = { ...review.checklist[idx], status, comment }

  return NextResponse.json({ success: true, data: { checklistItem: review.checklist[idx] } })
}
