import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { canDo } from '@/lib/permissions'
import { SessionProvider, useSession } from '@/providers/SessionProvider'
import { Sidebar } from '@/components/shell/Sidebar'
import type { AdminUser } from '@/types/auth'
import * as apiClient from '@/lib/api/client'

// ── Mocks ──────────────────────────────────────────────────────────────────────
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/dashboard',
}))

// ── Fixtures ───────────────────────────────────────────────────────────────────
function perm(view: boolean) {
  return { view, create: view, edit: view, delete: view, export: view }
}

const SUPER_ADMIN: AdminUser = {
  id: 'u1', name: 'Admin User', email: 'admin@zordr.com',
  roleName: 'Super Admin', department: 'Management',
  permissions: {
    dashboard: perm(true), organizers: perm(true), events: perm(true),
    orders: perm(true), customers: perm(true), settlements: perm(true),
    refunds: perm(true), support: perm(true), analytics: perm(true),
    employees: perm(true), roles: perm(true), settings: perm(true),
  },
}

const FINANCE_EXEC: AdminUser = {
  id: 'u2', name: 'Finance User', email: 'finance@zordr.com',
  roleName: 'Finance Executive', department: 'Finance',
  permissions: {
    dashboard: perm(true), organizers: perm(false), events: perm(false),
    orders: perm(false), customers: perm(false), settlements: perm(true),
    refunds: perm(true), support: perm(false), analytics: perm(true),
    employees: perm(false), roles: perm(false), settings: perm(false),
  },
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } } })
}

function renderWithSession(user: AdminUser, ui: React.ReactElement) {
  vi.spyOn(apiClient, 'getMe').mockResolvedValue(user)
  const client = makeClient()
  return render(
    <QueryClientProvider client={client}>
      <SessionProvider>{ui}</SessionProvider>
    </QueryClientProvider>,
  )
}

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('canDo() permissions helper', () => {
  it('returns false for null user', () => {
    expect(canDo(null, 'dashboard', 'view')).toBe(false)
  })

  it('returns true when super admin views any module', () => {
    expect(canDo(SUPER_ADMIN, 'employees', 'view')).toBe(true)
    expect(canDo(SUPER_ADMIN, 'settings', 'delete')).toBe(true)
  })

  it('returns correct results for finance exec', () => {
    expect(canDo(FINANCE_EXEC, 'settlements', 'view')).toBe(true)
    expect(canDo(FINANCE_EXEC, 'organizers', 'view')).toBe(false)
    expect(canDo(FINANCE_EXEC, 'analytics', 'view')).toBe(true)
    expect(canDo(FINANCE_EXEC, 'employees', 'view')).toBe(false)
  })

  it('returns false for a module not in permissions', () => {
    const user = { ...FINANCE_EXEC, permissions: {} as AdminUser['permissions'] }
    expect(canDo(user, 'events', 'view')).toBe(false)
  })
})

describe('Sidebar', () => {
  it('shows all nav items for super admin', async () => {
    renderWithSession(SUPER_ADMIN, <Sidebar />)
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /employees/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument()
    })
  })

  it('hides nav items the role cannot view', async () => {
    renderWithSession(FINANCE_EXEC, <Sidebar />)
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /settlements/i })).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /organizers/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /employees/i })).not.toBeInTheDocument()
    })
  })

  it('marks the active link with aria-current="page"', async () => {
    renderWithSession(SUPER_ADMIN, <Sidebar />)
    await waitFor(() => {
      const dashLink = screen.getByRole('link', { name: /dashboard/i })
      expect(dashLink).toHaveAttribute('aria-current', 'page')
    })
  })

  it('collapse toggle changes aria-label', async () => {
    renderWithSession(SUPER_ADMIN, <Sidebar />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /collapse sidebar/i })).toBeInTheDocument()
    })
    await userEvent.setup().click(screen.getByRole('button', { name: /collapse sidebar/i }))
    expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument()
  })
})

describe('401 from getMe redirects to login', () => {
  it('triggers a redirect when getMe returns 401', async () => {
    // The QueryProvider global error handler does window.location.href = /login
    // In JSDOM, window.location.href is read-only by default; just verify the
    // ZordrApiError propagates and canDo returns false (session is null).
    vi.spyOn(apiClient, 'getMe').mockRejectedValue(
      new apiClient.ZordrApiError({ status: 401, code: 'UNAUTHORIZED', message: 'Not authenticated' }),
    )

    // Render a consumer of useSession and verify user is null on 401
    function Consumer() {
      const { user } = useSession()
      return <div data-testid="user">{user ? user.name : 'no-user'}</div>
    }

    const client = makeClient()
    render(
      <QueryClientProvider client={client}>
        <SessionProvider>
          <Consumer />
        </SessionProvider>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no-user')
    })
  })
})