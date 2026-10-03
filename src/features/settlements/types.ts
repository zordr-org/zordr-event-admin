export type SettlementStatus = 'pending' | 'paid' | 'on_hold' | 'failed'

export interface SettlementListItem {
  id: string
  organizerId: string
  organizerName: string
  eventIds: string[]
  periodStart: string
  periodEnd: string
  grossSales: number
  platformFee: number
  gatewayFee: number
  refunds: number
  netPayout: number
  status: SettlementStatus
  transferReference?: string
  transferDate?: string
  holdReason?: string
  createdAt: string
}

export interface SettlementsFilters {
  page?: number
  limit?: number
  organizerId?: string
  eventId?: string
  status?: SettlementStatus
  dateFrom?: string
  dateTo?: string
}

export interface SettlementsKpi {
  totalPayout: number
  paidPayout: number
  pendingPayout: number
  onHoldPayout: number
}

export interface SettlementsResponse {
  success: boolean
  data: {
    settlements: SettlementListItem[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export interface GenerateSettlementRequest {
  periodStart: string
  periodEnd: string
  organizerId?: string
}

export interface GenerateSettlementResponse {
  success: boolean
  data: {
    job: {
      id: string
      status: 'queued'
    }
  }
}
