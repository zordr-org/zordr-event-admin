export type CustomerStatus = 'active' | 'blocked'

export interface CustomerListItem {
  id: string
  name: string
  email: string
  city: string
  eventsAttended: number
  ticketsPurchased: number
  lifetimeSpend: number
  lastOrderId?: string
  status: CustomerStatus
  joinedOn: string
}

export interface CustomersFilters {
  page?: number
  limit?: number
  q?: string
  status?: CustomerStatus
  city?: string
  dateFrom?: string
  dateTo?: string
}

export interface CustomersKpi {
  totalCustomers: number
  activeCustomers: number
  newThisMonth: number
  repeatCustomers: number
  blockedCustomers: number
}

export interface CustomersResponse {
  success: boolean
  data: {
    customers: CustomerListItem[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export interface BlockCustomerRequest {
  reason: string
}
