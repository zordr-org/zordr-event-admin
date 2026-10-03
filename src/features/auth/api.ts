import { ZordrApiError, apiFetch } from '@/lib/api/client'
import type { AdminUser, Permission } from '@/types/auth'
import type { LoginFormValues } from './schemas'

export interface LoginRequest extends LoginFormValues {
  mfaCode?: string
}

export interface LoginResponse {
  mfaRequired?: boolean
  user?: { id: string; name: string; email: string; role: string }
}

export interface AuthApi {
  login(data: LoginRequest): Promise<LoginResponse>
  me(): Promise<AdminUser>
  logout(): Promise<void>
}

class HttpAuthApi implements AuthApi {
  async login(data: LoginRequest): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/api/v1/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async me(): Promise<AdminUser> {
    // Note: The API contract doesn't specify an admin 'me' endpoint explicitly,
    // assuming it exists at /api/v1/admin/employees/me for session hydration
    return apiFetch<AdminUser>('/api/v1/admin/employees/me')
  }

  async logout(): Promise<void> {
    await apiFetch<unknown>('/api/v1/auth/logout', { method: 'POST' })
  }
}

class MockAuthApi implements AuthApi {
  async login(data: LoginRequest): Promise<LoginResponse> {
    await new Promise((r) => setTimeout(r, 400))
    const email = data.email.toLowerCase().trim()
    const password = data.password
    const VALID_PASSWORD = 'Test@1234'
    const VALID_MFA = '123456'
    
    if (password !== VALID_PASSWORD) {
      throw new ZordrApiError({ status: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' })
    }
    
    if (email === 'locked@zordr.com') {
      throw new ZordrApiError({ status: 423, code: 'ACCOUNT_LOCKED', message: 'Account temporarily locked.', retryAfter: 30 })
    }
    
    if (email === 'mfa@zordr.com' && data.mfaCode !== VALID_MFA) {
      if (!data.mfaCode) {
        return { mfaRequired: true }
      }
      throw new ZordrApiError({ status: 401, code: 'INVALID_MFA_CODE', message: 'Invalid verification code' })
    }
    
    if (typeof document !== 'undefined') {
      document.cookie = 'zordr_admin_session=mock-session-token; path=/; max-age=86400'
    }

    return {
      mfaRequired: false,
      user: { id: 'u1', name: 'Admin', email, role: 'Super Admin' },
    }
  }

  async me(): Promise<AdminUser> {
    await new Promise((r) => setTimeout(r, 100))
    const allTrue: Permission = { view: true, create: true, edit: true, delete: true, export: true }
    return {
      id: 'u-super',
      name: 'Admin',
      email: 'admin@zordr.com',
      roleName: 'Super Admin',
      department: 'Management',
      permissions: {
        dashboard: allTrue,
        organizers: allTrue,
        events: allTrue,
        orders: allTrue,
        customers: allTrue,
        settlements: allTrue,
        refunds: allTrue,
        support: allTrue,
        analytics: allTrue,
        employees: allTrue,
        roles: allTrue,
        settings: allTrue,
      }
    }
  }

  async logout(): Promise<void> {
    await new Promise(r => setTimeout(r, 100))
    if (typeof document !== 'undefined') {
      document.cookie = 'zordr_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
  }
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
export const getAuthApi = (): AuthApi => USE_MOCK ? new MockAuthApi() : new HttpAuthApi()
