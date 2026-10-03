import { apiFetch } from '@/lib/api/client'
import type { 
  SettlementListItem, SettlementsFilters, SettlementsKpi, SettlementsResponse,
  GenerateSettlementRequest, GenerateSettlementResponse
} from './types'

export interface SettlementsApi {
  getSettlements(filters: SettlementsFilters): Promise<SettlementsResponse>
  getSettlementsKpis(): Promise<SettlementsKpi>
  generateSettlement(data: GenerateSettlementRequest): Promise<GenerateSettlementResponse>
  holdSettlement(id: string, reason: string): Promise<{ success: boolean }>
  markPaidSettlement(id: string, transferReference: string, transferDate: string): Promise<{ success: boolean }>
  exportSettlements(filters: SettlementsFilters, format: 'csv' | 'pdf'): Promise<Blob>
}

class HttpSettlementsApi implements SettlementsApi {
  async getSettlements(filters: SettlementsFilters): Promise<SettlementsResponse> {
    const params = new URLSearchParams()
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('limit', String(filters.limit))
    if (filters.organizerId) params.set('organizerId', filters.organizerId)
    if (filters.eventId) params.set('eventId', filters.eventId)
    if (filters.status) params.set('status', filters.status)
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.set('dateTo', filters.dateTo)
    
    return apiFetch<SettlementsResponse>(`/api/admin/settlements?${params}`)
  }

  async getSettlementsKpis(): Promise<SettlementsKpi> {
    return apiFetch<SettlementsKpi>('/api/admin/settlements/kpis')
  }

  async generateSettlement(data: GenerateSettlementRequest): Promise<GenerateSettlementResponse> {
    return apiFetch<GenerateSettlementResponse>('/api/admin/settlements/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async holdSettlement(id: string, reason: string): Promise<{ success: boolean }> {
    return apiFetch<{ success: boolean }>(`/api/admin/settlements/${id}/hold`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  async markPaidSettlement(id: string, transferReference: string, transferDate: string): Promise<{ success: boolean }> {
    return apiFetch<{ success: boolean }>(`/api/admin/settlements/${id}/mark-paid`, {
      method: 'POST',
      body: JSON.stringify({ transferReference, transferDate }),
    })
  }

  async exportSettlements(filters: SettlementsFilters, format: 'csv' | 'pdf'): Promise<Blob> {
    const params = new URLSearchParams()
    if (filters.organizerId) params.set('organizerId', filters.organizerId)
    if (filters.eventId) params.set('eventId', filters.eventId)
    if (filters.status) params.set('status', filters.status)
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.set('dateTo', filters.dateTo)
    params.set('format', format)

    const response = await fetch(`/api/admin/settlements/report?${params}`)
    if (!response.ok) throw new Error('Export failed')
    return response.blob()
  }
}

/**
 * Product Decision / Assumption:
 * The Organizer Portal discloses a "2% + ₹5/ticket" fee, but the Admin Settlements screen spec
 * shows a flat "5%" platform fee. To resolve this discrepancy as requested, both portals MUST 
 * read from this single FeeConfig entity. 
 *
 * For this mock implementation, we are standardizing on the 2% + ₹5 model as the source of truth
 * since it's the more detailed fee structure disclosed to the user at pricing time. 
 * The "5%" seen in the Admin UI mockup is assumed to be an illustrative/blended effective rate,
 * not the actual backend formula.
 */
export const FeeConfig = {
  platformFeePct: 2,
  perTicketFee: 5,
  gatewayFeePct: 2,
  effectiveFrom: '2026-01-01T00:00:00Z'
}

const getOrganizerName = (id: string) => {
  const names = [
    'Starlight Events', 'TechFest Org', 'Cultural Hub', 'SportZone', 'UpSkill Academy',
    'Comedy Club HYD', 'ArtSpace BLR', 'FoodFest India'
  ]
  const idx = parseInt(id.replace('org-', ''), 10) - 1
  return names[idx] || `Organizer ${idx + 1}`
}

function generateSettlements(): SettlementListItem[] {
  const settlements: SettlementListItem[] = []
  
  for (let i = 1; i <= 20; i++) {
    const organizerId = `org-${((i - 1) % 8) + 1}`
    const ticketsCount = 100 + (i * 10)
    const basePrice = 500
    const grossSales = ticketsCount * basePrice
    
    const platformFee = Math.round((grossSales * FeeConfig.platformFeePct / 100) + (ticketsCount * FeeConfig.perTicketFee))
    const gatewayFee = Math.round(grossSales * FeeConfig.gatewayFeePct / 100)
    const refunds = i % 4 === 0 ? 1500 : 0
    const netPayout = grossSales - platformFee - gatewayFee - refunds
    
    let status: any = 'paid'
    if (i % 3 === 0) status = 'pending'
    if (i % 5 === 0) status = 'on_hold'
    if (i === 7) status = 'failed'

    settlements.push({
      id: `stl-${String(i).padStart(4, '0')}`,
      organizerId,
      organizerName: getOrganizerName(organizerId),
      eventIds: [`evt-${i}`, `evt-${i+1}`],
      periodStart: new Date(Date.now() - (30 + i) * 24 * 60 * 60 * 1000).toISOString(),
      periodEnd: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      grossSales,
      platformFee,
      gatewayFee,
      refunds,
      netPayout,
      status,
      transferReference: status === 'paid' ? `TXN${Math.floor(Math.random()*100000)}` : undefined,
      transferDate: status === 'paid' ? new Date(Date.now() - (i-1) * 24 * 60 * 60 * 1000).toISOString() : undefined,
      holdReason: status === 'on_hold' ? 'High chargeback ratio' : undefined,
      createdAt: new Date().toISOString()
    })
  }
  return settlements
}

export const mockSettlementsList = generateSettlements()

class MockSettlementsApi implements SettlementsApi {
  async getSettlements(filters: SettlementsFilters): Promise<SettlementsResponse> {
    await new Promise((r) => setTimeout(r, 100))
    let filtered = [...mockSettlementsList]

    if (filters.organizerId) filtered = filtered.filter((s) => s.organizerId === filters.organizerId)
    if (filters.eventId) filtered = filtered.filter((s) => s.eventIds.includes(filters.eventId!))
    if (filters.status) filtered = filtered.filter((s) => s.status === filters.status)
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime()
      filtered = filtered.filter((s) => new Date(s.periodStart).getTime() >= from)
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo).getTime()
      filtered = filtered.filter((s) => new Date(s.periodEnd).getTime() <= to)
    }

    const page = filters.page ?? 1
    const limit = filters.limit ?? 15
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    return {
      success: true,
      data: {
        settlements: paginated,
        pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
      },
    }
  }

  async getSettlementsKpis(): Promise<SettlementsKpi> {
    await new Promise((r) => setTimeout(r, 100))
    const totalPayout = mockSettlementsList.reduce((acc, s) => acc + s.netPayout, 0)
    const paidPayout = mockSettlementsList.filter(s => s.status === 'paid').reduce((acc, s) => acc + s.netPayout, 0)
    const pendingPayout = mockSettlementsList.filter(s => s.status === 'pending').reduce((acc, s) => acc + s.netPayout, 0)
    const onHoldPayout = mockSettlementsList.filter(s => s.status === 'on_hold').reduce((acc, s) => acc + s.netPayout, 0)
    
    return {
      totalPayout,
      paidPayout,
      pendingPayout,
      onHoldPayout,
    }
  }

  async generateSettlement(data: GenerateSettlementRequest): Promise<GenerateSettlementResponse> {
    await new Promise((r) => setTimeout(r, 200))
    
    const existing = mockSettlementsList.find(s => 
      s.organizerId === data.organizerId &&
      new Date(s.periodStart).getTime() === new Date(data.periodStart).getTime() &&
      new Date(s.periodEnd).getTime() === new Date(data.periodEnd).getTime()
    )

    if (!existing && data.organizerId) {
      const ticketsCount = 200
      const basePrice = 500
      const grossSales = ticketsCount * basePrice
      const platformFee = Math.round((grossSales * FeeConfig.platformFeePct / 100) + (ticketsCount * FeeConfig.perTicketFee))
      const gatewayFee = Math.round(grossSales * FeeConfig.gatewayFeePct / 100)
      const netPayout = grossSales - platformFee - gatewayFee
      
      mockSettlementsList.unshift({
        id: `stl-new-${Date.now()}`,
        organizerId: data.organizerId,
        organizerName: getOrganizerName(data.organizerId),
        eventIds: ['evt-1'],
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        grossSales,
        platformFee,
        gatewayFee,
        refunds: 0,
        netPayout,
        status: 'pending',
        createdAt: new Date().toISOString()
      })
    }
    
    return {
      success: true,
      data: {
        job: {
          id: `job-${Math.floor(Math.random() * 10000)}`,
          status: 'queued'
        }
      }
    }
  }

  async holdSettlement(id: string, reason: string): Promise<{ success: boolean }> {
    await new Promise((r) => setTimeout(r, 200))
    const s = mockSettlementsList.find(s => s.id === id)
    if (!s) throw new Error('Not found')
    if (s.status === 'paid') throw new Error('Cannot modify paid settlement')
    
    s.status = 'on_hold'
    s.holdReason = reason
    return { success: true }
  }

  async markPaidSettlement(id: string, transferReference: string, transferDate: string): Promise<{ success: boolean }> {
    await new Promise((r) => setTimeout(r, 200))
    const s = mockSettlementsList.find(s => s.id === id)
    if (!s) throw new Error('Not found')
    if (s.status === 'paid') throw new Error('Cannot modify paid settlement')
    
    s.status = 'paid'
    s.transferReference = transferReference
    s.transferDate = transferDate
    s.holdReason = undefined
    return { success: true }
  }

  async exportSettlements(filters: SettlementsFilters, format: 'csv' | 'pdf'): Promise<Blob> {
    await new Promise((r) => setTimeout(r, 200))
    return new Blob(['Dummy CSV Data for Settlements'], { type: 'text/csv' })
  }
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
export const getSettlementsApi = (): SettlementsApi => (USE_MOCK ? new MockSettlementsApi() : new HttpSettlementsApi())
