import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RefundsList } from '@/features/refunds/components/RefundsList'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const TestProviders = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/refunds',
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}))

vi.mock('@/providers/SessionProvider', () => ({
  useSession: () => ({ can: () => true })
}))

const mockRefundsData = [
  {
    id: 'ref-0001',
    orderId: 'ord-0001',
    customerName: 'John Doe',
    eventId: 'evt-1',
    eventName: 'Techverse Summit 2026',
    organizerId: 'org-1',
    amount: 500,
    reason: 'Customer requested',
    status: 'pending' as const,
    requestedOn: '2026-10-01T00:00:00Z'
  },
  {
    id: 'ref-0002',
    orderId: 'ord-0002',
    customerName: 'Jane Smith',
    eventId: 'evt-2',
    eventName: 'Indie Music Fest',
    organizerId: 'org-2',
    amount: 1000,
    reason: 'No show',
    status: 'processed' as const,
    requestedOn: '2026-09-25T00:00:00Z',
    processedOn: '2026-09-26T00:00:00Z',
    settlementAdjustment: 'deferred_settlement_paid' as const
  }
]

vi.mock('@/features/refunds/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/refunds/api')>()
  return {
    ...actual,
    getRefundsApi: () => ({
      getRefunds: vi.fn().mockResolvedValue({
        success: true,
        data: {
          refunds: mockRefundsData,
          pagination: { page: 1, limit: 15, total: 2, totalPages: 1 }
        }
      }),
      getRefundsKpis: vi.fn().mockResolvedValue({
        totalRefunds: 2,
        processedRefunds: 1,
        pendingRefunds: 1,
        rejectedRefunds: 0
      }),
      reviewRefund: vi.fn().mockResolvedValue({ success: true })
    })
  }
})

describe('Refunds UI', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders list and KPIs', async () => {
    render(<RefundsList />, { wrapper: TestProviders })

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    expect(screen.getByText('2', { selector: 'span.text-2xl.font-bold' })).toBeInTheDocument()
    expect(screen.getAllByText('1', { selector: 'span.text-2xl.font-bold' }).length).toBe(2)
  })

  it('opens review modal and submits approval', async () => {
    render(<RefundsList />, { wrapper: TestProviders })

    const reviewBtns = await screen.findAllByRole('button', { name: /review/i })
    expect(reviewBtns.length).toBeGreaterThan(0)
    await user.click(reviewBtns[0])

    const dialogTitle = await screen.findByText('Review Refund')
    expect(dialogTitle).toBeInTheDocument()

    const notesInput = screen.getByPlaceholderText(/add any internal notes/i)
    await user.type(notesInput, 'Looks good')

    const approveBtn = screen.getByRole('button', { name: /approve refund/i })
    await user.click(approveBtn)

    await waitFor(() => {
      expect(screen.queryByText('Review Refund')).not.toBeInTheDocument()
    })
  })
})
