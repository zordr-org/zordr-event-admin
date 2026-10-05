import { z } from 'zod'

export const reviewRefundSchema = z.object({
  decision: z.enum(['approve', 'reject']),
  notes: z.string().optional()
})

export type ReviewRefundInput = z.infer<typeof reviewRefundSchema>
