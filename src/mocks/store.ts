import { OrderListItem } from '@/features/orders/types'
import { RefundListItem } from '@/features/refunds/types'
import { SupportTicketListItem, SupportMessage } from '@/features/support/types'

class MockStore {
  public orders: OrderListItem[] = []
  public refunds: RefundListItem[] = []
  public supportTickets: SupportTicketListItem[] = []
  public supportMessages: Record<string, SupportMessage[]> = {}
  
  constructor() {
    this.seed()
  }

  seed() {
    this.seedOrders()
    this.seedRefunds()
    this.seedSupport()
  }

  private getEventName(id: string) {
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

  private getOrganizerName(id: string) {
    const names = [
      'Starlight Events', 'TechFest Org', 'Cultural Hub', 'SportZone', 'UpSkill Academy',
      'Comedy Club HYD', 'ArtSpace BLR', 'FoodFest India'
    ]
    const idx = parseInt(id.replace('org-', ''), 10) - 1
    return names[idx] || `Organizer ${idx + 1}`
  }

  private seedOrders() {
    const CUSTOMER_NAMES = ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Neha Gupta', 'Vikram Singh', 'Anjali Desai', 'Rohan Reddy', 'Kavita Iyer']
    const GATEWAYS = ['Stripe', 'Razorpay', 'Paytm']
    
    let orderCounter = 1
    for (let i = 1; i <= 18; i++) {
      const eventId = `evt-${i}`
      const eventName = this.getEventName(eventId)
      const organizerId = `org-${((i - 1) % 8) + 1}`
      const organizerName = this.getOrganizerName(organizerId)

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

        this.orders.push({
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
  }

  private seedRefunds() {
    const refundedOrders = this.orders.filter(o => o.paymentStatus === 'refunded')
    for (let i = 0; i < Math.min(5, refundedOrders.length); i++) {
      const o = refundedOrders[i]
      this.refunds.push({
        id: `ref-${String(i + 1).padStart(4, '0')}`,
        orderId: o.id,
        customerName: o.customerName,
        eventId: o.eventId,
        eventName: o.eventName,
        organizerId: o.organizerId,
        amount: o.amount,
        reason: 'Customer requested cancellation',
        status: 'processed',
        requestedOn: new Date(Date.now() - (i + 10) * 24 * 60 * 60 * 1000).toISOString(),
        processedOn: new Date(Date.now() - (i + 5) * 24 * 60 * 60 * 1000).toISOString(),
        settlementAdjustment: i % 2 === 0 ? 'applied' : 'deferred_settlement_paid'
      })
    }

    const paidOrders = this.orders.filter(o => o.paymentStatus === 'paid')
    for (let i = 0; i < Math.min(10, paidOrders.length); i++) {
      const o = paidOrders[i]
      this.refunds.push({
        id: `ref-${String(i + 10).padStart(4, '0')}`,
        orderId: o.id,
        customerName: o.customerName,
        eventId: o.eventId,
        eventName: o.eventName,
        organizerId: o.organizerId,
        amount: o.amount,
        reason: 'Event dates changed',
        status: 'pending',
        requestedOn: new Date(Date.now() - (i + 2) * 24 * 60 * 60 * 1000).toISOString()
      })
    }
    
    for (let i = 10; i < Math.min(13, paidOrders.length); i++) {
      const o = paidOrders[i]
      this.refunds.push({
        id: `ref-${String(i + 20).padStart(4, '0')}`,
        orderId: o.id,
        customerName: o.customerName,
        eventId: o.eventId,
        eventName: o.eventName,
        organizerId: o.organizerId,
        amount: o.amount,
        reason: 'No show',
        status: 'rejected',
        requestedOn: new Date(Date.now() - (i + 4) * 24 * 60 * 60 * 1000).toISOString(),
        processedOn: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Past refund window'
      })
    }
  }

  private seedSupport() {
    this.supportTickets = [
      {
        id: 'TKT-001',
        requesterType: 'customer',
        requesterName: 'Alice Smith',
        subject: 'Cannot access my tickets',
        category: 'tickets',
        eventName: 'Summer Music Fest',
        eventId: 'EVT-001',
        status: 'open',
        priority: 'high',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: 'TKT-002',
        requesterType: 'organizer',
        requesterName: 'Rocking Events',
        subject: 'Payout delayed',
        category: 'payments',
        eventName: 'Winter Bash',
        eventId: 'EVT-002',
        status: 'pending',
        priority: 'high',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        firstResponseAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      },
      {
        id: 'TKT-003',
        requesterType: 'customer',
        requesterName: 'Bob Jones',
        subject: 'Refund request for cancelled event',
        category: 'refunds',
        eventName: 'Cancel Fest',
        eventId: 'EVT-003',
        status: 'resolved',
        priority: 'medium',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        firstResponseAt: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(),
        resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
      {
        id: 'TKT-004',
        requesterType: 'customer',
        requesterName: 'Charlie Davis',
        subject: 'Is there parking available?',
        category: 'event_info',
        eventName: 'Tech Conference 2026',
        eventId: 'EVT-004',
        status: 'open',
        priority: 'low',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      }
    ]

    for (let i = 5; i <= 25; i++) {
      const isOrganizer = i % 4 === 0
      this.supportTickets.push({
        id: `TKT-${i.toString().padStart(3, '0')}`,
        requesterType: isOrganizer ? 'organizer' : 'customer',
        requesterName: isOrganizer ? `Organizer ${i}` : `Customer ${i}`,
        subject: `Issue regarding ${isOrganizer ? 'event management' : 'my order'}`,
        category: ['tickets', 'payments', 'refunds', 'event_info', 'orders', 'accessibility', 'general'][i % 7] as any,
        eventName: i % 2 === 0 ? `Event ${i}` : undefined,
        eventId: i % 2 === 0 ? `EVT-${i}` : undefined,
        status: ['open', 'pending', 'resolved'][i % 3] as any,
        priority: ['high', 'medium', 'low'][i % 3] as any,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * i).toISOString(),
      })
    }

    this.supportMessages = {
      'TKT-001': [
        {
          id: 'MSG-001',
          authorName: 'Alice Smith',
          authorType: 'customer',
          message: 'I bought 2 tickets but the PDF is not opening on my phone.',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        }
      ]
    }
  }

  public getMockThread(ticketId: string): SupportMessage[] {
    return this.supportMessages[ticketId] || [
      {
        id: `MSG-${ticketId}-1`,
        authorName: 'Requester',
        authorType: 'customer',
        message: 'Initial support request description goes here.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      }
    ]
  }
}

const globalForMockStore = globalThis as unknown as {
  __mockStore: MockStore | undefined
}

export const store = globalForMockStore.__mockStore ?? new MockStore()

if (process.env.NODE_ENV !== 'production') {
  globalForMockStore.__mockStore = store
}
