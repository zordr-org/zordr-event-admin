import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return new NextResponse('Dummy CSV Data for Settlements', {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="settlements-export.csv"',
    },
  })
}
