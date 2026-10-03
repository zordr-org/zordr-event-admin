import { NextRequest, NextResponse } from 'next/server'
import { mockSettlementsList } from '@/features/settlements/api'
import { markPaidSettlementSchema } from '@/features/settlements/schemas'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const parsed = markPaidSettlementSchema.parse(body)

    const settlement = mockSettlementsList.find(s => s.id === params.id)
    if (!settlement) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (settlement.status === 'paid') return NextResponse.json({ error: 'Cannot modify paid settlement' }, { status: 409 })

    settlement.status = 'paid'
    settlement.transferReference = parsed.transferReference
    settlement.transferDate = parsed.transferDate
    settlement.holdReason = undefined

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 })
  }
}
