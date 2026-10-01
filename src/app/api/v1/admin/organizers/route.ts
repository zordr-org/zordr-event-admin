import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

// MOCK DATA
const CITIES = ['Hyderabad', 'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Pune']
export const mockOrganizersList = Array.from({ length: 48 }).map((_, i) => {
  const isPending = i % 5 === 0
  const isRejected = i % 20 === 0
  const isSuspended = i % 25 === 0
  
  const status = isPending ? 'pending' : isRejected ? 'rejected' : isSuspended ? 'suspended' : 'approved'
  const kyc = status === 'approved' ? 'verified' : isPending ? 'pending' : 'not_submitted'
  
  return {
    id: `org-${i + 1}`,
    orgName: `Organizer ${i + 1}`,
    kycStatus: kyc,
    activeEvents: Math.floor(Math.random() * 5),
    totalRevenue: Math.floor(Math.random() * 500000),
    status,
    city: CITIES[i % CITIES.length],
    phone: `+91 9${Math.floor(100000000 + Math.random() * 900000000)}`,
    email: `contact${i + 1}@example.in`,
    joinedOn: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    handle: `@org_${i + 1}`,
  }
})

export const mockDetailStore: Record<string, any> = mockOrganizersList.reduce((acc, org) => {
  acc[org.id] = {
    ...org,
    contact: {
      name: `Owner ${org.id}`,
      role: 'President',
      phone: org.phone || '',
      email: org.email || '',
    },
    orgType: 'College Club',
    address: '123 Main St, ' + org.city,
    website: 'https://example.in',
    gstNumber: '22AAAAA0000A1Z5',
    panNumber: 'ABCDE1234F',
    payoutAccount: {
      id: crypto.randomUUID(),
      accountHolder: `Owner ${org.id}`,
      bankName: 'HDFC Bank',
      branch: 'Jubilee Hills, Hyderabad',
      maskedAccountNumber: 'XXXXXX1234',
      ifsc: 'HDFC0001234',
      verificationStatus: 'verified'
    },
    notes: [],
    documents: [
      { id: 'doc-1', docType: 'pan', status: 'verified', fileUrl: 'https://example.com/pan.pdf', uploadedAt: org.joinedOn },
      { id: 'doc-2', docType: 'gst', status: 'verified', fileUrl: 'https://example.com/gst.pdf', uploadedAt: org.joinedOn },
    ],
    events: [],
    settlements: [],
    supportTickets: []
  }
  return acc
}, {} as Record<string, any>)


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
