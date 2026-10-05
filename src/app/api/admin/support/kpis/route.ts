import { NextRequest, NextResponse } from 'next/server'
import { mockSupportTickets } from '@/features/support/mock'

export async function GET(request: NextRequest) {
  const openTickets = mockSupportTickets.filter(t => t.status === 'open').length
  const pendingTickets = mockSupportTickets.filter(t => t.status === 'pending').length
  const resolvedTickets = mockSupportTickets.filter(t => t.status === 'resolved').length
  const highPriority = mockSupportTickets.filter(t => t.priority === 'high' && t.status !== 'resolved').length

  return NextResponse.json({
    openTickets,
    pendingTickets,
    resolvedTickets,
    highPriority
  })
}
