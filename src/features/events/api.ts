import { apiFetch } from '@/lib/api/client'
import type {
  EventFilters,
  EventsResponse,
  EventKpi,
  EventReviewResponse,
  SendBackFormValues,
  RejectEventFormValues,
  UpdateChecklistItemValues,
  ChecklistItem,
  ReviewCycle,
  EventListItem,
  EventDetail,
  EventReview,
} from './types'

// ─── Interface ────────────────────────────────────────────────────────────────
export interface EventsApi {
  getEvents(filters: EventFilters): Promise<EventsResponse>
  getEventKpis(): Promise<EventKpi>
  getEventReview(id: string): Promise<EventReviewResponse>
  updateChecklist(id: string, data: UpdateChecklistItemValues): Promise<ChecklistItem>
  approveEvent(id: string): Promise<void>
  sendBack(id: string, data: SendBackFormValues): Promise<void>
  rejectEvent(id: string, data: RejectEventFormValues): Promise<void>
  getPreview(id: string): Promise<EventDetail>
}

// ─── HTTP Implementation ──────────────────────────────────────────────────────
class HttpEventsApi implements EventsApi {
  async getEvents(filters: EventFilters): Promise<EventsResponse> {
    const params = new URLSearchParams()
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('limit', String(filters.limit))
    if (filters.q) params.set('search', filters.q)
    if (filters.status) params.set('status', filters.status)
    if (filters.category) params.set('category', filters.category)
    if (filters.city) params.set('city', filters.city)
    if (filters.organizerId) params.set('organizerId', filters.organizerId)
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.set('dateTo', filters.dateTo)
    return apiFetch<EventsResponse>(`/api/v1/admin/events?${params}`)
  }

  async getEventKpis(): Promise<EventKpi> {
    return apiFetch<EventKpi>('/api/v1/admin/events/kpis')
  }

  async getEventReview(id: string): Promise<EventReviewResponse> {
    return apiFetch<EventReviewResponse>(`/api/v1/admin/events/${id}/review`)
  }

  async updateChecklist(id: string, data: UpdateChecklistItemValues): Promise<ChecklistItem> {
    return apiFetch<ChecklistItem>(`/api/v1/admin/events/${id}/review/checklist`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async approveEvent(id: string): Promise<void> {
    await apiFetch(`/api/v1/admin/events/${id}/approve`, { method: 'POST' })
  }

  async sendBack(id: string, data: SendBackFormValues): Promise<void> {
    await apiFetch(`/api/v1/admin/events/${id}/send-back`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async rejectEvent(id: string, data: RejectEventFormValues): Promise<void> {
    await apiFetch(`/api/v1/admin/events/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getPreview(id: string): Promise<EventDetail> {
    return apiFetch<EventDetail>(`/api/v1/admin/events/${id}/preview`)
  }
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const CATEGORIES = ['Music', 'Tech', 'Cultural', 'Sports', 'Workshop', 'Comedy', 'Art', 'Food']
const CITIES = ['Hyderabad', 'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Pune']
const ORGANIZER_NAMES = [
  'Starlight Events', 'TechFest Org', 'Cultural Hub', 'SportZone', 'UpSkill Academy',
  'Comedy Club HYD', 'ArtSpace BLR', 'FoodFest India',
]

const CHECKLIST_LABELS: Record<string, string> = {
  banner_images: 'Banner & Images',
  details_description: 'Details & Description',
  datetime_venue: 'Date, Time & Venue',
  ticket_pricing: 'Ticket Types & Pricing',
  organizer_info: 'Organizer Info',
  policies_terms: 'Policies & Terms',
  content_guidelines: 'Content Guidelines',
}

function defaultChecklist(allGood = false): ChecklistItem[] {
  return Object.keys(CHECKLIST_LABELS).map((key) => ({
    key: key as any,
    label: CHECKLIST_LABELS[key],
    status: allGood ? 'looks_good' : 'pending',
  }))
}

function partialChecklist(goodKeys: string[]): ChecklistItem[] {
  return Object.keys(CHECKLIST_LABELS).map((key) => ({
    key: key as any,
    label: CHECKLIST_LABELS[key],
    status: goodKeys.includes(key) ? 'looks_good' : 'pending',
  })) as ChecklistItem[]
}

function makeEvent(overrides: Partial<EventListItem> & { id: string }): EventListItem {
  const idx = parseInt(overrides.id.replace('evt-', ''), 10) - 1
  const dateOffset = idx * 7 * 24 * 60 * 60 * 1000
  const dateFrom = new Date(Date.now() + dateOffset + 30 * 24 * 60 * 60 * 1000).toISOString()
  const dateTo = new Date(Date.parse(dateFrom) + 3 * 60 * 60 * 1000).toISOString()

  return {
    id: overrides.id,
    title: overrides.title ?? `Event ${idx + 1}`,
    organizerId: overrides.organizerId ?? `org-${(idx % 8) + 1}`,
    organizerName: overrides.organizerName ?? ORGANIZER_NAMES[idx % ORGANIZER_NAMES.length],
    category: overrides.category ?? CATEGORIES[idx % CATEGORIES.length],
    city: overrides.city ?? CITIES[idx % CITIES.length],
    dateFrom: overrides.dateFrom ?? dateFrom,
    dateTo: overrides.dateTo ?? dateTo,
    status: overrides.status ?? 'draft',
    venueType: overrides.venueType ?? 'offline',
    ticketCount: overrides.ticketCount ?? Math.floor(Math.random() * 500 + 50),
    totalRevenue: overrides.totalRevenue ?? Math.floor(Math.random() * 200000),
    bannerUrl: overrides.bannerUrl,
    submittedAt: overrides.submittedAt ?? (overrides.status !== 'draft' ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() : undefined),
  }
}

function makeEventDetail(base: EventListItem): EventDetail {
  return {
    ...base,
    description: `${base.title} is a premier ${base.category.toLowerCase()} event organized by ${base.organizerName}. Join us for an unforgettable experience featuring top-tier performances, interactive sessions, and networking opportunities. This event is open to all enthusiasts and professionals in the field.`,
    venueName: `${base.city} Convention Center`,
    venueAddress: `123 Main Street, ${base.city}, India`,
    venueLatLng: { lat: 17.385, lng: 78.4867 },
    bannerImages: [],
    galleryImages: [],
    ticketTypes: [
      { id: 'tt-1', name: 'General Admission', price: 499, quantity: 300, sold: 187 },
      { id: 'tt-2', name: 'VIP', price: 1499, quantity: 100, sold: 43, description: 'Includes backstage access and refreshments' },
      { id: 'tt-3', name: 'Early Bird', price: 299, quantity: 100, sold: 100, description: 'Sold out — early access pricing' },
    ],
    tags: [base.category, base.city, 'Zordr'],
    refundPolicy: 'Full refund available up to 48 hours before the event. No refunds within 48 hours.',
    termsAndConditions: 'By registering, you agree to our standard terms and conditions. The organizer reserves the right to make changes to the event schedule.',
    ageRestriction: '18+',
    contactEmail: `events@${base.organizerName.toLowerCase().replace(/\s/g, '')}.in`,
    contactPhone: '+91 9876543210',
  }
}

// ─── 18 Mock Events ────────────────────────────────────────────────────────────
export const mockEventsList: EventListItem[] = [
  // 3 draft
  makeEvent({ id: 'evt-1', title: 'Techverse Summit 2026', status: 'draft', category: 'Tech', city: 'Bangalore' }),
  makeEvent({ id: 'evt-2', title: 'Indie Music Fest', status: 'draft', category: 'Music', city: 'Mumbai' }),
  makeEvent({ id: 'evt-3', title: 'Comedy Night Hyderabad', status: 'draft', category: 'Comedy', city: 'Hyderabad' }),

  // 4 pending_review (2 of which have multi-cycle history)
  makeEvent({ id: 'evt-4', title: 'Design Systems Workshop', status: 'pending_review', category: 'Workshop', city: 'Bangalore', submittedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() }),
  makeEvent({ id: 'evt-5', title: 'Startup Pitch Night', status: 'pending_review', category: 'Tech', city: 'Delhi', submittedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() }),
  // Multi-cycle: sent back once, now resubmitted
  makeEvent({ id: 'evt-6', title: 'FoodFest Hyderabad 2026', status: 'pending_review', category: 'Food', city: 'Hyderabad', submittedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() }),
  makeEvent({ id: 'evt-7', title: 'Classical Dance Night', status: 'pending_review', category: 'Cultural', city: 'Chennai', submittedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() }),

  // 3 published
  makeEvent({ id: 'evt-8', title: 'Tech Conference 2026', status: 'published', category: 'Tech', city: 'Hyderabad', totalRevenue: 124500 }),
  makeEvent({ id: 'evt-9', title: 'Jazz Under the Stars', status: 'published', category: 'Music', city: 'Mumbai', totalRevenue: 87200 }),
  makeEvent({ id: 'evt-10', title: 'Hackathon 48H', status: 'published', category: 'Tech', city: 'Bangalore', totalRevenue: 32000 }),

  // 2 sent_back (organizer hasn't resubmitted)
  makeEvent({ id: 'evt-11', title: 'Art Exhibition Open House', status: 'sent_back', category: 'Art', city: 'Pune' }),
  makeEvent({ id: 'evt-12', title: 'Fitness Bootcamp Series', status: 'sent_back', category: 'Sports', city: 'Delhi' }),

  // 2 rejected
  makeEvent({ id: 'evt-13', title: 'Disallowed Content Event', status: 'rejected', category: 'Tech', city: 'Mumbai' }),
  makeEvent({ id: 'evt-14', title: 'Fraudulent Ticket Scheme', status: 'rejected', category: 'Music', city: 'Hyderabad' }),

  // 2 cancelled
  makeEvent({ id: 'evt-15', title: 'Summer Gala 2026', status: 'cancelled', category: 'Cultural', city: 'Bangalore' }),
  makeEvent({ id: 'evt-16', title: 'Open Mic Night', status: 'cancelled', category: 'Comedy', city: 'Chennai' }),

  // 2 completed
  makeEvent({ id: 'evt-17', title: 'DevFest Hyderabad 2025', status: 'completed', category: 'Tech', city: 'Hyderabad', totalRevenue: 210000 }),
  makeEvent({ id: 'evt-18', title: 'Winter Music Carnival', status: 'completed', category: 'Music', city: 'Goa', totalRevenue: 178000 }),
]

// ─── Review Store ─────────────────────────────────────────────────────────────
type ReviewStore = Record<string, EventReview>

function buildReviewHistory(cycles: Partial<ReviewCycle>[]): ReviewCycle[] {
  return cycles.map((c, i) => ({
    id: `cycle-${c.id ?? i + 1}`,
    cycleNumber: i + 1,
    submittedAt: c.submittedAt ?? new Date(Date.now() - (cycles.length - i) * 3 * 24 * 3600 * 1000).toISOString(),
    resolvedAt: c.resolvedAt,
    action: c.action ?? 'pending',
    adminId: c.adminId ?? 'u-super',
    adminName: c.adminName ?? 'Admin',
    notes: c.notes,
    reason: c.reason,
  }))
}

export const mockReviewStore: ReviewStore = mockEventsList.reduce((acc, event) => {
  const detail = makeEventDetail(event)

  let checklist: ChecklistItem[]
  let reviewHistory: ReviewCycle[]
  let adminNotes = ''

  if (event.id === 'evt-4') {
    // Partially checked — missing 3 items
    checklist = partialChecklist(['banner_images', 'details_description', 'datetime_venue', 'organizer_info'])
    reviewHistory = buildReviewHistory([{ action: 'pending' }])
  } else if (event.id === 'evt-5') {
    // Only 1 item done
    checklist = partialChecklist(['banner_images'])
    reviewHistory = buildReviewHistory([{ action: 'pending' }])
  } else if (event.id === 'evt-6') {
    // Multi-cycle: sent back once for missing images, then resubmitted with all looks_good
    checklist = defaultChecklist(true)
    adminNotes = 'Resubmitted after banner fix. Looks good now.'
    reviewHistory = buildReviewHistory([
      {
        action: 'sent_back',
        resolvedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
        notes: 'Banner images were low resolution. Please resubmit with HD images.',
      },
      { action: 'pending' },
    ])
  } else if (event.id === 'evt-7') {
    // Multi-cycle: sent back once for missing policy, resubmitted — still partially checked
    checklist = partialChecklist(['banner_images', 'details_description', 'datetime_venue', 'ticket_pricing', 'organizer_info'])
    adminNotes = 'Policies section still needs review.'
    reviewHistory = buildReviewHistory([
      {
        action: 'sent_back',
        resolvedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
        notes: 'Missing refund policy and terms. Ticket pricing format incorrect.',
      },
      { action: 'pending' },
    ])
  } else if (event.id === 'evt-11' || event.id === 'evt-12') {
    checklist = partialChecklist(['banner_images', 'details_description'])
    reviewHistory = buildReviewHistory([
      {
        action: 'sent_back',
        resolvedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        notes: 'Missing venue details and ticket structure. Please fix and resubmit.',
      },
    ])
  } else if (event.status === 'published') {
    checklist = defaultChecklist(true)
    reviewHistory = buildReviewHistory([
      { action: 'approved', resolvedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
    ])
  } else if (event.status === 'rejected') {
    checklist = defaultChecklist(false)
    reviewHistory = buildReviewHistory([
      {
        action: 'rejected',
        resolvedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        reason: 'Event content violates platform content guidelines. Repeated violations will result in account suspension.',
      },
    ])
  } else if (event.status === 'completed') {
    checklist = defaultChecklist(true)
    reviewHistory = buildReviewHistory([
      { action: 'approved', resolvedAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString() },
    ])
  } else {
    checklist = defaultChecklist(false)
    reviewHistory = buildReviewHistory([{ action: 'pending' }])
  }

  acc[event.id] = { event: detail, checklist, adminNotes, reviewHistory }
  return acc
}, {} as ReviewStore)

// ─── Mock API Class ───────────────────────────────────────────────────────────
export class MockEventsApi implements EventsApi {
  async getEvents(filters: EventFilters): Promise<EventsResponse> {
    await new Promise((r) => setTimeout(r, 10))
    let filtered = [...mockEventsList]

    if (filters.q) {
      const q = filters.q.toLowerCase()
      filtered = filtered.filter(
        (e) => e.title.toLowerCase().includes(q) || e.organizerName.toLowerCase().includes(q) || e.city.toLowerCase().includes(q)
      )
    }
    if (filters.status) filtered = filtered.filter((e) => e.status === filters.status)
    if (filters.category) filtered = filtered.filter((e) => e.category === filters.category)
    if (filters.city) filtered = filtered.filter((e) => e.city === filters.city)
    if (filters.organizerId) filtered = filtered.filter((e) => e.organizerId === filters.organizerId)

    const page = filters.page ?? 1
    const limit = filters.limit ?? 15
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    return {
      success: true,
      data: {
        events: paginated,
        pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
      },
    }
  }

  async getEventKpis(): Promise<EventKpi> {
    await new Promise((r) => setTimeout(r, 10))
    return {
      total: mockEventsList.length,
      published: mockEventsList.filter((e) => e.status === 'published').length,
      pendingReview: mockEventsList.filter((e) => e.status === 'pending_review' || e.status === 'submitted').length,
      completed: mockEventsList.filter((e) => e.status === 'completed').length,
      cancelled: mockEventsList.filter((e) => e.status === 'cancelled').length,
    }
  }

  async getEventReview(id: string): Promise<EventReviewResponse> {
    await new Promise((r) => setTimeout(r, 10))
    const review = mockReviewStore[id]
    if (!review) throw new Error('Event not found')
    return { success: true, data: { review } }
  }

  async updateChecklist(id: string, data: UpdateChecklistItemValues): Promise<ChecklistItem> {
    await new Promise((r) => setTimeout(r, 10))
    const review = mockReviewStore[id]
    if (!review) throw new Error('Event not found')
    const itemIdx = review.checklist.findIndex((c) => c.key === data.item)
    if (itemIdx === -1) throw new Error('Checklist item not found')
    review.checklist[itemIdx] = {
      ...review.checklist[itemIdx],
      status: data.status,
      comment: data.comment,
    }
    return review.checklist[itemIdx]
  }

  async approveEvent(id: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 10))
    const review = mockReviewStore[id]
    if (!review) throw new Error('Event not found')

    const incomplete = review.checklist.filter((c) => c.status !== 'looks_good')
    if (incomplete.length > 0) {
      throw new Error(`Cannot approve: ${incomplete.map((c) => c.label).join(', ')} not marked as Looks Good`)
    }

    // Update list item status
    const listItem = mockEventsList.find((e) => e.id === id)
    if (listItem) listItem.status = 'published'
    review.event.status = 'published'

    // Close current cycle, add approved cycle
    const lastCycle = review.reviewHistory[review.reviewHistory.length - 1]
    if (lastCycle) {
      lastCycle.action = 'approved'
      lastCycle.resolvedAt = new Date().toISOString()
      lastCycle.adminId = 'u-super'
      lastCycle.adminName = 'Admin'
    }
  }

  async sendBack(id: string, data: SendBackFormValues): Promise<void> {
    await new Promise((r) => setTimeout(r, 10))
    const review = mockReviewStore[id]
    if (!review) throw new Error('Event not found')

    const listItem = mockEventsList.find((e) => e.id === id)
    if (listItem) listItem.status = 'sent_back'
    review.event.status = 'sent_back'

    // Resolve current cycle as sent_back
    const lastCycle = review.reviewHistory[review.reviewHistory.length - 1]
    if (lastCycle && lastCycle.action === 'pending') {
      lastCycle.action = 'sent_back'
      lastCycle.resolvedAt = new Date().toISOString()
      lastCycle.adminId = 'u-super'
      lastCycle.adminName = 'Admin'
      lastCycle.notes = data.notes
    }
  }

  async rejectEvent(id: string, data: RejectEventFormValues): Promise<void> {
    await new Promise((r) => setTimeout(r, 10))
    const review = mockReviewStore[id]
    if (!review) throw new Error('Event not found')

    const listItem = mockEventsList.find((e) => e.id === id)
    if (listItem) listItem.status = 'rejected'
    review.event.status = 'rejected'

    const lastCycle = review.reviewHistory[review.reviewHistory.length - 1]
    if (lastCycle && lastCycle.action === 'pending') {
      lastCycle.action = 'rejected'
      lastCycle.resolvedAt = new Date().toISOString()
      lastCycle.adminId = 'u-super'
      lastCycle.adminName = 'Admin'
      lastCycle.reason = data.reason
    }
  }

  async getPreview(id: string): Promise<EventDetail> {
    await new Promise((r) => setTimeout(r, 10))
    const review = mockReviewStore[id]
    if (!review) throw new Error('Event not found')
    return review.event
  }
}

// ─── Export ───────────────────────────────────────────────────────────────────
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
export const getEventsApi = (): EventsApi => (USE_MOCK ? new MockEventsApi() : new HttpEventsApi())
