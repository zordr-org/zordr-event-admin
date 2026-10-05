import { NextRequest, NextResponse } from 'next/server'
import { generateMockLeaderboard } from '@/features/analytics/mock'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'top_events'
  const limit = parseInt(searchParams.get('limit') || '10', 10)
  const simulate = searchParams.get('simulate')

  if (simulate === 'error') {
    return NextResponse.json({ success: false, error: { message: 'Simulated error' } }, { status: 500 })
  }

  if (simulate === 'empty') {
    return NextResponse.json({ success: true, data: [] })
  }

  return NextResponse.json({
    success: true,
    data: generateMockLeaderboard(type, limit)
  })
}
