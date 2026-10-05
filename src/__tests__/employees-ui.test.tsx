import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EmployeesList } from '@/features/employees'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// We control session entirely via mock to avoid MockAuthApi bypassing apiFetch
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockCan = vi.fn((module: string, action: string): boolean => false)

vi.mock('@/providers/SessionProvider', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSession: () => ({ user: null, isLoading: false, can: mockCan }),
}))

const { mockEmployeesData } = vi.hoisted(() => ({
  mockEmployeesData: [
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
  ],
}))

vi.mock('@/features/employees/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/employees/api')>()
  return {
    ...actual,
    getEmployeesApi: () => ({
      getEmployees: vi.fn().mockResolvedValue({
        success: true,
        data: {
          employees: mockEmployeesData,
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        },
      }),
      inviteEmployee: vi.fn(),
      updateEmployee: vi.fn(),
    }),
  }
})

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  Wrapper.displayName = 'EmployeesTestWrapper'
  return Wrapper
}

describe('Employees Module UI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders employees list and Invite button for users with permission', async () => {
    // Grant employees view and create
    mockCan.mockImplementation((module: string, action: string) => {
      if (module === 'employees') return true
      return false
    })

    render(<EmployeesList />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Alice Admin')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /Invite employee/i })).toBeInTheDocument()
  })

  it('hides Invite button for users without create permission', async () => {
    // Grant employees view only — not create
    mockCan.mockImplementation((module: string, action: string) => {
      if (module === 'employees' && action === 'view') return true
      return false
    })

    render(<EmployeesList />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Alice Admin')).toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: /Invite employee/i })).not.toBeInTheDocument()
  })
})
