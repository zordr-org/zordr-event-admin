export interface Settings {
  platformFeePercent: number
  convenienceFeePercent: number
  maxGatewayFeePercent: number
  supportEmail: string
  logoUrl?: string
}

export interface SettingsResponse {
  success: boolean
  data: Settings
}

export interface UpdateSettingsRequest {
  platformFeePercent?: number
  convenienceFeePercent?: number
  maxGatewayFeePercent?: number
  supportEmail?: string
  logoUrl?: string
}

export interface UpdateSettingsResponse {
  success: boolean
  data: Settings
}
