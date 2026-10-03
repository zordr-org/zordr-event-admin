import { NextRequest, NextResponse } from 'next/server'
import { mockSettlementsList } from '@/features/settlements/api'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const organizerId = searchParams.get('organizerId')
  const eventId = searchParams.get('eventId')
  const status = searchParams.get('status')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = parseInt(searchParams.get('limit') ?? '15', 10)

  let filtered = [...mockSettlementsList]

  if (organizerId) filtered = filtered.filter((s) => s.organizerId === organizerId)
  if (eventId) filtered = filtered.filter((s) => s.eventIds.includes(eventId))
  if (status) filtered = filtered.filter((s) => s.status === status)
  
  if (dateFrom) {
    const from = new Date(dateFrom).getTime()
    filtered = filtered.filter((s) => new Date(s.periodStart).getTime() >= from)
  }
  if (dateTo) {
    const to = new Date(dateTo).getTime()
    filtered = filtered.filter((s) => new Date(s.periodEnd).getTime() <= to)
  }

  const start = (page - 1) * limit
  const paginated = filtered.slice(start, start + limit)

  return NextResponse.json({
    success: true,
    data: {
      settlements: paginated,
      pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
    },
  })
}

