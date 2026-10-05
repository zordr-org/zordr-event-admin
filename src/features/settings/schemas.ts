import { z } from 'zod'

export const settingsSchema = z.object({
  platformFeePercent: z.number().min(0).max(100),
  convenienceFeePercent: z.number().min(0).max(100),
  maxGatewayFeePercent: z.number().min(0).max(100),
  supportEmail: z.string().email(),
  logoUrl: z.string().url().optional().or(z.literal('')),
})

export type SettingsFormData = z.infer<typeof settingsSchema>
