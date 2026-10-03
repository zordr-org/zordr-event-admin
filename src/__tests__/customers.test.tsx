import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CustomersList } from '@/features/customers/components/CustomersList'
import * as apiModule from '@/features/customers/api'
import { toast } from 'sonner'

const mockPush = vi.fn()
const mockBack = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/customers',
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/providers/SessionProvider', () => ({
  useSession: () => ({ can: () => true })
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() }
}))

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('CustomersList', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
  })

  it('renders customers list and KPIs', async () => {
    renderWithClient(<CustomersList />)
    
    await waitFor(() => {
      expect(screen.getByText(/Total Customers/i)).toBeInTheDocument()
    })
    
    const rows = screen.getAllByRole('row')
    expect(rows.length).toBeGreaterThan(5)
  })

  it('block flow requires a reason and fires mutation', async () => {
    renderWithClient(<CustomersList />)
    
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Block/i }).length).toBeGreaterThan(0)
    })
    
    const blockBtns = screen.getAllByRole('button', { name: /Block/i }).filter(btn => btn.textContent === 'Block')
    const blockBtn = blockBtns[0]
    await user.click(blockBtn)
    
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: /Block Customer/i })).toBeInTheDocument()
    
    const confirmBtn = within(dialog).getByRole('button', { name: /Block Customer/i, hidden: true })
    expect(confirmBtn).toBeDisabled() // Requires reason
    
    const reasonInput = within(dialog).getByLabelText(/Reason \(required\)/i)
    await user.type(reasonInput, 'Spam accounts')
    
    expect(confirmBtn).not.toBeDisabled()
    
    await user.click(confirmBtn)
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('blocked successfully'))
    })
  })

  it('unblock flow fires without requiring a reason', async () => {
    renderWithClient(<CustomersList />)
    
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Unblock/i }).length).toBeGreaterThan(0)
    })
    
    const unblockBtn = screen.getAllByRole('button', { name: /Unblock/i })[0]
    await user.click(unblockBtn)
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('unblocked successfully'))
    })
  })
})
