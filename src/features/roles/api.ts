import { apiFetch } from '@/lib/api/client'
import type { 
  RolesResponse, 
  RoleDetail, 
  CreateRoleRequest, 
  CreateRoleResponse, 
  UpdateRoleRequest, 
  UpdateRoleResponse 
} from './types'

export interface RolesApi {
  getRoles(): Promise<RolesResponse>
  getRole(id: string): Promise<{ success: boolean; data: RoleDetail }>
  createRole(data: CreateRoleRequest): Promise<CreateRoleResponse>
  updateRole(id: string, data: UpdateRoleRequest): Promise<UpdateRoleResponse>
  deleteRole(id: string): Promise<{ success: boolean }>
}

class HttpRolesApi implements RolesApi {
  async getRoles(): Promise<RolesResponse> {
    return apiFetch<RolesResponse>('/api/admin/roles')
  }

  async getRole(id: string): Promise<{ success: boolean; data: RoleDetail }> {
    return apiFetch<{ success: boolean; data: RoleDetail }>(`/api/admin/roles/${id}`)
  }

  async createRole(data: CreateRoleRequest): Promise<CreateRoleResponse> {
    return apiFetch<CreateRoleResponse>('/api/admin/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateRole(id: string, data: UpdateRoleRequest): Promise<UpdateRoleResponse> {
    return apiFetch<UpdateRoleResponse>(`/api/admin/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteRole(id: string): Promise<{ success: boolean }> {
    return apiFetch<{ success: boolean }>(`/api/admin/roles/${id}`, {
      method: 'DELETE',
    })
  }
}

export const getRolesApi = (): RolesApi => new HttpRolesApi()
