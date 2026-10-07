import { NextResponse } from 'next/server'
import { mockSettingsData, mockPlatformInfo, mockSettingsActivityLog } from '@/features/settings/mock'

let settingsDb = { ...mockSettingsData }

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  return NextResponse.json({
    success: true,
    data: settingsDb,
    platformInfo: mockPlatformInfo,
    activityLog: mockSettingsActivityLog,
  })
}

export async function PATCH(request: Request) {
  const body = await request.json()

  // Merge all fields from body into settingsDb
  settingsDb = { ...settingsDb, ...body }

  return NextResponse.json({
    success: true,
    data: settingsDb,
  })
}
