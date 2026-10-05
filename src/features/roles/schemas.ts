import { z } from 'zod'
import { MODULES } from '@/types/auth'

// Ensure we have at least one module, Zod requires a tuple for enum
const moduleTuple = [MODULES[0], ...MODULES.slice(1)] as [string, ...string[]]

export const permissionSchema = z.object({
  module: z.enum(moduleTuple as any),
  canView: z.boolean(),
  canCreate: z.boolean(),
  canEdit: z.boolean(),
  canDelete: z.boolean(),
  canExport: z.boolean(),
})

export const createRoleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  permissions: z.array(permissionSchema).min(1, 'At least one permission block is required'),
})

export type CreateRoleFormData = z.infer<typeof createRoleSchema>

export const updateRoleSchema = z.object({
  permissions: z.array(permissionSchema).min(1, 'At least one permission block is required'),
})

export type UpdateRoleFormData = z.infer<typeof updateRoleSchema>
