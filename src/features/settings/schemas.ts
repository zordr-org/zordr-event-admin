import { z } from 'zod'

export const settingsSchema = z.object({
  // Fees
  platformFeePercent: z.coerce.number().min(0).max(100),
  convenienceFeePercent: z.coerce.number().min(0).max(100),
  maxGatewayFeePercent: z.coerce.number().min(0).max(100),

  // Branding
  supportEmail: z.string().email(),
  logoUrl: z.string().url().optional().or(z.literal('')),

  // General - Org Profile
  orgName: z.string().optional(),
  orgContactPhone: z.string().optional(),
  orgAddress: z.string().optional(),
  orgWebsite: z.string().url().optional().or(z.literal('')),

  // General - Preferences
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
  timeFormat: z.enum(['12h', '24h']).optional(),
  currency: z.string().optional(),
  language: z.string().optional(),
  itemsPerPage: z.coerce.number().optional(),

  // Notifications
  notifyOnNewOrganizer: z.boolean().optional(),
  notifyOnEventSubmitted: z.boolean().optional(),
  notifyOnRefundRequest: z.boolean().optional(),
  notifyOnPaymentFailure: z.boolean().optional(),
  notifyOnSettlementDue: z.boolean().optional(),
  notifyByEmail: z.boolean().optional(),
  notifySms: z.boolean().optional(),

  // Platform
  maintenanceMode: z.boolean().optional(),
  systemVersion: z.string().optional(),
  environment: z.enum(['production', 'staging', 'development']).optional(),

  // Security
  sessionTimeoutMinutes: z.coerce.number().optional(),
  passwordRotationDays: z.coerce.number().optional(),
  auditLogRetentionDays: z.coerce.number().optional(),
  mfaRequired: z.boolean().optional(),

  // Integrations
  razorpayEnabled: z.boolean().optional(),
  razorpayKeyId: z.string().optional(),
  sesEnabled: z.boolean().optional(),
  sentryEnabled: z.boolean().optional(),
})

export type SettingsFormData = z.infer<typeof settingsSchema>
