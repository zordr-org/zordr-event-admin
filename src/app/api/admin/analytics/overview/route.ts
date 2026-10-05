import { NextRequest, NextResponse } from 'next/server'
import { generateMockOverview } from '@/features/analytics/mock'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const dateFrom = searchParams.get('dateFrom') || new Date().toISOString()
  const dateTo = searchParams.get('dateTo') || new Date().toISOString()
  const simulate = searchParams.get('simulate')

  if (simulate === 'error') {
    return NextResponse.json({ success: false, error: { message: 'Simulated error' } }, { status: 500 })
  }

  if (simulate === 'empty') {
    return NextResponse.json({
      success: true,
      data: { totalGmv: 0, totalOrders: 0, ticketsSold: 0, activeEvents: 0, uniqueCustomers: 0, conversionRate: 0 }
    })
  }

  if (simulate === 'slow') {
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  return NextResponse.json({
    success: true,
    data: generateMockOverview(dateFrom, dateTo)
  })
}
