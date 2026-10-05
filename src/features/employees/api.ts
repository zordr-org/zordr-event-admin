import { apiFetch } from '@/lib/api/client'
import type { 
  EmployeesFilters, 
  EmployeesResponse, 
  InviteEmployeeRequest, 
  InviteEmployeeResponse, 
  UpdateEmployeeRequest, 
  UpdateEmployeeResponse 
} from './types'

export interface EmployeesApi {
  getEmployees(filters: EmployeesFilters): Promise<EmployeesResponse>
  inviteEmployee(data: InviteEmployeeRequest): Promise<InviteEmployeeResponse>
  updateEmployee(id: string, data: UpdateEmployeeRequest): Promise<UpdateEmployeeResponse>
}

class HttpEmployeesApi implements EmployeesApi {
  async getEmployees(filters: EmployeesFilters): Promise<EmployeesResponse> {
    const params = new URLSearchParams()
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('limit', String(filters.limit))
    if (filters.status) params.set('status', filters.status)
    if (filters.roleId) params.set('roleId', filters.roleId)
    if (filters.department) params.set('department', filters.department)
    if (filters.search) params.set('search', filters.search)
    
    return apiFetch<EmployeesResponse>(`/api/admin/employees?${params}`)
  }

  async inviteEmployee(data: InviteEmployeeRequest): Promise<InviteEmployeeResponse> {
    return apiFetch<InviteEmployeeResponse>('/api/admin/employees/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateEmployee(id: string, data: UpdateEmployeeRequest): Promise<UpdateEmployeeResponse> {
    return apiFetch<UpdateEmployeeResponse>(`/api/admin/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }
}

export const getEmployeesApi = (): EmployeesApi => new HttpEmployeesApi()
