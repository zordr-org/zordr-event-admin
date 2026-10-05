import { NextResponse } from 'next'
import { requireAuth } from '@/mocks/handlers'
import { mockSettingsData } from '@/features/settings/mock'

let settingsDb = { ...mockSettingsData }

export async function GET(request: Request) {
  const authResponse = requireAuth(request, 'settings', 'view')
  if (authResponse) return authResponse

  return NextResponse.json({
    success: true,
    data: settingsDb,
  })
}

export async function PATCH(request: Request) {
  const authResponse = requireAuth(request, 'settings', 'edit')
  if (authResponse) return authResponse

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
