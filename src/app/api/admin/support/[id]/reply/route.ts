import { NextRequest, NextResponse } from 'next/server'
import { mockSupportTickets, mockMessages } from '@/features/support/mock'

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const body = await request.json().catch(() => ({}))
  const { message, status } = body

  if (!message && !status) {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'Either message or status is required' } },
      { status: 400 }
    )
  }

  const ticketIndex = mockSupportTickets.findIndex(t => t.id === params.id)

  if (ticketIndex === -1) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Ticket not found' } },
      { status: 404 }
    )
  }

  const ticket = mockSupportTickets[ticketIndex]

  if (status && ['open', 'pending', 'resolved'].includes(status)) {
    ticket.status = status as any
    if (status === 'resolved') {
      ticket.resolvedAt = new Date().toISOString()
    }
  }

  if (message) {
    if (!mockMessages[ticket.id]) {
      mockMessages[ticket.id] = []
    }
    mockMessages[ticket.id].push({
      id: `MSG-${Date.now()}`,
      authorName: 'Admin Agent',
      authorType: 'admin',
      message: message,
      createdAt: new Date().toISOString()
    })

    if (!ticket.firstResponseAt) {
      ticket.firstResponseAt = new Date().toISOString()
    }
    
    // Automatically set to pending if we reply
    if (!status && ticket.status === 'open') {
      ticket.status = 'pending'
    }
  }

  return NextResponse.json({
    success: true,
    data: ticket
  })
}
