import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OrdersList } from '@/features/orders/components/OrdersList'
import * as apiModule from '@/features/orders/api'
import { toast } from 'sonner'

// ── Mock next/navigation ───────────────────────────────────────────────────────
const mockPush = vi.fn()
const mockBack = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/orders',
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/providers/SessionProvider', () => ({
  useSession: () => ({ can: () => true })
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() }
}))

// Mock URL.createObjectURL to prevent errors during CSV export test
global.URL.createObjectURL = vi.fn(() => 'mock-url')
global.URL.revokeObjectURL = vi.fn()

// ── Helpers ────────────────────────────────────────────────────────────────────
function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('OrdersList', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
    
    // We mock the bulkAction method to spy on it without making actual timeouts run
    const api = apiModule.getOrdersApi()
    vi.spyOn(api, 'bulkAction')
  })

  it('renders orders list and KPIs', async () => {
    renderWithClient(<OrdersList />)
    
    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText(/Total Orders/i)).toBeInTheDocument()
    })
    
    // Ensure table rows are rendered (the mock data has ~35 orders, 15 per page)
    const rows = screen.getAllByRole('row')
    expect(rows.length).toBeGreaterThan(5) // header + some data rows
  })

  it('row selection enables bulk action bar', async () => {
    renderWithClient(<OrdersList />)
    
    await waitFor(() => {
      expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0)
    })
    
    const checkboxes = screen.getAllByRole('checkbox')
    // First checkbox is "Select all", second is the first row
    await user.click(checkboxes[1])
    
    expect(await screen.findByText('1 order selected')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Bulk Refund/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Export Selected Orders/i })).toBeInTheDocument()
  })

  it('bulk refund requires a reason and fires mutation', async () => {
    renderWithClient(<OrdersList />)
    
    await waitFor(() => {
      expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0)
    })
    
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1]) // select first order
    
    const refundBtn = await screen.findByRole('button', { name: /Bulk Refund/i })
    await user.click(refundBtn)
    
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/Bulk Refund Orders/i)).toBeInTheDocument()
    
    const confirmBtn = within(dialog).getByRole('button', { name: /Queue Refund Job/i })
    expect(confirmBtn).toBeDisabled() // Requires reason

    const reasonInput = within(dialog).getByLabelText(/Reason \(required\)/i)
    await user.type(reasonInput, 'Customer requested cancellation')
    
    expect(confirmBtn).not.toBeDisabled()
    
    await user.click(confirmBtn)
    
    // The spy should be called with correct arguments
    const api = apiModule.getOrdersApi()
    await waitFor(() => {
      expect(api.bulkAction).toHaveBeenCalledWith({
        orderIds: expect.any(Array),
        action: 'refund'
      })
    })

    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Bulk refund queued'))
  })

  it('bulk export fires without requiring a reason', async () => {
    renderWithClient(<OrdersList />)
    
    await waitFor(() => {
      expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0)
    })
    
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1]) // select first order
    
    const exportBtn = await screen.findByRole('button', { name: /Export Selected Orders/i })
    await user.click(exportBtn)
    
    // Mutation is fired immediately
    const api = apiModule.getOrdersApi()
    await waitFor(() => {
      expect(api.bulkAction).toHaveBeenCalledWith({
        orderIds: expect.any(Array),
        action: 'export'
      })
    })

    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Bulk export queued'))
  })

  it('CSV export button triggers a download', async () => {
    const createElementSpy = vi.spyOn(document, 'createElement')
    
    renderWithClient(<OrdersList />)
    
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Export/i }).length).toBeGreaterThan(0)
    })
    
    // Top export button (not bulk export, since nothing is selected)
    const exportBtn = screen.getByRole('button', { name: /Export/i, hidden: false })
    await user.click(exportBtn)
    
    await waitFor(() => {
      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(global.URL.createObjectURL).toHaveBeenCalled()
    })
    
    createElementSpy.mockRestore()
  })
})
