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
// In real mode: route to the external backend (NEXT_PUBLIC_API_URL)
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
export async function apiFetch<T>(
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

