import { NextRequest, NextResponse } from 'next/server'
import { mockRefundsList } from '@/features/refunds/mock'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '15', 10)
  const status = searchParams.get('status')
  const eventId = searchParams.get('eventId')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')

  let filtered = [...mockRefundsList]

  if (status) {
    filtered = filtered.filter(r => r.status === status)
  }
  if (eventId) {
    filtered = filtered.filter(r => r.eventId === eventId)
  }
  if (dateFrom) {
    const from = new Date(dateFrom).getTime()
    filtered = filtered.filter(r => new Date(r.requestedOn).getTime() >= from)
  }
  if (dateTo) {
    const to = new Date(dateTo).getTime()
    filtered = filtered.filter(r => new Date(r.requestedOn).getTime() <= to)
  }

  filtered.sort((a, b) => new Date(b.requestedOn).getTime() - new Date(a.requestedOn).getTime())

  const total = filtered.length
  const totalPages = Math.ceil(total / limit)
  const start = (page - 1) * limit
  const paginated = filtered.slice(start, start + limit)

  return NextResponse.json({
    success: true,
    data: {
      refunds: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    }
  })
}
