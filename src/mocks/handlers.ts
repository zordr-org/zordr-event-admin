import { NextRequest, NextResponse } from 'next/server'
import type { AdminUser, Module, Action, Permission } from '@/types/auth'

// ─── Auth mock scenarios ──────────────────────────────────────────────────────
const SCENARIOS: Record<string, 'success' | 'mfa' | 'locked'> = {
  'admin@zordr.com': 'success',
  'mfa@zordr.com': 'mfa',
  'locked@zordr.com': 'locked',
}
const VALID_PASSWORD = 'Test@1234'
const VALID_MFA_CODE = '123456'

export async function mockLoginHandler(req: NextRequest): Promise<NextResponse> {
  await new Promise((r) => setTimeout(r, 400))
  const body = await req.json().catch(() => ({})) as { email?: string; password?: string }
  const email = (body.email ?? '').toLowerCase().trim()
  const password = body.password ?? ''
  const scenario = SCENARIOS[email]

  if (!scenario || password !== VALID_PASSWORD) {
    return NextResponse.json(
      { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      { status: 401 },
    )
  }
  if (scenario === 'locked') {
    return NextResponse.json(
      { code: 'ACCOUNT_LOCKED', message: 'Account temporarily locked.', retryAfter: 30 },
      { status: 423 },
    )
  }
  if (scenario === 'mfa') {
    return NextResponse.json({ mfaRequired: true, challengeId: 'mock-challenge-abc123' })
  }

  const res = NextResponse.json({
    mfaRequired: false,
    user: { id: 'u1', name: 'Admin', email, role: 'Super Admin' },
  })
  res.cookies.set('zordr_admin_session', 'mock-session-token', { httpOnly: true, path: '/' })
  return res
}

export async function mockMfaHandler(req: NextRequest): Promise<NextResponse> {
  await new Promise((r) => setTimeout(r, 350))
  const body = await req.json().catch(() => ({})) as { challengeId?: string; code?: string }
  if (body.code !== VALID_MFA_CODE) {
    return NextResponse.json(
      { code: 'INVALID_MFA_CODE', message: 'Invalid verification code' },
      { status: 401 },
    )
  }
  const res = NextResponse.json({
    user: { id: 'u2', name: 'Admin (MFA)', email: 'mfa@zordr.com', role: 'Super Admin' },
  })
  res.cookies.set('zordr_admin_session', 'mock-session-token', { httpOnly: true, path: '/' })
  return res
}

// ─── Permission helpers ───────────────────────────────────────────────────────
function allTrue(): Permission {
  return { view: true, create: true, edit: true, delete: true, export: true }
}
function viewOnly(): Permission {
  return { view: true, create: false, edit: false, delete: false, export: false }
}
function none(): Permission {
  return { view: false, create: false, edit: false, delete: false, export: false }
}

type MockRole = 'super_admin' | 'finance_exec' | 'support_exec' | 'marketing_exec'

function buildUser(
  id: string,
  name: string,
  email: string,
  roleName: string,
  department: string,
  perms: Record<Module, Permission>,
): AdminUser {
  return { id, name, email, roleName, department, permissions: perms }
}

const MOCK_USERS: Record<MockRole, AdminUser> = {
  super_admin: buildUser('u-super', 'Admin', 'admin@zordr.com', 'Super Admin', 'Management', {
    dashboard: allTrue(), organizers: allTrue(), events: allTrue(), orders: allTrue(),
    customers: allTrue(), settlements: allTrue(), refunds: allTrue(), support: allTrue(),
    analytics: allTrue(), employees: allTrue(), roles: allTrue(), settings: allTrue(),
  }),
  finance_exec: buildUser('u-finance', 'Sneha Kulkarni', 'sneha@zordr.com', 'Finance Executive', 'Finance', {
    dashboard: viewOnly(), organizers: none(), events: none(), orders: none(),
    customers: none(), settlements: allTrue(), refunds: allTrue(),
    support: none(), analytics: viewOnly(), employees: none(), roles: none(), settings: none(),
  }),
  support_exec: buildUser('u-support', 'Arjun Reddy', 'arjun@zordr.com', 'Support Executive', 'Support', {
    dashboard: viewOnly(), organizers: none(), events: none(), orders: viewOnly(),
    customers: viewOnly(), settlements: none(), refunds: none(),
    support: { view: true, create: true, edit: true, delete: false, export: false },
    analytics: none(), employees: none(), roles: none(), settings: none(),
  }),
  marketing_exec: buildUser('u-marketing', 'Ananya Das', 'ananya@zordr.com', 'Marketing Executive', 'Marketing', {
    dashboard: viewOnly(), organizers: none(), events: viewOnly(), orders: none(),
    customers: viewOnly(), settlements: none(), refunds: none(),
    support: none(), analytics: viewOnly(), employees: none(), roles: none(), settings: none(),
  }),
}

export async function mockMeHandler(req: NextRequest): Promise<NextResponse> {
  await new Promise((r) => setTimeout(r, 100))
  const role = (req.cookies.get('zordr_dev_role')?.value ?? 'super_admin') as MockRole
  const user = MOCK_USERS[role] ?? MOCK_USERS.super_admin
  return NextResponse.json(user)
}

export async function mockLogoutHandler(_req: NextRequest): Promise<NextResponse> {
  const res = NextResponse.json({ success: true })
  res.cookies.delete('zordr_admin_session')
  return res
}

// ─── Dashboard mock scenarios ──────────────────────────────────────────────────
import type { DashboardSummary, TimeRange } from '@/types/dashboard'

export async function mockDashboardSummaryHandler(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url)
  const range = (url.searchParams.get('range') ?? '7d') as TimeRange
  const simulate = url.searchParams.get('simulate') // 'slow' | 'error' | 'empty'
  
  if (simulate === 'slow') {
    await new Promise((r) => setTimeout(r, 2000))
  } else {
    await new Promise((r) => setTimeout(r, 300))
  }
  
  if (simulate === 'error') {
    return NextResponse.json({ code: 'SERVER_ERROR', message: 'Simulated server error' }, { status: 500 })
  }
  
  if (simulate === 'empty') {
    const emptySummary: DashboardSummary = {
      kpis: [],
      trends: { revenue: [], registrations: [], platformGrowth: [] },
      recentActivity: [],
      liveEvents: []
    }
    return NextResponse.json(emptySummary)
  }

  // Deterministic data based on range
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    return d.toISOString()
  })

  const baseRev = range === '7d' ? 100000 : 80000
  const baseReg = 300
  
  const revenue = dates.map((date, i) => {
    const isWeekend = new Date(date).getDay() === 0 || new Date(date).getDay() === 6
    const multiplier = isWeekend ? 1.5 : 1
    const noise = Math.sin(i) * 20000
    return { date, value: Math.max(0, Math.floor((baseRev + noise) * multiplier)) }
  })
  
  const registrations = dates.map((date, i) => {
    const isWeekend = new Date(date).getDay() === 0 || new Date(date).getDay() === 6
    const multiplier = isWeekend ? 1.3 : 1
    const noise = Math.cos(i) * 50
    return { date, value: Math.max(0, Math.floor((baseReg + noise) * multiplier)) }
  })

  const platformGrowth = dates.map((date, i) => ({
    date,
    value: 2000 + (i * (range === '90d' ? 10 : 50)), // Events
    secondaryValue: 1000 + (i * (range === '90d' ? 20 : 80)), // Customers
  }))

  const summary: DashboardSummary = {
    kpis: [
      { key: 'gmv', value: '₹1,24,560', deltaPct: '12%', deltaTrend: 'up', subtitle: 'vs. yesterday' },
      { key: 'registrations', value: '432', deltaPct: '18%', deltaTrend: 'up', subtitle: 'vs. yesterday' },
      { key: 'activeEvents', value: '18', deltaPct: '3', deltaTrend: 'up', subtitle: 'live now' },
      { key: 'pendingApprovals', value: '7', deltaPct: '2', deltaTrend: 'down', subtitle: 'events & organizers' },
      { key: 'failedPayments', value: '14', deltaPct: '27%', deltaTrend: 'up', subtitle: 'vs. yesterday' },
      { key: 'refundRequests', value: '5', deltaPct: '2', deltaTrend: 'up', subtitle: 'awaiting action' },
      { key: 'liveEvents', value: '12', subtitle: 'ongoing right now' },
      { key: 'pendingSettlements', value: '₹2,48,000', subtitle: '3 organizers' },
    ],
    trends: {
      revenue,
      registrations,
      platformGrowth,
    },
    recentActivity: [
      { id: '1', type: 'organizer_onboarded', details: 'Warangal Cultural Trust', user: '—', status: 'Approved', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
      { id: '2', type: 'event_created', details: 'Navratri Dandiya 2026', user: 'Rohit Mehta', status: 'Pending', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
      { id: '3', type: 'ticket_sold', details: 'Crescendo Fest 2026', user: 'priya.s@example.com', status: 'Completed', timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
      { id: '4', type: 'refund_requested', details: 'Order #ZOR26690123', user: 'rahul.k@example.com', status: 'Pending', timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString() },
      { id: '5', type: 'settlement_completed', details: 'Aarav Events', user: '—', status: 'Completed', timestamp: new Date(Date.now() - 1000 * 60 * 200).toISOString() },
      { id: '6', type: 'event_published', details: 'KITSW Tech Fest', user: 'admin@zordr.in', status: 'Published', timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString() },
      { id: '7', type: 'support_ticket', details: 'Login issue', user: 'sneha.r@example.com', status: 'Open', timestamp: new Date(Date.now() - 1000 * 60 * 450).toISOString() },
      { id: '8', type: 'payment_failed', details: 'Order #ZOR26690122', user: 'karthik.p@example.com', status: 'Failed', timestamp: new Date(Date.now() - 1000 * 60 * 600).toISOString() },
    ],
    liveEvents: [
      { id: 'e1', title: 'Navratri Dandiya 2026', location: 'Warangal Grounds', attendingCount: 1200, imageUrl: 'https://images.unsplash.com/photo-1601614838634-1cb180a5bf31?w=100&h=100&fit=crop' },
      { id: 'e2', title: 'Crescendo Fest 2026', location: 'KITSW', attendingCount: 856, imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=100&h=100&fit=crop' },
      { id: 'e3', title: 'Garba Nights', location: 'Vaagdevi College', attendingCount: 642, imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=100&h=100&fit=crop' },
      { id: 'e4', title: 'Tech Horizon', location: 'SR Engineering College', attendingCount: 421, imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&h=100&fit=crop' },
      { id: 'e5', title: 'Cultural Carnival', location: 'Warangal Club', attendingCount: 398, imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=100&h=100&fit=crop' },
    ]
  }
  
  return NextResponse.json(summary)
}