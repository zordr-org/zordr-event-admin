import { NextResponse } from 'next/server'
import { mockEmployeesData } from '@/features/employees/mock'


let employeesDb = [...mockEmployeesData]

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status')
  const roleId = searchParams.get('roleId')
  const department = searchParams.get('department')
  const search = searchParams.get('search')?.toLowerCase()

  let filtered = [...employeesDb]

  if (status) {
    filtered = filtered.filter((e) => e.status === status)
  }
  if (roleId) {
    filtered = filtered.filter((e) => e.roleId === roleId)
  }
  if (department) {
    filtered = filtered.filter((e) => e.department === department)
  }
  if (search) {
    filtered = filtered.filter(
      (e) => e.name.toLowerCase().includes(search) || e.email.toLowerCase().includes(search)
    )
  }

  const total = filtered.length
  const totalPages = Math.ceil(total / limit)
  const startIndex = (page - 1) * limit
  const paginated = filtered.slice(startIndex, startIndex + limit)

  return NextResponse.json({
    success: true,
    data: {
      employees: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    },
  })
}
