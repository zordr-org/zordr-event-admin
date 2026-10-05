export type RefundStatus = 'pending' | 'processed' | 'rejected'

export interface RefundListItem {
  id: string
  orderId: string
  customerName: string
  eventId: string
  eventName: string
  organizerId: string
  amount: number
  reason: string
  status: RefundStatus
  requestedOn: string
  processedOn?: string
  notes?: string
  settlementAdjustment?: 'applied' | 'deferred_settlement_paid'
}

export interface RefundsFilters {
  page?: number
  limit?: number
  status?: RefundStatus
  eventId?: string
  dateFrom?: string
  dateTo?: string
}

export interface RefundsKpi {
  totalRefunds: number
  processedRefunds: number
  pendingRefunds: number
  rejectedRefunds: number
}

export interface RefundsResponse {
  success: boolean
  data: {
    refunds: RefundListItem[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export interface ReviewRefundRequest {
  decision: 'approve' | 'reject'
  notes?: string
}

export interface ReviewRefundResponse {
  success: boolean
  data?: RefundListItem
}
