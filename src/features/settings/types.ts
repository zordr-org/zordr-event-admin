// ─── Core Fee Settings ────────────────────────────────────────────────────────
export interface Settings {
  // Existing fee/branding fields
  platformFeePercent: number
  convenienceFeePercent: number
  maxGatewayFeePercent: number
  supportEmail: string
  logoUrl?: string

  // General - Org Profile
  orgName?: string
  orgContactPhone?: string
  orgAddress?: string
  orgWebsite?: string

  // General - Preferences
  timezone?: string
  dateFormat?: string
  timeFormat?: '12h' | '24h'
  currency?: string
  language?: string
  itemsPerPage?: number

  // Notifications
  notifyOnNewOrganizer?: boolean
  notifyOnEventSubmitted?: boolean
  notifyOnRefundRequest?: boolean
  notifyOnPaymentFailure?: boolean
  notifyOnSettlementDue?: boolean
  notifyByEmail?: boolean
  notifySms?: boolean

  // Platform
  maintenanceMode?: boolean
  systemVersion?: string
  environment?: 'production' | 'staging' | 'development'

  // Security
  sessionTimeoutMinutes?: number
  passwordRotationDays?: number
  auditLogRetentionDays?: number
  mfaRequired?: boolean

  // Integrations
  razorpayEnabled?: boolean
  razorpayKeyId?: string
  sesEnabled?: boolean
  sentryEnabled?: boolean
}

export interface SettingsResponse {
  success: boolean
  data: Settings
  platformInfo?: PlatformInfo
  activityLog?: any[]
}

export interface UpdateSettingsRequest {
  platformFeePercent?: number
  convenienceFeePercent?: number
  maxGatewayFeePercent?: number
  supportEmail?: string
  logoUrl?: string
  orgName?: string
  orgContactPhone?: string
  orgAddress?: string
  orgWebsite?: string
  timezone?: string
  dateFormat?: string
  timeFormat?: '12h' | '24h'
  currency?: string
  language?: string
  itemsPerPage?: number
  notifyOnNewOrganizer?: boolean
  notifyOnEventSubmitted?: boolean
  notifyOnRefundRequest?: boolean
  notifyOnPaymentFailure?: boolean
  notifyOnSettlementDue?: boolean
  notifyByEmail?: boolean
  notifySms?: boolean
  maintenanceMode?: boolean
  sessionTimeoutMinutes?: number
  passwordRotationDays?: number
  auditLogRetentionDays?: number
  mfaRequired?: boolean
  razorpayEnabled?: boolean
  sesEnabled?: boolean
  sentryEnabled?: boolean
}

export interface UpdateSettingsResponse {
  success: boolean
  data: Settings
}

export interface PlatformInfo {
  plan: string
  memberSince: string
  totalEventsCreated: number
  totalRegisteredUsers: number
  storageUsedGB: number
  storageMaxGB: number
}
