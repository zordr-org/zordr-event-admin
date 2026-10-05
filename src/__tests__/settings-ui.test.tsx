import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { SettingsForm } from '@/features/settings'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from '@/providers/SessionProvider'

// Hoist mock data so vi.mock can access it
const mockSettingsData = {
  platformFeePercent: 5.0,
  convenienceFeePercent: 2.0,
  maxGatewayFeePercent: 2.5,
  supportEmail: 'support@zordr.com',
  logoUrl: 'https://example.com/logo.png',
}

vi.mock('@/lib/api/client', () => ({
  apiFetch: vi.fn(async (url, options) => {
    if (url.includes('/api/admin/settings')) {
      if (options?.method === 'PATCH') {
        return { success: true, data: { ...mockSettingsData, ...JSON.parse(options.body) } }
      }
      return { success: true, data: mockSettingsData }
    }
    return { success: true }
  }),
}))

import { apiFetch } from '@/lib/api/client'

const createWrapper = (role = 'super_admin') => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  const permissions: any = {}
  const ALL_MODULES = ['settings']
  ALL_MODULES.forEach((m) => {
    permissions[m] = {
      canView: true,
      canCreate: true,
      canEdit: role === 'super_admin',
      canDelete: true,
      canExport: true,
    }
  })

  vi.mocked(apiFetch).mockImplementation(async (url: string, options: any) => {
    if (url.includes('/api/v1/admin/employees/me')) {
      return {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        roleName: role,
        department: 'Test',
        permissions,
      }
    }
    if (url.includes('/api/admin/settings')) {
      if (options?.method === 'PATCH') {
        return { success: true, data: { ...mockSettingsData, ...JSON.parse(options.body) } }
      }
      return { success: true, data: mockSettingsData }
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

describe('Settings Module UI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders settings fields for super_admin and allows editing', async () => {
    render(<SettingsForm />, { wrapper: createWrapper('super_admin') })

    await waitFor(() => {
      expect(screen.getByDisplayValue('5')).toBeInTheDocument()
      expect(screen.getByDisplayValue('support@zordr.com')).toBeInTheDocument()
    })

    // Edit should be enabled
    const emailInput = screen.getByLabelText(/Support Email/i)
    expect(emailInput).not.toBeDisabled()

    const saveButton = screen.getByRole('button', { name: /Save Settings/i })
    expect(saveButton).toBeInTheDocument()
    expect(saveButton).toBeDisabled() // disabled because not dirty

    const user = userEvent.setup()
    await user.clear(emailInput)
    await user.type(emailInput, 'new@zordr.com')

    expect(saveButton).not.toBeDisabled()
  })

  it('renders settings as read-only for roles without edit permission', async () => {
    render(<SettingsForm />, { wrapper: createWrapper('marketing_exec') })

    await waitFor(() => {
      expect(screen.getByDisplayValue('5')).toBeInTheDocument()
    })

    // Save button should not be present
    expect(screen.queryByRole('button', { name: /Save Settings/i })).not.toBeInTheDocument()
  })
})
