export type EmployeeStatus = 'active' | 'inactive' | 'invited'

export interface Employee {
  id: string
  name: string
  email: string
  roleId: string
  role: string
  department: string
  status: EmployeeStatus
  lastActiveAt: string | null
}

export interface EmployeesFilters {
  page?: number
  limit?: number
  status?: EmployeeStatus
  roleId?: string
  department?: string
  search?: string
}

export interface EmployeesResponse {
  success: boolean
  data: {
    employees: Employee[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    kpi: {
      totalEmployees: number
      activeEmployees: number
      pendingEmployees: number
      inactiveEmployees: number
    }
  }
}

export interface InviteEmployeeRequest {
  name: string
  email: string
  roleId: string
  department: string
  sendInvitation: boolean
}

export interface InviteEmployeeResponse {
  success: boolean
  data?: {
    id: string
    status: 'invited'
  }
}

export interface UpdateEmployeeRequest {
  roleId?: string
  department?: string
  status?: 'active' | 'inactive'
}

export interface UpdateEmployeeResponse {
  success: boolean
  data?: Employee
}
