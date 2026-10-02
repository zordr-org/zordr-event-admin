export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded'
export type OrderStatus = 'confirmed' | 'pending' | 'cancelled'

export interface OrderListItem {
  id: string
  customerName: string
  customerEmail: string
  eventId: string
  eventName: string
  organizerId: string
  organizerName: string
  amount: number
  ticketsCount: number
  paymentGateway: string
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  createdAt: string
}

export interface OrdersFilters {
  page?: number
  limit?: number
  q?: string
  eventId?: string
  organizerId?: string
  paymentStatus?: PaymentStatus
  orderStatus?: OrderStatus
  dateFrom?: string
  dateTo?: string
}

export interface OrdersKpi {
  totalOrders: number
  paidOrders: number
  pendingOrders: number
  failedOrders: number
  refundedOrders: number
  successRate: number // percentage
}

export interface OrdersResponse {
  success: boolean
  data: {
    orders: OrderListItem[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export interface BulkActionRequest {
  orderIds: string[]
  action: 'refund' | 'export'
}

export interface BulkActionResponse {
  success: boolean
  data: {
    job: {
      id: string
      status: 'queued'
    }
  }
}
