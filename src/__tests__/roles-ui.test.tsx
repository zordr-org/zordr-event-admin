import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { RolesList } from '@/features/roles'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from '@/providers/SessionProvider'

const mockCan = vi.fn().mockReturnValue(true)
vi.mock('@/providers/SessionProvider', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSession: () => ({ user: null, isLoading: false, can: mockCan }),
}))

const mockRolesData = [
  {
    id: 'role-1',
    name: 'Super Admin',
    type: 'system',
    isDeletable: false,
    employeeCount: 2,
  },
  {
    id: 'role-5',
    name: 'Operations Manager',
    type: 'custom',
    isDeletable: true,
    employeeCount: 0,
  },
]

vi.mock('@/lib/api/client', () => ({
  apiFetch: vi.fn(async (url: string) => {
    if (url.includes('/api/admin/roles')) {
      return { success: true, data: mockRolesData }
    }
    return { success: true }
  }),
}))

import { apiFetch } from '@/lib/api/client'

function buildPermissions(canEdit: boolean) {
  const off = { view: false, create: false, edit: false, delete: false, export: false }
  return {
    dashboard: { ...off, view: true },
    organizers: off,
    events: off,
    orders: off,
    customers: off,
    settlements: off,
    refunds: off,
    support: off,
    analytics: off,
    employees: off,
    roles: { view: true, create: canEdit, edit: canEdit, delete: canEdit, export: false },
    settings: off,
  }
}

function createWrapper(canEdit = true) {
  mockCan.mockImplementation((mod, action) => {
    if (mod === 'roles' && action === 'create') return canEdit;
    return true;
  });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  const permissions = buildPermissions(canEdit)

  vi.mocked(apiFetch).mockImplementation(async (url: string) => {
    if (url.includes('/api/v1/admin/employees/me')) {
      return {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        roleName: 'Test',
        department: 'Test',
        permissions,
      }
    }
    if (url.includes('/api/admin/roles')) {
      return { success: true, data: mockRolesData }
    }
    return { success: true }
  })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </QueryClientProvider>
    )
  }
  Wrapper.displayName = 'RolesTestWrapper'
  return Wrapper
}

describe('Roles Module UI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders roles list and Create button for authorized users', async () => {
    render(<RolesList />, { wrapper: createWrapper(true) })

    await waitFor(() => {
      expect(screen.getByText('Super Admin')).toBeInTheDocument()
      expect(screen.getByText('Operations Manager')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /Create Custom Role/i })).toBeInTheDocument()
  })

  it('hides Create Custom Role button for unauthorized users', async () => {
    render(<RolesList />, { wrapper: createWrapper(false) })

    await waitFor(() => {
      expect(screen.getByText('Super Admin')).toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: /Create Custom Role/i })).not.toBeInTheDocument()
  })
})
