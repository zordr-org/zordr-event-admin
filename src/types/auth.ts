export type Module =
  | 'dashboard'
  | 'organizers'
  | 'events'
  | 'orders'
  | 'customers'
  | 'settlements'
  | 'refunds'
  | 'support'
  | 'analytics'
  | 'employees'
  | 'roles'
  | 'settings'

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