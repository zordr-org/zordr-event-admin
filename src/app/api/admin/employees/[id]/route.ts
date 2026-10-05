import { NextResponse } from 'next/server'
import { mockEmployeesData } from '@/features/employees/mock'

let employeesDb = [...mockEmployeesData]

export const dynamic = 'force-dynamic'

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  const { id } = params
  const body = await request.json()

  const empIndex = employeesDb.findIndex((e) => e.id === id)
  if (empIndex === -1) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Employee not found' } },
      { status: 404 }
    )
  }

  const updated = {
    ...employeesDb[empIndex],
    ...(body.roleId && { roleId: body.roleId, role: 'Role ' + body.roleId }),
    ...(body.department && { department: body.department }),
    ...(body.status && { status: body.status }),
  }

  employeesDb[empIndex] = updated

  return NextResponse.json({
    success: true,
    data: updated,
  })
}
