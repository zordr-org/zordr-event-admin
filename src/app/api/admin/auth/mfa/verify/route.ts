import { NextRequest, NextResponse } from 'next/server'
import { mockMfaHandler } from '@/mocks/handlers'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (USE_MOCK) return mockMfaHandler(req)
  return NextResponse.json({ code: 'NOT_IMPLEMENTED', message: 'No backend configured' }, { status: 501 })
}
