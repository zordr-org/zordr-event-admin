import { NextResponse } from 'next'
import { requireAuth } from '@/mocks/handlers'
import { mockEmployeesData } from '@/features/employees/mock'

let employeesDb = [...mockEmployeesData]

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authResponse = requireAuth(request, 'employees', 'edit')
  if (authResponse) return authResponse

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
