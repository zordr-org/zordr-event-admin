import { NextResponse } from 'next/server'
import { mockRolesData } from '@/features/roles/mock'
import { mockEmployeesData } from '@/features/employees/mock'

// NOTE: Since these are mock route handlers, any memory modifications 
// to `rolesDb` imported from another file might not persist across dev server requests, 
// but it will work enough for client-side optimistic UI testing.
let rolesDb = [...mockRolesData]

export const dynamic = 'force-dynamic'

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  const { id } = params
  const role = rolesDb.find((r) => r.id === id)

  if (!role) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Role not found' } },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    data: role,
  })
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  const { id } = params
  const body = await request.json()

  const roleIndex = rolesDb.findIndex((r) => r.id === id)
  if (roleIndex === -1) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Role not found' } },
      { status: 404 }
    )
  }

  const updated = {
    ...rolesDb[roleIndex],
    permissions: body.permissions,
  }
  rolesDb[roleIndex] = updated

  return NextResponse.json({
    success: true,
    data: updated,
  })
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  const { id } = params
  const roleIndex = rolesDb.findIndex((r) => r.id === id)

  if (roleIndex === -1) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Role not found' } },
      { status: 404 }
    )
  }

  const role = rolesDb[roleIndex]
  if (!role.isDeletable) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'System roles cannot be deleted' } },
      { status: 403 }
    )
  }

  // Check if assigned
  const hasEmployees = mockEmployeesData.some((e) => e.roleId === id)
  if (hasEmployees) {
    return NextResponse.json(
      { success: false, error: { code: 'CONFLICT', message: 'Cannot delete role with assigned employees' } },
      { status: 409 }
    )
  }

  rolesDb.splice(roleIndex, 1)

  return NextResponse.json({
    success: true,
  })
}
