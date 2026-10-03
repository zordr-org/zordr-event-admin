import { z } from 'zod'

export const blockCustomerSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
})
