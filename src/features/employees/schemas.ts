import { z } from 'zod'

export const inviteEmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  roleId: z.string().min(1, 'Role is required'),
  department: z.string().min(1, 'Department is required'),
  sendInvitation: z.boolean().default(true),
})

export type InviteEmployeeFormData = z.infer<typeof inviteEmployeeSchema>

export const editEmployeeSchema = z.object({
  roleId: z.string().min(1, 'Role is required'),
  department: z.string().min(1, 'Department is required'),
  status: z.enum(['active', 'inactive']),
})

export type EditEmployeeFormData = z.infer<typeof editEmployeeSchema>
