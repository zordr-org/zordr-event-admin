import type { Module } from '@/types/auth'

export type RoleType = 'system' | 'custom'

export interface Role {
  id: string
  name: string
  type: RoleType
  isDeletable: boolean
  employeeCount: number
}

export interface RolePermission {
  module: Module
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canExport: boolean
}

export interface RoleDetail {
  id: string
  name: string
  description?: string
  type: RoleType
  isDeletable: boolean
  permissions: RolePermission[]
}

export interface RolesResponse {
  success: boolean
  data: Role[]
}

export interface CreateRoleRequest {
  name: string
  description?: string
  permissions: RolePermission[]
}

export interface CreateRoleResponse {
  success: boolean
  data?: RoleDetail
}

export interface UpdateRoleRequest {
  permissions: RolePermission[]
}

export interface UpdateRoleResponse {
  success: boolean
  data?: RoleDetail
}
