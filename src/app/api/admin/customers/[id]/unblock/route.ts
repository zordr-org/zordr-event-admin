import { NextRequest, NextResponse } from 'next/server'
import { mockCustomersList } from '@/features/customers/api'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // UPDATE NOTE: This removes the platform-wide checkout block for this customer.
  const c = mockCustomersList.find((x) => x.id === params.id)
  if (!c) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }
  
  c.status = 'active'
  return NextResponse.json({ success: true })
}
