import { NextRequest, NextResponse } from 'next/server'
import { mockOrdersList } from '@/features/orders/api'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { orderIds, action, reason } = body

  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return NextResponse.json({ success: false, error: 'No orders selected' }, { status: 400 })
  }

  if (action === 'refund') {
    if (!reason || String(reason).trim().length < 10) {
      return NextResponse.json({ success: false, error: { message: 'Reason is required for bulk refund.' } }, { status: 400 })
    }
    // In a real app this would write an AuditLog entry with the reason
    console.log(`[AUDIT] Bulk refund requested for ${orderIds.length} orders. Reason: ${reason}`)
    
    // Simulate eventual completion immediately in mock store
    orderIds.forEach(id => {
      const order = mockOrdersList.find(o => o.id === id)
      if (order && order.paymentStatus === 'paid') {
        order.paymentStatus = 'refunded'
        order.orderStatus = 'cancelled'
      }
    })
  } else if (action === 'export') {
    console.log(`[AUDIT] Bulk export requested for ${orderIds.length} orders.`)
  } else {
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    data: {
      job: {
        id: `job-${Math.floor(Math.random() * 10000)}`,
        status: 'queued'
      }
    }
  })
}
