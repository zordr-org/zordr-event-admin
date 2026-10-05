import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AnalyticsDashboard } from '@/features/analytics'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const TestProviders = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/analytics',
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}))

vi.mock('@/providers/SessionProvider', () => ({
  useSession: () => ({ can: () => true })
}))

vi.mock('@/features/analytics/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/analytics/api')>()
  return {
    ...actual,
    getAnalyticsApi: () => ({
      getOverview: vi.fn().mockResolvedValue({
        success: true,
        data: { totalGmv: 450000000, totalOrders: 1250, ticketsSold: 3400, activeEvents: 45, uniqueCustomers: 1100, conversionRate: 8.5 }
      }),
      getTrends: vi.fn().mockResolvedValue({
        success: true,
        data: [{ date: '2026-10-01T00:00:00Z', value: 100, secondaryValue: 50 }]
      }),
      getBreakdowns: vi.fn().mockResolvedValue({
        success: true,
        data: [{ label: 'UPI', value: 1000, percentage: 100 }]
      }),
      getLeaderboards: vi.fn().mockResolvedValue({
        success: true,
        data: [{ rank: 1, label: 'Top Event 1', metric: 1000 }]
      }),
      downloadReport: vi.fn().mockResolvedValue(new Blob(['mock data'], { type: 'text/csv' }))
    })
  }
})

describe('Analytics UI', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url')
    window.URL.revokeObjectURL = vi.fn()
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  })

  it('renders KPIs and widgets', async () => {
    render(<AnalyticsDashboard />, { wrapper: TestProviders })

    await waitFor(() => {
      expect(screen.getByText('Total GMV')).toBeInTheDocument()
      expect(screen.getByText('Orders')).toBeInTheDocument()
    })
  })

  it('can trigger report download', async () => {
    render(<AnalyticsDashboard />, { wrapper: TestProviders })
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /csv/i })).toBeInTheDocument()
    })

    const csvBtn = screen.getByRole('button', { name: /csv/i })
    await user.click(csvBtn)

    await waitFor(() => {
      expect(window.URL.createObjectURL).toHaveBeenCalled()
    })
  })
})
