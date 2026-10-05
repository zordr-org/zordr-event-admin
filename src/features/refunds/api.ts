import { apiFetch } from '@/lib/api/client'
import type { RefundsFilters, RefundsKpi, RefundsResponse, ReviewRefundRequest, ReviewRefundResponse, RefundListItem } from './types'

export interface RefundsApi {
  getRefunds(filters: RefundsFilters): Promise<RefundsResponse>
  getRefundsKpis(): Promise<RefundsKpi>
  reviewRefund(id: string, data: ReviewRefundRequest): Promise<ReviewRefundResponse>
}

class HttpRefundsApi implements RefundsApi {
  async getRefunds(filters: RefundsFilters): Promise<RefundsResponse> {
    const params = new URLSearchParams()
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('limit', String(filters.limit))
    if (filters.status) params.set('status', filters.status)
    if (filters.eventId) params.set('eventId', filters.eventId)
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.set('dateTo', filters.dateTo)
    
    return apiFetch<RefundsResponse>(`/api/admin/refunds?${params}`)
  }

  async getRefundsKpis(): Promise<RefundsKpi> {
    return apiFetch<RefundsKpi>('/api/admin/refunds/kpis')
  }

  async reviewRefund(id: string, data: ReviewRefundRequest): Promise<ReviewRefundResponse> {
    return apiFetch<ReviewRefundResponse>(`/api/admin/refunds/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

// ─── Export ───────────────────────────────────────────────────────────────────
export const getRefundsApi = (): RefundsApi => new HttpRefundsApi()
