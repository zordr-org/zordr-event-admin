import { NextResponse } from 'next'
import { mockRolesData } from '@/features/roles/mock'
import { mockEmployeesData } from '@/features/employees/mock'
import { requireAuth } from '@/mocks/handlers'

let rolesDb = [...mockRolesData]

export async function GET(request: Request) {
  const authResponse = requireAuth(request, 'roles', 'view')
  if (authResponse) return authResponse

  const roles = rolesDb.map((role) => ({
    id: role.id,
    name: role.name,
    type: role.type,
    isDeletable: role.isDeletable,
    employeeCount: mockEmployeesData.filter((e) => e.roleId === role.id).length,
  }))

  return NextResponse.json({
    success: true,
    data: roles,
  })
}

export async function POST(request: Request) {
  const authResponse = requireAuth(request, 'roles', 'create')
  if (authResponse) return authResponse

  const body = await request.json()
  const newRole = {
    id: `role-${Date.now()}`,
    name: body.name,
    description: body.description,
    type: 'custom' as const,
    isDeletable: true,
    permissions: body.permissions,
  }

  rolesDb.push(newRole)

  return NextResponse.json({
    success: true,
    data: newRole,
  })
}
