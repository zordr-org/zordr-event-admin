import { z } from 'zod'

export const replyTicketSchema = z.object({
  message: z.string().max(2000, 'Message cannot exceed 2000 characters').optional(),
  status: z.enum(['open', 'pending', 'resolved']).optional()
}).refine(data => data.message || data.status, {
  message: 'Either message or status must be provided',
  path: ['message']
})

export type ReplyTicketFormValues = z.infer<typeof replyTicketSchema>
