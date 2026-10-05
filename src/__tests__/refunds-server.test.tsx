import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/admin/refunds/[id]/review/route'
import { mockRefundsList } from '@/features/refunds/mock'
import { mockSettlementsList } from '@/features/settlements/api'

describe('Refunds Server Logic', () => {
  beforeEach(() => {
    // Reset state before tests
    mockRefundsList.length = 0
    mockSettlementsList.length = 0

    mockSettlementsList.push({
      id: 'stl-pending',
      organizerId: 'org-pending',
      organizerName: 'Pending Org',
      eventIds: ['evt-1'],
      periodStart: '2026-09-01T00:00:00Z',
      periodEnd: '2026-09-30T00:00:00Z',
      grossSales: 50000,
      platformFee: 2500,
      gatewayFee: 1000,
      refunds: 0,
      netPayout: 46500,
      status: 'pending',
      createdAt: '2026-10-01T00:00:00Z'
    })

    mockSettlementsList.push({
      id: 'stl-paid',
      organizerId: 'org-paid',
      organizerName: 'Paid Org',
      eventIds: ['evt-2'],
      periodStart: '2026-09-01T00:00:00Z',
      periodEnd: '2026-09-30T00:00:00Z',
      grossSales: 50000,
      platformFee: 2500,
      gatewayFee: 1000,
      refunds: 0,
      netPayout: 46500,
      status: 'paid',
      transferReference: 'TXN123',
      transferDate: '2026-10-02T00:00:00Z',
      createdAt: '2026-10-01T00:00:00Z'
    })

    mockRefundsList.push({
      id: 'ref-open',
      orderId: 'ord-1',
      customerName: 'Cust 1',
      eventId: 'evt-1',
      eventName: 'Event 1',
      organizerId: 'org-pending',
      amount: 1000,
      reason: 'Cancel',
      status: 'pending',
      requestedOn: '2026-10-05T00:00:00Z'
    })

    mockRefundsList.push({
      id: 'ref-closed',
      orderId: 'ord-2',
      customerName: 'Cust 2',
      eventId: 'evt-2',
      eventName: 'Event 2',
      organizerId: 'org-paid',
      amount: 1000,
      reason: 'Cancel',
      status: 'pending',
      requestedOn: '2026-10-05T00:00:00Z'
    })
    
    mockRefundsList.push({
      id: 'ref-processed',
      orderId: 'ord-3',
      customerName: 'Cust 3',
      eventId: 'evt-3',
      eventName: 'Event 3',
      organizerId: 'org-pending',
      amount: 1000,
      reason: 'Cancel',
      status: 'processed',
      requestedOn: '2026-10-05T00:00:00Z'
    })
  })

  it('rejects duplicate review on already resolved refund', async () => {
    const req = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ decision: 'approve' })
    })
    const res = await POST(req, { params: { id: 'ref-processed' } })
    expect(res.status).toBe(409)
  })

  it('adjusts pending settlement on approval', async () => {
    const req = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ decision: 'approve' })
    })
    const res = await POST(req, { params: { id: 'ref-open' } })
    expect(res.status).toBe(200)

    const stl = mockSettlementsList.find(s => s.id === 'stl-pending')
    expect(stl?.netPayout).toBe(45500) // 46500 - 1000
    expect(stl?.refunds).toBe(1000)

    const ref = mockRefundsList.find(r => r.id === 'ref-open')
    expect(ref?.status).toBe('processed')
    expect(ref?.settlementAdjustment).toBe('applied')
  })

  it('defers settlement if settlement is already paid', async () => {
    const req = new NextRequest('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ decision: 'approve' })
    })
    const res = await POST(req, { params: { id: 'ref-closed' } })
    expect(res.status).toBe(200)

    const stl = mockSettlementsList.find(s => s.id === 'stl-paid')
    expect(stl?.netPayout).toBe(46500) // Unchanged
    expect(stl?.refunds).toBe(0) // Unchanged

    const ref = mockRefundsList.find(r => r.id === 'ref-closed')
    expect(ref?.status).toBe('processed')
    expect(ref?.settlementAdjustment).toBe('deferred_settlement_paid')
  })
})
