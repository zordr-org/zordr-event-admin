import type { Settings } from './types'

export const mockSettingsData: Settings = {
  // Fee config
  platformFeePercent: 5.0,
  convenienceFeePercent: 2.0,
  maxGatewayFeePercent: 2.5,

  // Branding & contact
  supportEmail: 'support@zordr.com',
  logoUrl: 'https://placehold.co/200x50/png?text=Zordr',
  orgName: 'Zordr Events Pvt. Ltd.',
  orgContactPhone: '+91 80 4567 8900',
  orgAddress: '12th Floor, Prestige Tower, MG Road, Bengaluru - 560001',
  orgWebsite: 'https://zordr.com',

  // Preferences
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12h',
  currency: 'INR',
  language: 'en',
  itemsPerPage: 15,

  // Notifications
  notifyOnNewOrganizer: true,
  notifyOnEventSubmitted: true,
  notifyOnRefundRequest: true,
  notifyOnPaymentFailure: true,
  notifyOnSettlementDue: true,
  notifyByEmail: true,
  notifySms: false,

  // Platform
  maintenanceMode: false,
  systemVersion: '1.0.0',
  environment: 'production',

  // Security
  sessionTimeoutMinutes: 60,
  passwordRotationDays: 90,
  auditLogRetentionDays: 365,
  mfaRequired: false,

  // Integrations
  razorpayEnabled: true,
  razorpayKeyId: 'rzp_live_**************',
  sesEnabled: true,
  sentryEnabled: true,
}

export const mockPlatformInfo = {
  plan: 'Enterprise Control Plane',
  memberSince: '2024-01-15T00:00:00Z',
  totalEventsCreated: 1842,
  totalRegisteredUsers: 94720,
  storageUsedGB: 12.4,
  storageMaxGB: 100,
}

export const mockSettingsActivityLog = [
  { id: 'act-1', admin: 'Alice Admin', action: 'Updated platform fee to 5%', at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 'act-2', admin: 'Jack Tech', action: 'Enabled MFA enforcement', at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: 'act-3', admin: 'Alice Admin', action: 'Updated support email', at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
  { id: 'act-4', admin: 'Bob Finance', action: 'Changed convenience fee to 2%', at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
  { id: 'act-5', admin: 'Alice Admin', action: 'Enabled SMS notifications', at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString() },
]
