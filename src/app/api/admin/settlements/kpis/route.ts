import { NextResponse } from 'next/server'
import { mockSettlementsList } from '@/features/settlements/api'

export async function GET() {
  const totalPayout = mockSettlementsList.reduce((acc, s) => acc + s.netPayout, 0)
  const paidPayout = mockSettlementsList.filter(s => s.status === 'paid').reduce((acc, s) => acc + s.netPayout, 0)
  const pendingPayout = mockSettlementsList.filter(s => s.status === 'pending').reduce((acc, s) => acc + s.netPayout, 0)
  const onHoldPayout = mockSettlementsList.filter(s => s.status === 'on_hold').reduce((acc, s) => acc + s.netPayout, 0)
  
  return NextResponse.json({
    totalPayout,
    paidPayout,
    pendingPayout,
    onHoldPayout,
  })
}

