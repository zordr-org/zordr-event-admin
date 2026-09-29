import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import DashboardPage from './page'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as hooks from '@/features/dashboard/hooks'
import * as session from '@/providers/SessionProvider'

// Mock Recharts to avoid DOM measuring errors in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="recharts-container">{children}</div>,
  AreaChart: () => <div data-testid="area-chart" />,
  LineChart: () => <div data-testid="line-chart" />,
  Area: () => null,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}))

describe('Dashboard Page', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    
    vi.spyOn(session, 'useSession').mockReturnValue({
      user: { id: '1', name: 'Admin', email: 'admin@zordr.com', roleName: 'Admin', department: 'IT', permissions: {} as any },
      isLoading: false,
      can: (module, action) => {
        // Only allow organizers edit for Quick Actions test
        if (module === 'organizers' && action === 'edit') return true
        return false
      }
    })
  })

  const renderDashboard = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>
    )
  }

  it('renders loading skeletons initially', () => {
    vi.spyOn(hooks, 'useDashboardSummary').mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any)

    renderDashboard()
    // Chart skeletons
    expect(screen.queryAllByTestId('area-chart', { exact: false })).toHaveLength(0) // Not rendered yet
  })

  it('renders error state if data fails', () => {
    vi.spyOn(hooks, 'useDashboardSummary').mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as any)

    renderDashboard()
    expect(screen.getByText('Failed to load dashboard data.')).toBeInTheDocument()
  })

  it('renders KPIs with correct delta semantics', () => {
    vi.spyOn(hooks, 'useDashboardSummary').mockReturnValue({
      data: {
        kpis: [
          { key: 'failedPayments', value: '14', deltaPct: '27%', deltaTrend: 'up', subtitle: 'vs. yesterday' },
          { key: 'gmv', value: '₹1,24,560', deltaPct: '12%', deltaTrend: 'up' }
        ],
        trends: { revenue: [], registrations: [], platformGrowth: [] },
        recentActivity: [],
        liveEvents: []
      },
      isLoading: false,
      isError: false,
    } as any)

    renderDashboard()
    expect(screen.getByText('Failed Payments')).toBeInTheDocument()
    expect(screen.getByText('14')).toBeInTheDocument()
    expect(screen.getByText('↑ 27%')).toHaveClass('text-destructive') // Failed payments up should be text-destructive.
  })
})
