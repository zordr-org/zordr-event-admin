import { apiFetch } from '@/lib/api/client'
import type { SupportFilters, SupportKpi, SupportListResponse, ReplyTicketRequest, ReplyTicketResponse, TicketThreadResponse } from './types'

export interface SupportApi {
  getTickets(filters: SupportFilters): Promise<SupportListResponse>
  getSupportKpis(): Promise<SupportKpi>
  replyTicket(id: string, data: ReplyTicketRequest): Promise<ReplyTicketResponse>
  // TODO: The API contract does not define an admin endpoint for GET /admin/support/{id} for fetching the thread.
  // We mock this using an adapter function until backend adds it.
  getTicketThread(id: string): Promise<TicketThreadResponse>
}

class HttpSupportApi implements SupportApi {
  async getTickets(filters: SupportFilters): Promise<SupportListResponse> {
    const params = new URLSearchParams()
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('limit', String(filters.limit))
    if (filters.status) params.set('status', filters.status)
    if (filters.category) params.set('category', filters.category)
    if (filters.priority) params.set('priority', filters.priority)
    if (filters.requesterType) params.set('requesterType', filters.requesterType)
    if (filters.eventId) params.set('eventId', filters.eventId)
    if (filters.search) params.set('search', filters.search)
    
    return apiFetch<SupportListResponse>(`/api/admin/support?${params}`)
  }

  async getSupportKpis(): Promise<SupportKpi> {
    return apiFetch<SupportKpi>('/api/admin/support/kpis')
  }

  async replyTicket(id: string, data: ReplyTicketRequest): Promise<ReplyTicketResponse> {
    return apiFetch<ReplyTicketResponse>(`/api/admin/support/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getTicketThread(id: string): Promise<TicketThreadResponse> {
    // Calling our mock adapter route 
    return apiFetch<TicketThreadResponse>(`/api/admin/support/${id}/thread`)
  }
}

// ─── Export ───────────────────────────────────────────────────────────────────
export const getSupportApi = (): SupportApi => new HttpSupportApi()
