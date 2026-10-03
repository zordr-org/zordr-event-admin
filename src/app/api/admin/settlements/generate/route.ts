import { NextRequest, NextResponse } from 'next/server'
import { mockSettlementsList, FeeConfig } from '@/features/settlements/api'
import { generateSettlementSchema } from '@/features/settlements/schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = generateSettlementSchema.parse(body)

    const existing = mockSettlementsList.find(s => 
      s.organizerId === parsed.organizerId &&
      new Date(s.periodStart).getTime() === new Date(parsed.periodStart).getTime() &&
      new Date(s.periodEnd).getTime() === new Date(parsed.periodEnd).getTime()
    )

    if (!existing && parsed.organizerId) {
      const ticketsCount = 200
      const basePrice = 500
      const grossSales = ticketsCount * basePrice
      const platformFee = Math.round((grossSales * FeeConfig.platformFeePct / 100) + (ticketsCount * FeeConfig.perTicketFee))
      const gatewayFee = Math.round(grossSales * FeeConfig.gatewayFeePct / 100)
      const netPayout = grossSales - platformFee - gatewayFee
      
      mockSettlementsList.unshift({
        id: `stl-new-${Date.now()}`,
        organizerId: parsed.organizerId,
        organizerName: 'Generated Organizer',
        eventIds: ['evt-1'],
        periodStart: parsed.periodStart,
        periodEnd: parsed.periodEnd,
        grossSales,
        platformFee,
        gatewayFee,
        refunds: 0,
        netPayout,
        status: 'pending',
        createdAt: new Date().toISOString()
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        job: { id: `job-${Math.floor(Math.random() * 10000)}`, status: 'queued' }
      }
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 })
  }
}
