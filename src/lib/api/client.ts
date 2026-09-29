// ─── Typed API Error ─────────────────────────────────────────────────────────
export interface ApiError {
  status: number
  code: string
  message: string
  retryAfter?: number
}

export class ZordrApiError extends Error {
  status: number
  code: string
  retryAfter?: number

  constructor({ status, code, message, retryAfter }: ApiError) {
    super(message)
    this.name = 'ZordrApiError'
    this.status = status
    this.code = code
    this.retryAfter = retryAfter
  }
}

// ─── Base URL ─────────────────────────────────────────────────────────────────
// In mock mode: route to Next.js route handlers on the same origin (/api/...)
// In real mode: route to the external backend (NEXT_PUBLIC_API_URL)
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
const BASE_URL = USE_MOCK ? '/api' : (process.env.NEXT_PUBLIC_API_URL ?? '')

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${path}`

  let response: Response
  try {
    response = await fetch(url, {
      ...options,
      credentials: 'include', // send httpOnly session cookie
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
  } catch {
    // Network / CORS failure
    throw new ZordrApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Unable to reach the server. Check your connection and try again.',
    })
  }

  // Parse body regardless of status (API may return JSON error bodies)
  let body: Record<string, unknown> = {}
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    try {
      body = await response.json()
    } catch {
      body = {}
    }
  }

  if (!response.ok) {
    const retryAfter =
      typeof body['retryAfter'] === 'number' ? body['retryAfter'] : undefined
    throw new ZordrApiError({
      status: response.status,
      code: typeof body['code'] === 'string' ? body['code'] : `HTTP_${response.status}`,
      message:
        typeof body['message'] === 'string'
          ? body['message']
          : `Request failed with status ${response.status}`,
      retryAfter,
    })
  }

  return body as T
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginSuccessResponse {
  mfaRequired?: false
  user?: { id: string; name: string; email: string; role: string }
}

export interface LoginMfaResponse {
  mfaRequired: true
  challengeId: string
}

export type LoginResponse = LoginSuccessResponse | LoginMfaResponse

export async function postLogin(data: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export interface MfaVerifyRequest {
  challengeId: string
  code: string
}

export interface MfaVerifyResponse {
  user?: { id: string; name: string; email: string; role: string }
}

export async function postMfaVerify(data: MfaVerifyRequest): Promise<MfaVerifyResponse> {
  return apiFetch<MfaVerifyResponse>('/admin/auth/mfa/verify', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ─── Me endpoint ──────────────────────────────────────────────────────────────
import type { AdminUser } from '@/types/auth'

export async function getMe(): Promise<AdminUser> {
  return apiFetch<AdminUser>('/admin/auth/me')
}

// ─── Logout endpoint ──────────────────────────────────────────────────────────
export async function postLogout(): Promise<void> {
  await apiFetch<unknown>('/admin/auth/logout', { method: 'POST' })
}

// ─── Dashboard endpoints ──────────────────────────────────────────────────────
import type { DashboardSummary, TimeRange } from '@/types/dashboard'

export async function getDashboardSummary(range: TimeRange): Promise<DashboardSummary> {
  return apiFetch<DashboardSummary>(`/admin/dashboard/summary?range=${range}`)
}
