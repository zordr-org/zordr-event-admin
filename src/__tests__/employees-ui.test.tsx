import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { EmployeesList } from '@/features/employees'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from '@/providers/SessionProvider'

const mockEmployeesData = [
  {
    id: 'emp-1',
    name: 'Alice Admin',
    email: 'alice@zordr.com',
    roleId: 'role-1',
    role: 'Super Admin',
    department: 'engineering',
    status: 'active',
    lastActiveAt: '2026-10-05T18:00:00Z',
  },
]

vi.mock('@/lib/api/client', () => ({
  apiFetch: vi.fn(async (url) => {
    if (url.includes('/api/admin/auth/me')) {
      // Return a basic mock based on some global test state if we wanted, 
      // but for vitest we can use vi.mocked to override it per-test, 
      // or just return from a module-scoped variable.
      // We will override this implementation in the wrapper setup via mockImplementation.
      return { id: 'test' } // default
    }
    if (url.includes('/api/admin/employees')) {
      return { 
        success: true, 
        data: { 
          employees: mockEmployeesData,
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        } 
      }
    }
    return { success: true }
  }),
}))

import { apiFetch } from '@/lib/api/client'

const createWrapper = (canCreate = true) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  // Override auth mock for this specific wrapper instance
  const permissions: any = {
    employees: {
      canView: true,
      canCreate,
      canEdit: canCreate,
      canDelete: false,
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
    if (url.includes('/api/admin/employees')) {
      return { 
        success: true, 
        data: { 
          employees: mockEmployeesData,
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        } 
      }
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

describe('Employees Module UI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders employees list and Invite button for users with permission', async () => {
    render(<EmployeesList />, { wrapper: createWrapper(true) })

    await waitFor(() => {
      expect(screen.getByText('Alice Admin')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /Invite employee/i })).toBeInTheDocument()
  })

  it('hides Invite button for users without create permission', async () => {
    render(<EmployeesList />, { wrapper: createWrapper(false) })

    await waitFor(() => {
      expect(screen.getByText('Alice Admin')).toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: /Invite employee/i })).not.toBeInTheDocument()
  })
})
