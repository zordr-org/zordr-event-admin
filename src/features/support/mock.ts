import type { SupportTicketListItem, SupportMessage } from './types'

export const mockSupportTickets: SupportTicketListItem[] = [
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
  mockSupportTickets.push({
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

export const mockMessages: Record<string, SupportMessage[]> = {
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

export function getMockThread(ticketId: string): SupportMessage[] {
  return mockMessages[ticketId] || [
    {
      id: `MSG-${ticketId}-1`,
      authorName: 'Requester',
      authorType: 'customer',
      message: 'Initial support request description goes here.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    }
  ]
}
