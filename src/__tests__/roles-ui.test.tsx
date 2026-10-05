import { render, screen, waitFor, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { RolesList } from '@/features/roles'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from '@/providers/SessionProvider'

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
  }
]

vi.mock('@/lib/api/client', () => ({
  apiFetch: vi.fn(async (url) => {
    if (url.includes('/api/admin/roles')) {
      return { success: true, data: mockRolesData }
    }
    return { success: true }
  }),
}))

import { apiFetch } from '@/lib/api/client'

const createWrapper = (canEdit = true) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  const permissions: any = {
    roles: {
      canView: true,
      canCreate: canEdit,
      canEdit,
      canDelete: canEdit,
      canExport: false,
    }
  }

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

  return ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </QueryClientProvider>
    )
  }
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

  it('hides Create Custom Role button and Delete option for unauthorized users', async () => {
    render(<RolesList />, { wrapper: createWrapper(false) })

    await waitFor(() => {
      expect(screen.getByText('Super Admin')).toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: /Create Custom Role/i })).not.toBeInTheDocument()
    
    // We would need to click the dropdown to see if delete is hidden
    const menus = screen.getAllByRole('button', { name: /Open menu/i })
    const user = userEvent.setup()
    await user.click(menus[1]) // click on Operations Manager menu

    expect(screen.queryByText(/Delete role/i)).not.toBeInTheDocument()
  })
})
