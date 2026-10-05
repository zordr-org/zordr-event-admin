import { apiFetch } from '@/lib/api/client'
import type { SettingsResponse, UpdateSettingsRequest, UpdateSettingsResponse } from './types'

export interface SettingsApi {
  getSettings(): Promise<SettingsResponse>
  updateSettings(data: UpdateSettingsRequest): Promise<UpdateSettingsResponse>
}

class HttpSettingsApi implements SettingsApi {
  async getSettings(): Promise<SettingsResponse> {
    return apiFetch<SettingsResponse>('/api/admin/settings')
  }

  async updateSettings(data: UpdateSettingsRequest): Promise<UpdateSettingsResponse> {
    return apiFetch<UpdateSettingsResponse>('/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }
}

export const getSettingsApi = (): SettingsApi => new HttpSettingsApi()
