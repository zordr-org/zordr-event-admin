import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginForm } from '@/features/auth/components/LoginForm'
import * as authApiModule from '@/features/auth/api'
import { ZordrApiError } from '@/lib/api/client'

// ── Mock next/navigation ───────────────────────────────────────────────────────
const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────
function renderLoginForm() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: 0 } } })
  return render(
    <QueryClientProvider client={client}>
      <LoginForm />
    </QueryClientProvider>,
  )
}

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText(/email address/i), email)
  // Use exact: true so we match the label "Password" but NOT aria-label="Show password"
  await user.type(screen.getByLabelText('Password', { exact: true }), password)
  await user.click(screen.getByRole('button', { name: /^login$/i }))
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Validation errors', () => {
    it('shows email required error when email is empty on submit', async () => {
      renderLoginForm()
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /login/i }))
      expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
    })

    it('shows invalid email error for malformed email', async () => {
      renderLoginForm()
      const user = userEvent.setup()
      await user.type(screen.getByLabelText(/email address/i), 'notanemail')
      await user.tab()
      expect(await screen.findByText(/valid email/i)).toBeInTheDocument()
    })

    it('shows password required error when password is empty on submit', async () => {
      renderLoginForm()
      const user = userEvent.setup()
      await user.type(screen.getByLabelText(/email address/i), 'admin@zordr.com')
      await user.click(screen.getByRole('button', { name: /login/i }))
      expect(await screen.findByText(/password is required/i)).toBeInTheDocument()
    })

    it('shows min-length error for short password', async () => {
      renderLoginForm()
      const user = userEvent.setup()
      await user.type(screen.getByLabelText('Password', { exact: true }), 'short')
      await user.tab()
      expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument()
    })
  })

  describe('Success flow', () => {
    it('redirects to /dashboard on successful login', async () => {
      const mockLogin = vi.fn().mockResolvedValueOnce({ mfaRequired: false })
      vi.spyOn(authApiModule, 'getAuthApi').mockReturnValue({ login: mockLogin } as any)
      renderLoginForm()
      await fillAndSubmit('admin@zordr.com', 'Test@1234')
      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/dashboard'))
    })
  })

  describe('Error states', () => {
    it('shows generic error message on 401', async () => {
      const mockLogin = vi.fn().mockRejectedValueOnce(
        new ZordrApiError({ status: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }),
      )
      vi.spyOn(authApiModule, 'getAuthApi').mockReturnValue({ login: mockLogin } as any)
      renderLoginForm()
      await fillAndSubmit('wrong@example.com', 'WrongPass1')
      expect(await screen.findByRole('alert')).toHaveTextContent(/invalid email or password/i)
    })

    it('shows locked state and disables form on 423', async () => {
      const mockLogin = vi.fn().mockRejectedValueOnce(
        new ZordrApiError({
          status: 423,
          code: 'ACCOUNT_LOCKED',
          message: 'Account locked',
          retryAfter: 30,
        }),
      )
      vi.spyOn(authApiModule, 'getAuthApi').mockReturnValue({ login: mockLogin } as any)
      renderLoginForm()
      await fillAndSubmit('locked@zordr.com', 'Test@1234')
      expect(await screen.findByRole('alert')).toHaveTextContent(/account temporarily locked/i)
      // Submit button should be disabled
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^login$/i })).toBeDisabled()
      })
    })

    it('shows network error on status 0', async () => {
      const mockLogin = vi.fn().mockRejectedValueOnce(
        new ZordrApiError({ status: 0, code: 'NETWORK_ERROR', message: 'Network error' }),
      )
      vi.spyOn(authApiModule, 'getAuthApi').mockReturnValue({ login: mockLogin } as any)
      renderLoginForm()
      await fillAndSubmit('admin@zordr.com', 'Test@1234')
      expect(await screen.findByRole('alert')).toHaveTextContent(/unable to reach/i)
    })
  })

  describe('MFA flow', () => {
    it('renders MFA step when mfaRequired is true', async () => {
      const mockLogin = vi.fn().mockResolvedValueOnce({ mfaRequired: true })
      vi.spyOn(authApiModule, 'getAuthApi').mockReturnValue({ login: mockLogin } as any)
      renderLoginForm()
      await fillAndSubmit('mfa@zordr.com', 'Test@1234')
      expect(await screen.findByText(/two-factor verification/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('password show/hide toggle has correct aria-pressed', async () => {
      renderLoginForm()
      const toggle = screen.getByRole('button', { name: /show password/i })
      expect(toggle).toHaveAttribute('aria-pressed', 'false')
      await userEvent.setup().click(toggle)
      expect(screen.getByRole('button', { name: /hide password/i })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    })
  })
})
