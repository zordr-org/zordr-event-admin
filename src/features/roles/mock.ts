import type { RoleDetail } from './types'
import { MODULES } from '@/types/auth'

const ALL_TRUE = {
  canView: true,
  canCreate: true,
  canEdit: true,
  canDelete: true,
  canExport: true,
}

const ALL_FALSE = {
  canView: false,
  canCreate: false,
  canEdit: false,
  canDelete: false,
  canExport: false,
}

const VIEW_ONLY = {
  ...ALL_FALSE,
  canView: true,
}

export const mockRolesData: RoleDetail[] = [
  {
    id: 'role-1',
    name: 'Super Admin',
    description: 'Full access to all modules and settings.',
    type: 'system',
    isDeletable: false,
    permissions: MODULES.map((m) => ({ module: m, ...ALL_TRUE })),
  },
  {
    id: 'role-2',
    name: 'Finance Executive',
    description: 'Access to settlements, refunds, and settings.',
    type: 'system',
    isDeletable: false,
    permissions: MODULES.map((m) => {
      if (m === 'settlements' || m === 'refunds' || m === 'settings') return { module: m, ...ALL_TRUE }
      if (m === 'analytics') return { module: m, ...VIEW_ONLY }
      return { module: m, ...ALL_FALSE }
    }),
  },
  {
    id: 'role-3',
    name: 'Support Executive',
    description: 'Manage support tickets and view orders.',
    type: 'system',
    isDeletable: false,
    permissions: MODULES.map((m) => {
      if (m === 'support') return { module: m, ...ALL_TRUE }
      if (m === 'orders' || m === 'customers' || m === 'dashboard') return { module: m, ...VIEW_ONLY }
      return { module: m, ...ALL_FALSE }
    }),
  },
  {
    id: 'role-4',
    name: 'Marketing Executive',
    description: 'View dashboard, events, and analytics.',
    type: 'system',
    isDeletable: false,
    permissions: MODULES.map((m) => {
      if (m === 'dashboard' || m === 'events' || m === 'customers' || m === 'analytics') return { module: m, ...VIEW_ONLY }
      return { module: m, ...ALL_FALSE }
    }),
  },
  {
    id: 'role-5',
    name: 'Operations Manager',
    description: 'Custom role for testing operations.',
    type: 'custom',
    isDeletable: true,
    permissions: MODULES.map((m) => {
      if (m === 'events' || m === 'organizers' || m === 'support') return { module: m, ...ALL_TRUE, canDelete: false }
      return { module: m, ...VIEW_ONLY }
    }),
  },
]
