import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'csv'

  if (format === 'csv') {
    const csvContent = 'Date,GMV,Orders\n2026-10-01,10000,50\n2026-10-02,15000,75'
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="analytics_report.csv"'
      }
    })
  }

  // Mock PDF as basic text/plain to avoid binary issues in mock
  return new NextResponse('Mock PDF Content', {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="analytics_report.pdf"'
    }
  })
}
