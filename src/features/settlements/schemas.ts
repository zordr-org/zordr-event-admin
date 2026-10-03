import { z } from 'zod'

export const generateSettlementSchema = z.object({
  periodStart: z.string().min(1, 'Period Start is required'),
  periodEnd: z.string().min(1, 'Period End is required'),
  organizerId: z.string().optional(),
})

export const holdSettlementSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
})

export const markPaidSettlementSchema = z.object({
  transferReference: z.string().min(1, 'Transfer reference is required'),
  transferDate: z.string().min(1, 'Transfer date is required'),
})

export type GenerateSettlementInput = z.infer<typeof generateSettlementSchema>
export type HoldSettlementInput = z.infer<typeof holdSettlementSchema>
export type MarkPaidSettlementInput = z.infer<typeof markPaidSettlementSchema>
