import { NextRequest, NextResponse } from 'next/server'
import { blockCustomerSchema } from '@/features/customers/schemas'
import { mockCustomersList } from '@/features/customers/api'

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json()
    const result = blockCustomerSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Reason is required and cannot be empty' },
        { status: 400 }
      )
    }

    // UPDATE NOTE: This is the integration point where a real checkout flow would need to check
    // to prevent blocked customers from completing new checkouts platform-wide.
    
    const c = mockCustomersList.find((x) => x.id === params.id)
    if (!c) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }
    
    c.status = 'blocked'
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
