export type TicketStatus = 'open' | 'pending' | 'resolved'
export type TicketCategory = 'tickets' | 'payments' | 'refunds' | 'event_info' | 'orders' | 'accessibility' | 'general'
export type TicketPriority = 'high' | 'medium' | 'low'
export type RequesterType = 'customer' | 'organizer'

export interface SupportTicketListItem {
  id: string
  requesterType: RequesterType
  requesterName: string
  subject: string
  category: TicketCategory
  eventName?: string
  eventId?: string
  status: TicketStatus
  priority: TicketPriority
  createdAt: string
  firstResponseAt?: string
  resolvedAt?: string
}

export interface SupportMessage {
  id: string
  authorName: string
  authorType: 'customer' | 'organizer' | 'admin'
  message: string
  createdAt: string
}

export interface SupportTicketThread {
  ticket: SupportTicketListItem
  messages: SupportMessage[]
}

export interface SupportFilters {
  page?: number
  limit?: number
  status?: TicketStatus | ''
  category?: TicketCategory | ''
  priority?: TicketPriority | ''
  requesterType?: RequesterType | ''
  eventId?: string
  search?: string
}

export interface SupportKpi {
  totalTickets: number
  openTickets: number
  pendingTickets: number
  resolvedTickets: number
  highPriority: number
  avgResponseTime: string
}

export interface SupportListResponse {
  success: boolean
  data: {
    tickets: SupportTicketListItem[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export interface ReplyTicketRequest {
  message?: string
  status?: TicketStatus
}

export interface ReplyTicketResponse {
  success: boolean
  data?: SupportTicketListItem
}

export interface TicketThreadResponse {
  success: boolean
  data?: SupportTicketThread
}
