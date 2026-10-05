import { NextRequest, NextResponse } from 'next/server'
import { mockRefundsList } from '@/features/refunds/mock'
import { mockSettlementsList } from '@/features/settlements/api'
import { reviewRefundSchema } from '@/features/refunds/schemas'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  
  const body = await request.json()
  const parsed = reviewRefundSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
  }
  
  const { decision, notes } = parsed.data
  
  const refund = mockRefundsList.find(r => r.id === id)
  if (!refund) {
    return NextResponse.json({ success: false, error: 'Refund not found' }, { status: 404 })
  }
  
  if (refund.status !== 'pending') {
    return NextResponse.json({ success: false, error: 'Refund is already resolved' }, { status: 409 })
  }

  if (decision === 'reject') {
    refund.status = 'rejected'
    refund.processedOn = new Date().toISOString()
    if (notes) refund.notes = notes
  } else if (decision === 'approve') {
    refund.status = 'processed'
    refund.processedOn = new Date().toISOString()
    if (notes) refund.notes = notes
    
    // Adjust settlement
    // Find the settlement for this organizer and event that is active/covering this period
    // Since mock dates can be complex, we'll try to find a pending settlement for this organizer
    let targetSettlement = mockSettlementsList.find(s => 
      s.organizerId === refund.organizerId && 
      s.status === 'pending'
    )
    
    // If we didn't find a pending one, check if there's a paid one we would have mapped to
    if (!targetSettlement) {
      targetSettlement = mockSettlementsList.find(s => 
        s.organizerId === refund.organizerId && 
        s.status === 'paid'
      )
    }

    if (targetSettlement) {
      if (targetSettlement.status === 'pending') {
        targetSettlement.netPayout -= refund.amount
        targetSettlement.refunds += refund.amount
        refund.settlementAdjustment = 'applied'
      } else {
        refund.settlementAdjustment = 'deferred_settlement_paid'
      }
    } else {
      // No settlement found at all, just default to deferred or applied based on some rule
      // We will mark deferred to be safe
      refund.settlementAdjustment = 'deferred_settlement_paid'
    }
  }

  return NextResponse.json({
    success: true,
    data: refund
  })
}
