import { apiFetch } from '@/lib/api/client'
import type { CustomerListItem, CustomersFilters, CustomersKpi, CustomersResponse, BlockCustomerRequest } from './types'
import { mockOrdersList } from '@/features/orders/api'

export interface CustomersApi {
  getCustomers(filters: CustomersFilters): Promise<CustomersResponse>
  getCustomersKpis(): Promise<CustomersKpi>
  blockCustomer(id: string, data: BlockCustomerRequest): Promise<{ success: boolean }>
  unblockCustomer(id: string): Promise<{ success: boolean }>
}

class HttpCustomersApi implements CustomersApi {
  async getCustomers(filters: CustomersFilters): Promise<CustomersResponse> {
    const params = new URLSearchParams()
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('limit', String(filters.limit))
    if (filters.q) params.set('search', filters.q)
    if (filters.status) params.set('status', filters.status)
    if (filters.city) params.set('city', filters.city)
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.set('dateTo', filters.dateTo)
    
    return apiFetch<CustomersResponse>(`/api/admin/customers?${params}`)
  }

  async getCustomersKpis(): Promise<CustomersKpi> {
    return apiFetch<CustomersKpi>('/api/admin/customers/kpis')
  }

  async blockCustomer(id: string, data: BlockCustomerRequest): Promise<{ success: boolean }> {
    return apiFetch<{ success: boolean }>(`/api/admin/customers/${id}/block`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async unblockCustomer(id: string): Promise<{ success: boolean }> {
    return apiFetch<{ success: boolean }>(`/api/admin/customers/${id}/unblock`, {
      method: 'POST',
    })
  }
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const CUSTOMER_NAMES = ['Aarav Sharma', 'Vivaan Patel', 'Aditya Kumar', 'Vihaan Gupta', 'Arjun Singh', 'Sai Desai', 'Reyansh Reddy', 'Ayaan Iyer', 'Krishna Rao', 'Ishaan Menon', 'Shaurya Nair', 'Atharv Pillai', 'Kabir Das', 'Rudra Bose', 'Dev Chatterjee', 'Om Mukherjee', 'Dhruv Banerjee', 'Aryan Sengupta', 'Kartik Basu', 'Rishabh Dutta', 'Ananya Joshi', 'Diya Kulkarni', 'Isha Deshmukh', 'Meera Patil', 'Neha Deshpande']
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune']

function generateCustomers(): CustomerListItem[] {
  const customers: CustomerListItem[] = []
  
  for (let i = 1; i <= 25; i++) {
    const email = `customer${i}@example.com`
    const customerOrders = mockOrdersList.filter(o => o.customerEmail === email)
    
    const paidOrders = customerOrders.filter(o => o.paymentStatus === 'paid')
    const lifetimeSpend = paidOrders.reduce((sum, o) => sum + o.amount, 0)
    const ticketsPurchased = customerOrders.reduce((sum, o) => sum + o.ticketsCount, 0)
    // simulate attendance (no-shows means attended < purchased)
    const eventsAttended = Math.max(0, ticketsPurchased > 0 ? ticketsPurchased - (i % 2 === 0 ? 1 : 0) : 0)
    
    // Sort to get last order
    const sortedOrders = [...customerOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const lastOrderId = sortedOrders.length > 0 ? `${sortedOrders[0].id} (${sortedOrders[0].eventId})` : undefined

    let status: 'active' | 'blocked' = 'active'
    if (i % 7 === 0) status = 'blocked'

    // joined date
    const daysAgo = i * 2
    const joinedOn = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
    
    customers.push({
      id: `cus-${String(i).padStart(4, '0')}`,
      name: CUSTOMER_NAMES[i - 1] || `Customer ${i}`,
      email,
      city: CITIES[i % CITIES.length],
      eventsAttended,
      ticketsPurchased,
      lifetimeSpend,
      lastOrderId,
      status,
      joinedOn,
    })
  }
  return customers
}

export const mockCustomersList = generateCustomers()

class MockCustomersApi implements CustomersApi {
  async getCustomers(filters: CustomersFilters): Promise<CustomersResponse> {
    await new Promise((r) => setTimeout(r, 100))
    let filtered = [...mockCustomersList]

    if (filters.q) {
      const q = filters.q.toLowerCase()
      filtered = filtered.filter(
        (c) => c.name.toLowerCase().includes(q) || 
               c.email.toLowerCase().includes(q) || 
               c.id.toLowerCase().includes(q)
      )
    }
    if (filters.status) filtered = filtered.filter((c) => c.status === filters.status)
    if (filters.city) filtered = filtered.filter((c) => c.city === filters.city)
    
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime()
      filtered = filtered.filter((c) => new Date(c.joinedOn).getTime() >= from)
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo).getTime()
      filtered = filtered.filter((c) => new Date(c.joinedOn).getTime() <= to)
    }

    const page = filters.page ?? 1
    const limit = filters.limit ?? 15
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    return {
      success: true,
      data: {
        customers: paginated,
        pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
      },
    }
  }

  async getCustomersKpis(): Promise<CustomersKpi> {
    await new Promise((r) => setTimeout(r, 100))
    const totalCustomers = mockCustomersList.length
    const activeCustomers = mockCustomersList.filter(c => c.status === 'active').length
    const blockedCustomers = mockCustomersList.filter(c => c.status === 'blocked').length
    
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const newThisMonth = mockCustomersList.filter(c => new Date(c.joinedOn) >= firstDayOfMonth).length
    
    // simulate repeat: >1 completed order
    const repeatCustomers = mockCustomersList.filter(c => {
      const customerOrders = mockOrdersList.filter(o => o.customerEmail === c.email && o.orderStatus === 'confirmed')
      return customerOrders.length > 1
    }).length
    
    return {
      totalCustomers,
      activeCustomers,
      newThisMonth,
      repeatCustomers,
      blockedCustomers
    }
  }

  async blockCustomer(id: string, data: BlockCustomerRequest): Promise<{ success: boolean }> {
    await new Promise((r) => setTimeout(r, 200))
    const c = mockCustomersList.find(x => x.id === id)
    if (c) c.status = 'blocked'
    return { success: true }
  }

  async unblockCustomer(id: string): Promise<{ success: boolean }> {
    await new Promise((r) => setTimeout(r, 200))
    const c = mockCustomersList.find(x => x.id === id)
    if (c) c.status = 'active'
    return { success: true }
  }
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
export const getCustomersApi = (): CustomersApi => (USE_MOCK ? new MockCustomersApi() : new HttpCustomersApi())
