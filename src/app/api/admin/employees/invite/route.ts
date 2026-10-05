import { NextResponse } from 'next'
import { requireAuth } from '@/mocks/handlers'
import { mockEmployeesData } from '@/features/employees/mock'

let employeesDb = [...mockEmployeesData]

export async function POST(request: Request) {
  const authResponse = requireAuth(request, 'employees', 'create')
  if (authResponse) return authResponse

  try {
    const body = await request.json()
    const { email } = body

    if (employeesDb.some(e => e.email === email)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'An employee with this email already exists',
          },
        },
        { status: 409 }
      )
    }

    const newEmployee = {
      id: `emp-${Date.now()}`,
      name: body.name,
      email: body.email,
      roleId: body.roleId,
      role: 'Role ' + body.roleId, // basic mapping for mock
      department: body.department,
      status: 'invited' as const,
      lastActiveAt: null,
    }
    
    // In a real app we'd save it to the DB here.
    // For now we just return success to satisfy the mock.
    employeesDb.push(newEmployee)

    return NextResponse.json({
      success: true,
      data: {
        id: newEmployee.id,
        status: newEmployee.status,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid payload' } },
      { status: 400 }
    )
  }
}
