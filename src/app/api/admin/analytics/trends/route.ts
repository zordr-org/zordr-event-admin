import { NextRequest, NextResponse } from 'next/server'
import { generateMockTrend } from '@/features/analytics/mock'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const metric = searchParams.get('metric') || 'gmv'
  const granularity = searchParams.get('granularity') || 'daily'
  const dateFrom = searchParams.get('dateFrom') || new Date().toISOString()
  const dateTo = searchParams.get('dateTo') || new Date().toISOString()
  const simulate = searchParams.get('simulate')

  if (simulate === 'error') {
    return NextResponse.json({ success: false, error: { message: 'Simulated error' } }, { status: 500 })
  }

  if (simulate === 'empty') {
    return NextResponse.json({ success: true, data: [] })
  }

  if (simulate === 'slow') {
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  return NextResponse.json({
    success: true,
    data: generateMockTrend(metric, granularity, dateFrom, dateTo)
  })
}
