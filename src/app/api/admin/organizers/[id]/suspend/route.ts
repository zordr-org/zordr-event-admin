import { NextRequest, NextResponse } from 'next/server'
import { mockDetailStore, mockOrganizersList } from '@/features/organizers/api'

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

  const detail = mockDetailStore[params.id]
  if (!detail) {
    return NextResponse.json({ success: false, error: { message: 'Organizer not found' } }, { status: 404 })
  }

  const listItem = mockOrganizersList.find((o) => o.id === params.id)
  if (listItem) listItem.status = 'suspended'
  detail.status = 'suspended'
  
  // Note: in a real implementation we would also append this to notes/audit log
  detail.notes.push({
    id: `note-${Date.now()}`,
    note: `Organizer suspended. Reason: ${reason}`,
    authorId: 'system',
    authorName: 'Admin',
    createdAt: new Date().toISOString()
  })

  return NextResponse.json({ success: true })
}
