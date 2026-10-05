import { NextResponse } from 'next/server'

import { mockSettingsData } from '@/features/settings/mock'

let settingsDb = { ...mockSettingsData }

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {

  return NextResponse.json({
    success: true,
    data: settingsDb,
  })
}

export async function PATCH(request: Request) {

  const body = await request.json()
  
  settingsDb = {
    ...settingsDb,
    ...(body.platformFeePercent !== undefined && { platformFeePercent: body.platformFeePercent }),
    ...(body.convenienceFeePercent !== undefined && { convenienceFeePercent: body.convenienceFeePercent }),
    ...(body.maxGatewayFeePercent !== undefined && { maxGatewayFeePercent: body.maxGatewayFeePercent }),
    ...(body.supportEmail !== undefined && { supportEmail: body.supportEmail }),
    ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
  }

  return NextResponse.json({
    success: true,
    data: settingsDb,
  })
}
