import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { SettingsForm } from '@/features/settings'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from '@/providers/SessionProvider'

const mockCan = vi.fn().mockReturnValue(true)
vi.mock('@/providers/SessionProvider', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSession: () => ({ user: null, isLoading: false, can: mockCan }),
}))

const mockSettingsData = {
  platformFeePercent: 5.0,
  convenienceFeePercent: 2.0,
  maxGatewayFeePercent: 2.5,
  supportEmail: 'support@zordr.com',
  logoUrl: 'https://example.com/logo.png',
}

vi.mock('@/lib/api/client', () => ({
  apiFetch: vi.fn(async (url: string, options?: RequestInit) => {
    if (url.includes('/api/admin/settings')) {
      if (options?.method === 'PATCH') {
        return { success: true, data: { ...mockSettingsData, ...JSON.parse(options.body as string) } }
      }
      return { success: true, data: mockSettingsData }
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
    roles: off,
    settings: { view: true, create: true, edit: canEdit, delete: true, export: true },
  }
}

function createWrapper(canEdit = true) {
  mockCan.mockImplementation((mod, action) => {
    if (mod === 'settings' && action === 'edit') return canEdit;
    return true;
  });
  mockCan.mockImplementation((mod, action) => {
    if (mod === 'settings' && action === 'edit') return canEdit;
    return true;
  });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
          {children}
      </QueryClientProvider>
    )
  }
  Wrapper.displayName = 'SettingsTestWrapper'
  return Wrapper
}

describe('Settings Module UI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders settings fields for authorized users and allows editing', async () => {
    render(<SettingsForm />, { wrapper: createWrapper(true) })

    await waitFor(() => {
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

  it('hides Save Settings button for users without edit permission', async () => {
    render(<SettingsForm />, { wrapper: createWrapper(false) })

    await waitFor(() => {
      expect(screen.getByDisplayValue('support@zordr.com')).toBeInTheDocument()
    })

    // Save button should not be present (wrapped in <Can module="settings" action="edit">)
    expect(screen.queryByRole('button', { name: /Save Settings/i })).not.toBeInTheDocument()
  })
})
