import { NextRequest, NextResponse } from 'next/server'
import { mockSupportTickets } from '@/features/support/mock'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)
  const status = searchParams.get('status')
  const category = searchParams.get('category')
  const priority = searchParams.get('priority')
  const requesterType = searchParams.get('requesterType')
  const eventId = searchParams.get('eventId')
  const search = searchParams.get('search')?.toLowerCase()

  let filtered = [...mockSupportTickets]

  if (status) {
    filtered = filtered.filter(t => t.status === status)
  }
  if (category) {
    filtered = filtered.filter(t => t.category === category)
  }
  if (priority) {
    filtered = filtered.filter(t => t.priority === priority)
  }
  if (requesterType) {
    filtered = filtered.filter(t => t.requesterType === requesterType)
  }
  if (eventId) {
    filtered = filtered.filter(t => t.eventId === eventId)
  }
  if (search) {
    filtered = filtered.filter(t => 
      t.id.toLowerCase().includes(search) || 
      t.subject.toLowerCase().includes(search) ||
      t.requesterName.toLowerCase().includes(search) ||
      (t.eventName && t.eventName.toLowerCase().includes(search))
    )
  }

  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const total = filtered.length
  const totalPages = Math.ceil(total / limit)
  const start = (page - 1) * limit
  const paginated = filtered.slice(start, start + limit)

  return NextResponse.json({
    success: true,
    data: {
      tickets: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    }
  })
}
