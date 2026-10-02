import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

import { mockOrganizersList } from '@/features/organizers/api'
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('search')
  const status = searchParams.get('status')
  const kycStatus = searchParams.get('kycStatus')
  const city = searchParams.get('city')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  let filtered = [...mockOrganizersList]

  if (q) {
    const qLower = q.toLowerCase()
    filtered = filtered.filter(o => 
      o.orgName.toLowerCase().includes(qLower) || 
      o.email?.toLowerCase().includes(qLower) || 
      o.phone?.includes(qLower)
    )
  }
  if (status) filtered = filtered.filter(o => o.status === status)
  if (kycStatus) filtered = filtered.filter(o => o.kycStatus === kycStatus)
  if (city) filtered = filtered.filter(o => o.city === city)

  const start = (page - 1) * limit
  const paginated = filtered.slice(start, start + limit)

  return NextResponse.json({
    success: true,
    data: {
      organizers: paginated,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit)
      }
    }
  })
}
