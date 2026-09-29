import { apiFetch } from '@/lib/api/client'
import type { DashboardSummary, TimeRange } from './types'

export interface DashboardApi {
  getSummary(range: TimeRange): Promise<DashboardSummary>
}

class HttpDashboardApi implements DashboardApi {
  async getSummary(range: TimeRange): Promise<DashboardSummary> {
    return apiFetch<DashboardSummary>(`/api/v1/admin/dashboard/summary?range=${range}`)
  }
}

class MockDashboardApi implements DashboardApi {
  async getSummary(range: TimeRange): Promise<DashboardSummary> {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const isDaily = range === '7d'

    return {
      kpis: [
        { key: 'gmv', value: '124,500', previousValue: isDaily ? '115,000' : '100,000', deltaPct: '8.2', deltaTrend: 'up' },
        { key: 'registrations', value: '854', previousValue: isDaily ? '800' : '900', deltaPct: '6.7', deltaTrend: 'up' },
        { key: 'activeEvents', value: '142', previousValue: isDaily ? '140' : '135', deltaPct: '1.4', deltaTrend: 'up' },
        { key: 'pendingApprovals', value: '24', previousValue: '24', deltaPct: '0', deltaTrend: 'neutral' },
        { key: 'failedPayments', value: '12', previousValue: isDaily ? '15' : '10', deltaPct: '-20', deltaTrend: 'down' },
        { key: 'refundRequests', value: '8', previousValue: isDaily ? '5' : '10', deltaPct: '60', deltaTrend: 'down' },
      ],
      trends: {
        revenue: Array.from({ length: 7 }).map((_, i) => ({
          date: new Date(Date.now() - (6 - i) * 86400000).toISOString(),
          value: 10000 + Math.random() * 5000,
        })),
        registrations: Array.from({ length: 7 }).map((_, i) => ({
          date: new Date(Date.now() - (6 - i) * 86400000).toISOString(),
          value: 100 + Math.random() * 50,
          secondaryValue: 80 + Math.random() * 40,
        })),
        platformGrowth: [],
      },
      recentActivity: [
        { id: '1', type: 'ticket_sold', details: '2 VIP tickets sold for Tech Conference 2024', user: 'System', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), status: 'success' },
        { id: '2', type: 'event_published', details: 'Design System Workshop is now live', user: 'System', timestamp: new Date(Date.now() - 15 * 60000).toISOString(), status: 'success' },
        { id: '3', type: 'organizer_onboarded', details: 'Starlight Events requested approval', user: 'System', timestamp: new Date(Date.now() - 45 * 60000).toISOString(), status: 'warning' },
        { id: '4', type: 'refund_requested', details: 'Order #992 requested a refund', user: 'System', timestamp: new Date(Date.now() - 120 * 60000).toISOString(), status: 'error' },
      ],
      liveEvents: [
        { id: 'e1', title: 'Tech Conference 2024', attendingCount: 450, location: 'San Francisco, CA', imageUrl: '' },
        { id: 'e2', title: 'Design System Workshop', attendingCount: 45, location: 'Remote', imageUrl: '' },
      ],
    }
  }
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
export const getDashboardApi = (): DashboardApi => USE_MOCK ? new MockDashboardApi() : new HttpDashboardApi()
