import { apiFetch } from '@/lib/api/client'
import { organizersResponseSchema, organizerDetailResponseSchema } from './schemas'
import type { 
  OrganizerFilters, 
  OrganizersResponse, 
  OrganizerKpi, 
  OrganizerDetailResponse, 
  AddNoteFormValues, 
  RejectOrganizerFormValues, 
  SuspendOrganizerFormValues, 
  OrganizerNote,
  OrganizerList,
  OrganizerDetail
} from './types'

export interface OrganizersApi {
  getOrganizers(filters: OrganizerFilters): Promise<OrganizersResponse>
  getOrganizerKpis(): Promise<OrganizerKpi>
  getOrganizer(id: string): Promise<OrganizerDetailResponse>
  approveOrganizer(id: string): Promise<void>
  rejectOrganizer(id: string, data: RejectOrganizerFormValues): Promise<void>
  suspendOrganizer(id: string, data: SuspendOrganizerFormValues): Promise<void>
  addNote(id: string, data: AddNoteFormValues): Promise<OrganizerNote>
}

class HttpOrganizersApi implements OrganizersApi {
  async getOrganizers(filters: OrganizerFilters): Promise<OrganizersResponse> {
    const params = new URLSearchParams()
    if (filters.page) params.set('page', filters.page.toString())
    if (filters.limit) params.set('limit', filters.limit.toString())
    if (filters.q) params.set('search', filters.q)
    if (filters.status) params.set('status', filters.status)
    if (filters.kyc) params.set('kycStatus', filters.kyc)
    if (filters.city) params.set('city', filters.city)
    
    const res = await apiFetch<unknown>(`/api/v1/admin/organizers?${params.toString()}`)
    return organizersResponseSchema.parse(res)
  }

  async getOrganizerKpis(): Promise<OrganizerKpi> {
    // The API contract doesn't have a dedicated KPI endpoint for admin/organizers,
    // so we might need to fetch it from analytics or a summary endpoint.
    // For now, let's assume it exists or use a mock fallback if omitted.
    return apiFetch<OrganizerKpi>('/api/v1/admin/organizers/kpis')
  }

  async getOrganizer(id: string): Promise<OrganizerDetailResponse> {
    const res = await apiFetch<unknown>(`/api/v1/admin/organizers/${id}`)
    return organizerDetailResponseSchema.parse({ success: true, data: { organizer: res } })
  }

  async approveOrganizer(id: string): Promise<void> {
    await apiFetch(`/api/v1/admin/organizers/${id}/approve`, { method: 'POST' })
  }

  async rejectOrganizer(id: string, data: RejectOrganizerFormValues): Promise<void> {
    await apiFetch(`/api/v1/admin/organizers/${id}/reject`, { 
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async suspendOrganizer(id: string, data: SuspendOrganizerFormValues): Promise<void> {
    await apiFetch(`/api/v1/admin/organizers/${id}/suspend`, { 
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async addNote(id: string, data: AddNoteFormValues): Promise<OrganizerNote> {
    const res = await apiFetch<OrganizerNote>(`/api/v1/admin/organizers/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
    return res
  }
}

// ─── Mock Data Generation ──────────────────────────────────────────────────
const CITIES = ['Hyderabad', 'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Pune']
const STATUSES = ['approved', 'pending', 'rejected', 'suspended'] as const
const KYC_STATUSES = ['verified', 'pending', 'not_submitted', 'rejected'] as const

const mockOrganizersList: OrganizerList[] = Array.from({ length: 48 }).map((_, i) => {
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

let mockDetailStore: Record<string, OrganizerDetail> = mockOrganizersList.reduce((acc, org) => {
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
    ]
  }
  return acc
}, {} as Record<string, OrganizerDetail>)

class MockOrganizersApi implements OrganizersApi {
  async getOrganizers(filters: OrganizerFilters): Promise<OrganizersResponse> {
    await new Promise(r => setTimeout(r, 600))
    let filtered = [...mockOrganizersList]
    
    if (filters.q) {
      const q = filters.q.toLowerCase()
      filtered = filtered.filter(o => 
        o.orgName.toLowerCase().includes(q) || 
        o.email?.toLowerCase().includes(q) || 
        o.phone?.includes(q)
      )
    }
    if (filters.status) filtered = filtered.filter(o => o.status === filters.status)
    if (filters.kyc) filtered = filtered.filter(o => o.kycStatus === filters.kyc)
    if (filters.city) filtered = filtered.filter(o => o.city === filters.city)
      
    const page = filters.page || 1
    const limit = filters.limit || 10
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)
    
    return {
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
    }
  }

  async getOrganizerKpis(): Promise<OrganizerKpi> {
    await new Promise(r => setTimeout(r, 400))
    return {
      total: mockOrganizersList.length,
      approved: mockOrganizersList.filter(o => o.status === 'approved').length,
      pending: mockOrganizersList.filter(o => o.status === 'pending').length,
      rejected: mockOrganizersList.filter(o => o.status === 'rejected').length,
      blocked: mockOrganizersList.filter(o => o.status === 'suspended').length,
    }
  }

  async getOrganizer(id: string): Promise<OrganizerDetailResponse> {
    await new Promise(r => setTimeout(r, 500))
    const org = mockDetailStore[id]
    if (!org) throw new Error('Not found')
    return { success: true, data: { organizer: org } }
  }

  async approveOrganizer(id: string): Promise<void> {
    await new Promise(r => setTimeout(r, 400))
    if (mockDetailStore[id]) {
      mockDetailStore[id].status = 'approved'
      mockDetailStore[id].kycStatus = 'verified'
      const listOrg = mockOrganizersList.find(o => o.id === id)
      if (listOrg) { listOrg.status = 'approved'; listOrg.kycStatus = 'verified' }
    }
  }

  async rejectOrganizer(id: string, data: RejectOrganizerFormValues): Promise<void> {
    await new Promise(r => setTimeout(r, 400))
    if (mockDetailStore[id]) {
      mockDetailStore[id].status = 'rejected'
      mockDetailStore[id].kycStatus = 'rejected'
      const listOrg = mockOrganizersList.find(o => o.id === id)
      if (listOrg) { listOrg.status = 'rejected'; listOrg.kycStatus = 'rejected' }
    }
  }

  async suspendOrganizer(id: string, data: SuspendOrganizerFormValues): Promise<void> {
    await new Promise(r => setTimeout(r, 400))
    if (mockDetailStore[id]) {
      mockDetailStore[id].status = 'suspended'
      const listOrg = mockOrganizersList.find(o => o.id === id)
      if (listOrg) { listOrg.status = 'suspended' }
    }
  }

  async addNote(id: string, data: AddNoteFormValues): Promise<OrganizerNote> {
    await new Promise(r => setTimeout(r, 400))
    const newNote: OrganizerNote = {
      id: crypto.randomUUID(),
      authorId: 'u1',
      authorName: 'Admin',
      note: data.note,
      createdAt: new Date().toISOString()
    }
    if (mockDetailStore[id]) {
      mockDetailStore[id].notes.unshift(newNote)
    }
    return newNote
  }
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
export const getOrganizersApi = (): OrganizersApi => USE_MOCK ? new MockOrganizersApi() : new HttpOrganizersApi()
