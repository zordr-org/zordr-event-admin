import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SettlementsList } from '@/features/settlements/components/SettlementsList'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const TestProviders = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)
import { mockSettlementsList } from '@/features/settlements/api'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/settlements',
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}))

vi.mock('@/providers/SessionProvider', () => ({
  useSession: () => ({ can: () => true })
}))

// Mock the API layer entirely
vi.mock('@/features/settlements/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/settlements/api')>()
  
  const mockSettlementsList = [
    {
      id: 'stl-1',
      organizerId: 'org-1',
      organizerName: 'Test Organizer',
      eventIds: ['evt-1'],
      periodStart: '2026-09-01T00:00:00Z',
      periodEnd: '2026-09-30T00:00:00Z',
      grossSales: 50000,
      platformFee: 2500,
      gatewayFee: 1000,
      refunds: 0,
      netPayout: 46500,
      status: 'pending' as const,
      createdAt: '2026-10-01T00:00:00Z'
    },
    {
      id: 'stl-2',
      organizerId: 'org-2',
      organizerName: 'Paid Organizer',
      eventIds: ['evt-2'],
      periodStart: '2026-08-01T00:00:00Z',
      periodEnd: '2026-08-31T00:00:00Z',
      grossSales: 100000,
      platformFee: 5000,
      gatewayFee: 2000,
      refunds: 1000,
      netPayout: 92000,
      status: 'paid' as const,
      transferReference: 'TXN123',
      transferDate: '2026-09-05T00:00:00Z',
      createdAt: '2026-09-01T00:00:00Z'
    }
  ]

  const mockApi = {
    getSettlements: vi.fn().mockResolvedValue({
      success: true,
      data: {
        settlements: mockSettlementsList,
        pagination: { page: 1, limit: 15, total: 2, totalPages: 1 }
      }
    }),
    getSettlementsKpis: vi.fn().mockResolvedValue({
      totalPayout: 138500,
      paidPayout: 92000,
      pendingPayout: 46500,
      onHoldPayout: 0
    }),
    generateSettlement: vi.fn().mockResolvedValue({ success: true, data: { job: { id: 'job-1', status: 'queued' } } }),
    holdSettlement: vi.fn().mockResolvedValue({ success: true }),
    markPaidSettlement: vi.fn().mockResolvedValue({ success: true }),
    exportSettlements: vi.fn().mockResolvedValue(new Blob())
  }

  return {
    ...actual,
    mockSettlementsList,
    getSettlementsApi: () => mockApi
  }
})

describe('Settlements Module', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders settlements list and KPI strip', async () => {
    render(<SettlementsList />, { wrapper: TestProviders })

    await waitFor(() => {
      expect(screen.getByText('Test Organizer')).toBeInTheDocument()
      expect(screen.getByText('Paid Organizer')).toBeInTheDocument()
    })

    // KPI verification
    expect(screen.getByText(/1,38,500/)).toBeInTheDocument() // Total
    expect(screen.getByText(/92,000/)).toBeInTheDocument()  // Paid
  })

  it('handles hold flow requiring a reason', async () => {
    render(<SettlementsList />, { wrapper: TestProviders })

    // Open hold dialog for pending settlement
    const holdBtns = await screen.findAllByRole('button', { name: /hold/i })
    await user.click(holdBtns[0])

    const dialogTitle = await screen.findByText('Hold Settlement')
    expect(dialogTitle).toBeInTheDocument()

    // Try submitting without reason
    const submitBtn = screen.getByRole('button', { name: /put on hold/i })
    expect(submitBtn).toBeDisabled() // Because ConfirmDialog disable submit when requireReason && !reason

    const reasonInput = screen.getByPlaceholderText(/provide a reason/i)
    await user.type(reasonInput, 'High chargeback risk')
    
    expect(submitBtn).toBeEnabled()
    await user.click(submitBtn)

    await waitFor(() => {
      expect(screen.queryByText('Hold Settlement')).not.toBeInTheDocument()
    })
  })

  it('handles mark paid flow requiring transfer details', async () => {
    render(<SettlementsList />, { wrapper: TestProviders })

    // Open mark paid modal
    const markPaidBtns = await screen.findAllByRole('button', { name: /mark paid/i })
    await user.click(markPaidBtns[0])

    expect(await screen.findByText('Mark Settlement as Paid')).toBeInTheDocument()

    const refInput = screen.getByLabelText(/transfer reference/i)
    const dateInput = screen.getByLabelText(/transfer date/i)

    await user.type(refInput, 'TXN-999')
    // date inputs can be tricky, userEvent.type might need a specific format
    await user.type(dateInput, '2026-10-05')

    const submitBtn = screen.getAllByRole('button', { name: 'Mark Paid' }).pop()!
    await user.click(submitBtn)

    await waitFor(() => {
      expect(screen.queryByText('Mark Settlement as Paid')).not.toBeInTheDocument()
    })
  })
})
