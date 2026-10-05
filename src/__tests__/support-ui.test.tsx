import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SupportList } from '@/features/support'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const TestProviders = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/support',
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}))

vi.mock('@/providers/SessionProvider', () => ({
  useSession: () => ({ can: () => true })
}))

const mockTicketsData = [
  {
    id: 'TKT-001',
    requesterType: 'customer',
    requesterName: 'Alice Smith',
    subject: 'Cannot access my tickets',
    category: 'tickets',
    eventName: 'Summer Music Fest',
    eventId: 'EVT-001',
    status: 'open' as const,
    priority: 'high' as const,
    createdAt: '2026-10-05T10:00:00Z',
  },
  {
    id: 'TKT-002',
    requesterType: 'organizer',
    requesterName: 'Rocking Events',
    subject: 'Payout delayed',
    category: 'payments',
    eventName: 'Winter Bash',
    eventId: 'EVT-002',
    status: 'resolved' as const,
    priority: 'medium' as const,
    createdAt: '2026-10-04T10:00:00Z',
  }
]

vi.mock('@/features/support/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/support/api')>()
  return {
    ...actual,
    getSupportApi: () => ({
      getTickets: vi.fn().mockResolvedValue({
        success: true,
        data: {
          tickets: mockTicketsData,
          pagination: { page: 1, limit: 20, total: 2, totalPages: 1 }
        }
      }),
      getSupportKpis: vi.fn().mockResolvedValue({
        openTickets: 1,
        pendingTickets: 0,
        resolvedTickets: 1,
        highPriority: 1
      }),
      getTicketThread: vi.fn().mockResolvedValue({
        success: true,
        data: {
          ticket: mockTicketsData[0],
          messages: [{ id: 'msg-1', authorName: 'Alice Smith', authorType: 'customer', message: 'Help me', createdAt: '2026-10-05T10:00:00Z' }]
        }
      }),
      replyTicket: vi.fn().mockResolvedValue({ success: true })
    })
  }
})

describe('Support UI', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders list and KPIs', async () => {
    render(<SupportList />, { wrapper: TestProviders })

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
      expect(screen.getByText('Rocking Events')).toBeInTheDocument()
    })

    const kpiValues = screen.getAllByText('1', { selector: 'div.text-2xl.font-bold' })
    expect(kpiValues.length).toBeGreaterThanOrEqual(2)
  })

  it('opens detail modal and updates status', async () => {
    render(<SupportList />, { wrapper: TestProviders })

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Alice Smith'))

    const dialogTitle = await screen.findByText('Ticket: Cannot access my tickets')
    expect(dialogTitle).toBeInTheDocument()

    const resolveBtn = await screen.findByRole('button', { name: 'Resolve' })
    await user.click(resolveBtn)

    await waitFor(() => {
      expect(screen.queryByText('Ticket: Cannot access my tickets')).not.toBeInTheDocument()
    })
  })
})
