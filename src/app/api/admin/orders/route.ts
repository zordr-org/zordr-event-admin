import { NextRequest, NextResponse } from 'next/server'
import { mockOrdersList } from '@/features/orders/api'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('search')
  const eventId = searchParams.get('eventId')
  const organizerId = searchParams.get('organizerId')
  const paymentStatus = searchParams.get('paymentStatus')
  const orderStatus = searchParams.get('orderStatus')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = parseInt(searchParams.get('limit') ?? '15', 10)

  let filtered = [...mockOrdersList]

  if (q) {
    const qLower = q.toLowerCase()
    filtered = filtered.filter(
      (o) =>
        o.customerName.toLowerCase().includes(qLower) ||
        o.customerEmail.toLowerCase().includes(qLower) ||
        o.id.toLowerCase().includes(qLower)
    )
  }
  if (eventId) filtered = filtered.filter((o) => o.eventId === eventId)
  if (organizerId) filtered = filtered.filter((o) => o.organizerId === organizerId)
  if (paymentStatus) filtered = filtered.filter((o) => o.paymentStatus === paymentStatus)
  if (orderStatus) filtered = filtered.filter((o) => o.orderStatus === orderStatus)
  
  if (dateFrom) {
    const from = new Date(dateFrom).getTime()
    filtered = filtered.filter((o) => new Date(o.createdAt).getTime() >= from)
  }
  if (dateTo) {
    const to = new Date(dateTo).getTime()
    filtered = filtered.filter((o) => new Date(o.createdAt).getTime() <= to)
  }

  const start = (page - 1) * limit
  const paginated = filtered.slice(start, start + limit)

  return NextResponse.json({
    success: true,
    data: {
      orders: paginated,
      pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
    },
  })
}
