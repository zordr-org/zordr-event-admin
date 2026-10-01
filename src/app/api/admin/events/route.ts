import { NextRequest, NextResponse } from 'next/server'
import { mockEventsList } from '@/features/events/api'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('search')
  const status = searchParams.get('status')
  const category = searchParams.get('category')
  const city = searchParams.get('city')
  const organizerId = searchParams.get('organizerId')
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = parseInt(searchParams.get('limit') ?? '15', 10)

  let filtered = [...mockEventsList]
  if (q) {
    const qLower = q.toLowerCase()
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(qLower) ||
        e.organizerName.toLowerCase().includes(qLower) ||
        e.city.toLowerCase().includes(qLower)
    )
  }
  if (status) filtered = filtered.filter((e) => e.status === status)
  if (category) filtered = filtered.filter((e) => e.category === category)
  if (city) filtered = filtered.filter((e) => e.city === city)
  if (organizerId) filtered = filtered.filter((e) => e.organizerId === organizerId)

  const start = (page - 1) * limit
  const paginated = filtered.slice(start, start + limit)

  return NextResponse.json({
    success: true,
    data: {
      events: paginated,
      pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
    },
  })
}
