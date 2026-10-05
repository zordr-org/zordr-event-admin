import { NextResponse } from 'next/server'
import { mockRefundsList } from '@/features/refunds/mock'

export async function GET() {
  const totalRefunds = mockRefundsList.length
  const processedRefunds = mockRefundsList.filter(r => r.status === 'processed').length
  const pendingRefunds = mockRefundsList.filter(r => r.status === 'pending').length
  const rejectedRefunds = mockRefundsList.filter(r => r.status === 'rejected').length

  return NextResponse.json({
    totalRefunds,
    processedRefunds,
    pendingRefunds,
    rejectedRefunds
  })
}
