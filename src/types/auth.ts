export const MODULES = [
  'dashboard',
  'organizers',
  'events',
  'orders',
  'customers',
  'settlements',
  'refunds',
  'support',
  'analytics',
  'employees',
  'roles',
  'settings',
] as const

export type Module = (typeof MODULES)[number]

export type Action = 'view' | 'create' | 'edit' | 'delete' | 'export'

export type Permission = Record<Action, boolean>

export interface AdminUser {
  id: string
  name: string
  email: string
  roleName: string
  department: string
  permissions: Record<Module, Permission>
}