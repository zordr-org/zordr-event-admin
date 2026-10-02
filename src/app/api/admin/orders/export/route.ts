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

  // Generate basic CSV
  const header = ['Order ID', 'Customer Name', 'Customer Email', 'Event Name', 'Organizer Name', 'Amount', 'Tickets', 'Gateway', 'Payment Status', 'Order Status', 'Created At']
  const rows = filtered.map(o => [
    o.id,
    `"${o.customerName}"`,
    `"${o.customerEmail}"`,
    `"${o.eventName}"`,
    `"${o.organizerName}"`,
    o.amount.toString(),
    o.ticketsCount.toString(),
    o.paymentGateway,
    o.paymentStatus,
    o.orderStatus,
    o.createdAt
  ])

  const csvContent = [header.join(','), ...rows.map(r => r.join(','))].join('\n')

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="orders-export-${new Date().toISOString().split('T')[0]}.csv"`
    }
  })
}
