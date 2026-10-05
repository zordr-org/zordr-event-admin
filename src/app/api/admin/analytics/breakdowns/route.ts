import { NextRequest, NextResponse } from 'next/server'
import { generateMockBreakdown } from '@/features/analytics/mock'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'payment_method'
  const simulate = searchParams.get('simulate')

  if (simulate === 'error') {
    return NextResponse.json({ success: false, error: { message: 'Simulated error' } }, { status: 500 })
  }

  if (simulate === 'empty') {
    return NextResponse.json({ success: true, data: [] })
  }

  return NextResponse.json({
    success: true,
    data: generateMockBreakdown(type)
  })
}
