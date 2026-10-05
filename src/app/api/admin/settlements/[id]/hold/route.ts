import { NextRequest, NextResponse } from 'next/server'
import { mockSettlementsList } from '@/features/settlements/api'
import { holdSettlementSchema } from '@/features/settlements/schemas'

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json()
    const parsed = holdSettlementSchema.parse(body)

    const settlement = mockSettlementsList.find(s => s.id === params.id)
    if (!settlement) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (settlement.status === 'paid') return NextResponse.json({ error: 'Cannot modify paid settlement' }, { status: 409 })

    settlement.status = 'on_hold'
    settlement.holdReason = parsed.reason

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 })
  }
}
