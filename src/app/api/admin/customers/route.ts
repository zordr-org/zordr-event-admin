import { NextRequest, NextResponse } from 'next/server'
import { mockCustomersList } from '@/features/customers/api'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('search')
  const status = searchParams.get('status')
  const city = searchParams.get('city')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = parseInt(searchParams.get('limit') ?? '15', 10)

  let filtered = [...mockCustomersList]

  if (q) {
    const qLower = q.toLowerCase()
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(qLower) ||
        c.email.toLowerCase().includes(qLower) ||
        c.id.toLowerCase().includes(qLower)
    )
  }
  if (status) filtered = filtered.filter((c) => c.status === status)
  if (city) filtered = filtered.filter((c) => c.city === city)
  
  if (dateFrom) {
    const from = new Date(dateFrom).getTime()
    filtered = filtered.filter((c) => new Date(c.joinedOn).getTime() >= from)
  }
  if (dateTo) {
    const to = new Date(dateTo).getTime()
    filtered = filtered.filter((c) => new Date(c.joinedOn).getTime() <= to)
  }

  const start = (page - 1) * limit
  const paginated = filtered.slice(start, start + limit)

  return NextResponse.json({
    success: true,
    data: {
      customers: paginated,
      pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
    },
  })
}
