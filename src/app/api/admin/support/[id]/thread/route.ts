import { NextRequest, NextResponse } from 'next/server'
import { mockSupportTickets, getMockThread } from '@/features/support/mock'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ticket = mockSupportTickets.find(t => t.id === params.id)
  
  if (!ticket) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Ticket not found' } },
      { status: 404 }
    )
  }

  const messages = getMockThread(params.id)

  return NextResponse.json({
    success: true,
    data: {
      ticket,
      messages
    }
  })
}
