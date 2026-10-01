$baseDir = "src/app/api/v1/admin/organizers/[id]"
mkdir -p "$baseDir/approve"
mkdir -p "$baseDir/reject"
mkdir -p "$baseDir/suspend"
mkdir -p "$baseDir/reset-password"
mkdir -p "$baseDir/notes"
mkdir -p "$baseDir/message"

$template = @"
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json({ success: true })
}
"@

Set-Content -Path "$baseDir/approve/route.ts" -Value $template
Set-Content -Path "$baseDir/reject/route.ts" -Value $template
Set-Content -Path "$baseDir/suspend/route.ts" -Value $template
Set-Content -Path "$baseDir/reset-password/route.ts" -Value $template
Set-Content -Path "$baseDir/message/route.ts" -Value $template

$notesTemplate = @"
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()
  return NextResponse.json({
    id: crypto.randomUUID(),
    authorId: 'u1',
    authorName: 'Admin',
    note: body.note,
    createdAt: new Date().toISOString()
  })
}
"@
Set-Content -Path "$baseDir/notes/route.ts" -Value $notesTemplate
