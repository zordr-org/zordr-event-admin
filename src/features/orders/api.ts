import { apiFetch } from '@/lib/api/client'
import type { OrderListItem, OrdersFilters, OrdersKpi, OrdersResponse, BulkActionRequest, BulkActionResponse } from './types'

export interface OrdersApi {
  getOrders(filters: OrdersFilters): Promise<OrdersResponse>
  getOrdersKpis(): Promise<OrdersKpi>
  bulkAction(data: BulkActionRequest): Promise<BulkActionResponse>
  exportOrders(filters: OrdersFilters): Promise<Blob>
}

class HttpOrdersApi implements OrdersApi {
  async getOrders(filters: OrdersFilters): Promise<OrdersResponse> {
    const params = new URLSearchParams()
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('limit', String(filters.limit))
    if (filters.q) params.set('search', filters.q)
    if (filters.eventId) params.set('eventId', filters.eventId)
    if (filters.organizerId) params.set('organizerId', filters.organizerId)
    if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus)
    if (filters.orderStatus) params.set('orderStatus', filters.orderStatus)
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.set('dateTo', filters.dateTo)
    
    return apiFetch<OrdersResponse>(`/api/admin/orders?${params}`)
  }

  async getOrdersKpis(): Promise<OrdersKpi> {
    return apiFetch<OrdersKpi>('/api/admin/orders/kpis')
  }

  async bulkAction(data: BulkActionRequest): Promise<BulkActionResponse> {
    return apiFetch<BulkActionResponse>('/api/admin/orders/bulk-action', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async exportOrders(filters: OrdersFilters): Promise<Blob> {
    const params = new URLSearchParams()
    if (filters.q) params.set('search', filters.q)
    if (filters.eventId) params.set('eventId', filters.eventId)
    if (filters.organizerId) params.set('organizerId', filters.organizerId)
    if (filters.paymentStatus) params.set('paymentStatus', filters.paymentStatus)
    if (filters.orderStatus) params.set('orderStatus', filters.orderStatus)
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.set('dateTo', filters.dateTo)

    const response = await fetch(`/api/admin/orders/export?${params}`)
    if (!response.ok) throw new Error('Export failed')
    return response.blob()
  }
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const CUSTOMER_NAMES = ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Neha Gupta', 'Vikram Singh', 'Anjali Desai', 'Rohan Reddy', 'Kavita Iyer']
const GATEWAYS = ['Stripe', 'Razorpay', 'Paytm']

// Use the same mapping logic as the Events mock data
const getEventName = (id: string) => {
  const titles = [
    'Techverse Summit 2026', 'Indie Music Fest', 'Comedy Night Hyderabad',
    'Design Systems Workshop', 'Startup Pitch Night', 'FoodFest Hyderabad 2026', 'Classical Dance Night',
    'Tech Conference 2026', 'Jazz Under the Stars', 'Hackathon 48H',
    'Art Exhibition Open House', 'Fitness Bootcamp Series',
    'Disallowed Content Event', 'Fraudulent Ticket Scheme',
    'Summer Gala 2026', 'Open Mic Night',
    'DevFest Hyderabad 2025', 'Winter Music Carnival'
  ]
  const idx = parseInt(id.replace('evt-', ''), 10) - 1
  return titles[idx] || `Event ${idx + 1}`
}

const getOrganizerName = (id: string) => {
  const names = [
    'Starlight Events', 'TechFest Org', 'Cultural Hub', 'SportZone', 'UpSkill Academy',
    'Comedy Club HYD', 'ArtSpace BLR', 'FoodFest India'
  ]
  const idx = parseInt(id.replace('org-', ''), 10) - 1
  return names[idx] || `Organizer ${idx + 1}`
}

function generateOrders(): OrderListItem[] {
  const orders: OrderListItem[] = []
  let orderCounter = 1

  for (let i = 1; i <= 18; i++) {
    const eventId = `evt-${i}`
    const eventName = getEventName(eventId)
    const organizerId = `org-${((i - 1) % 8) + 1}`
    const organizerName = getOrganizerName(organizerId)

    // Generate 1-3 orders per event
    const count = (i % 3) + 1 
    for (let j = 0; j < count; j++) {
      const isPaid = orderCounter % 4 !== 0
      const isRefunded = orderCounter % 7 === 0
      const isFailed = orderCounter % 9 === 0
      
      let paymentStatus: any = 'paid'
      let orderStatus: any = 'confirmed'
      
      if (isFailed) {
        paymentStatus = 'failed'
        orderStatus = 'cancelled'
      } else if (isRefunded) {
        paymentStatus = 'refunded'
        orderStatus = 'cancelled'
      } else if (!isPaid) {
        paymentStatus = 'pending'
        orderStatus = 'pending'
      }

      const ticketsCount = (orderCounter % 4) + 1
      const basePrice = (orderCounter % 3 + 1) * 500

      orders.push({
        id: `ord-${String(orderCounter).padStart(4, '0')}`,
        customerName: CUSTOMER_NAMES[orderCounter % CUSTOMER_NAMES.length],
        customerEmail: `customer${orderCounter}@example.com`,
        eventId,
        eventName,
        organizerId,
        organizerName,
        amount: ticketsCount * basePrice,
        ticketsCount,
        paymentGateway: GATEWAYS[orderCounter % GATEWAYS.length],
        paymentStatus,
        orderStatus,
        createdAt: new Date(Date.now() - orderCounter * 3 * 60 * 60 * 1000).toISOString(),
      })
      orderCounter++
    }
  }
  return orders
}

export const mockOrdersList = generateOrders()

class MockOrdersApi implements OrdersApi {
  async getOrders(filters: OrdersFilters): Promise<OrdersResponse> {
    await new Promise((r) => setTimeout(r, 100))
    let filtered = [...mockOrdersList]

    if (filters.q) {
      const q = filters.q.toLowerCase()
      filtered = filtered.filter(
        (o) => o.customerName.toLowerCase().includes(q) || 
               o.customerEmail.toLowerCase().includes(q) || 
               o.id.toLowerCase().includes(q)
      )
    }
    if (filters.eventId) filtered = filtered.filter((o) => o.eventId === filters.eventId)
    if (filters.organizerId) filtered = filtered.filter((o) => o.organizerId === filters.organizerId)
    if (filters.paymentStatus) filtered = filtered.filter((o) => o.paymentStatus === filters.paymentStatus)
    if (filters.orderStatus) filtered = filtered.filter((o) => o.orderStatus === filters.orderStatus)
    
    // Simple date filtering
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime()
      filtered = filtered.filter((o) => new Date(o.createdAt).getTime() >= from)
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo).getTime()
      filtered = filtered.filter((o) => new Date(o.createdAt).getTime() <= to)
    }

    const page = filters.page ?? 1
    const limit = filters.limit ?? 15
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    return {
      success: true,
      data: {
        orders: paginated,
        pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
      },
    }
  }

  async getOrdersKpis(): Promise<OrdersKpi> {
    await new Promise((r) => setTimeout(r, 100))
    const totalOrders = mockOrdersList.length
    const paidOrders = mockOrdersList.filter(o => o.paymentStatus === 'paid').length
    
    return {
      totalOrders,
      paidOrders,
      pendingOrders: mockOrdersList.filter(o => o.paymentStatus === 'pending').length,
      failedOrders: mockOrdersList.filter(o => o.paymentStatus === 'failed').length,
      refundedOrders: mockOrdersList.filter(o => o.paymentStatus === 'refunded').length,
      successRate: totalOrders > 0 ? Math.round((paidOrders / totalOrders) * 100) : 0
    }
  }

  async bulkAction(data: BulkActionRequest): Promise<BulkActionResponse> {
    await new Promise((r) => setTimeout(r, 200))
    
    if (data.action === 'refund') {
      // Find and update orders directly in the mock list
      data.orderIds.forEach(id => {
        const order = mockOrdersList.find(o => o.id === id)
        if (order && order.paymentStatus === 'paid') {
          order.paymentStatus = 'refunded'
          order.orderStatus = 'cancelled'
        }
      })
    }

    return {
      success: true,
      data: {
        job: {
          id: `job-${Math.floor(Math.random() * 10000)}`,
          status: 'queued'
        }
      }
    }
  }

  async exportOrders(filters: OrdersFilters): Promise<Blob> {
    await new Promise((r) => setTimeout(r, 200))
    // Not actually exporting in mock, just returning a dummy blob
    return new Blob(['Dummy CSV Data'], { type: 'text/csv' })
  }
}

// ─── Export ───────────────────────────────────────────────────────────────────
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
export const getOrdersApi = (): OrdersApi => (USE_MOCK ? new MockOrdersApi() : new HttpOrdersApi())
