'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  IndianRupee,
  Users,
  CalendarDays,
  Clock,
  XCircle,
  RefreshCcw,
  Radio,
  Wallet,
  UserPlus,
  CalendarPlus,
  Ticket,
  Undo2,
  Headphones,
  MapPin
} from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import { KpiCard } from '@/components/shell/KpiCard'
import { StatusBadge } from '@/components/shell/StatusBadge'
import { Can } from '@/components/shell/Can'
import { Skeleton } from '@/components/ui/skeleton'
import { AreaTrend } from '@/components/charts/AreaTrend'
import { DualLineTrend } from '@/components/charts/DualLineTrend'
import { useDashboardSummary } from '@/features/dashboard/hooks'
import type { TimeRange, ActivityItem } from '@/features/dashboard/types'
import { formatRelativeTime } from '@/lib/format'

const KPI_ICONS: Record<string, React.ReactNode> = {
  gmv: <IndianRupee className="w-5 h-5 text-emerald-600" />,
  registrations: <Users className="w-5 h-5 text-blue-600" />,
  activeEvents: <CalendarDays className="w-5 h-5 text-purple-600" />,
  pendingApprovals: <Clock className="w-5 h-5 text-orange-600" />,
  failedPayments: <XCircle className="w-5 h-5 text-red-600" />,
  refundRequests: <RefreshCcw className="w-5 h-5 text-amber-600" />,
  liveEvents: <Radio className="w-5 h-5 text-emerald-600" />,
  pendingSettlements: <Wallet className="w-5 h-5 text-blue-600" />,
}

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  organizer_onboarded: <UserPlus className="w-4 h-4 text-emerald-600" />,
  event_created: <CalendarPlus className="w-4 h-4 text-blue-600" />,
  ticket_sold: <Ticket className="w-4 h-4 text-blue-600" />,
  refund_requested: <Undo2 className="w-4 h-4 text-red-600" />,
  settlement_completed: <Wallet className="w-4 h-4 text-emerald-600" />,
  event_published: <CalendarDays className="w-4 h-4 text-blue-600" />,
  support_ticket: <Headphones className="w-4 h-4 text-blue-600" />,
  payment_failed: <XCircle className="w-4 h-4 text-red-600" />,
}

export default function DashboardPage() {
  const [range, setRange] = useState<TimeRange>('7d')
  const { data, isLoading, isError } = useDashboardSummary(range)

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              <div className="flex items-center gap-2">
                Good evening, Admin! <span className="text-2xl" aria-hidden="true">👋</span>
              </div>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Here&apos;s what&apos;s happening with Zordr today.</p>
          </div>
        </div>
        
        <div className="flex bg-muted p-1 rounded-lg self-start">
          {(['7d', '30d', '90d'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                range === r ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Last {r.replace('d', ' days')}
            </button>
          ))}
        </div>
      </div>

      {isError ? (
        <div className="p-8 text-center border rounded-xl bg-destructive/5">
          <p className="text-destructive font-semibold">Failed to load dashboard data.</p>
          <p className="text-sm text-muted-foreground mt-1">Please try refreshing the page.</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {isLoading && !data
              ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[120px] rounded-xl" />)
              : data?.kpis.map((kpi) => (
                  <KpiCard
                    key={kpi.key}
                    label={kpi.key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    value={kpi.value}
                    delta={kpi.deltaPct ? `${kpi.deltaTrend === 'up' ? '↑' : '↓'} ${kpi.deltaPct}` : undefined}
                    trend={kpi.deltaTrend}
                    inverseTrendColor={kpi.key === 'failedPayments' || kpi.key === 'refundRequests'}
                    sub={kpi.subtitle}
                    icon={KPI_ICONS[kpi.key]}
                  />
                ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="border border-border rounded-xl bg-card p-5">
              <h3 className="font-semibold text-base mb-4">Daily Revenue (GMV)</h3>
              {isLoading && !data ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <AreaTrend data={data?.trends.revenue || []} color="hsl(var(--brand))" valuePrefix="currency" />
              )}
            </div>
            
            <div className="border border-border rounded-xl bg-card p-5">
              <h3 className="font-semibold text-base mb-4">Registrations</h3>
              {isLoading && !data ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <AreaTrend data={data?.trends.registrations || []} color="#2563EB" valuePrefix="number" />
              )}
            </div>

            <div className="border border-border rounded-xl bg-card p-5">
              <h3 className="font-semibold text-base mb-4">Platform Growth</h3>
              {isLoading && !data ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <DualLineTrend 
                  data={data?.trends.platformGrowth || []} 
                  primaryColor="hsl(var(--brand))" 
                  secondaryColor="#8B5CF6" 
                  primaryName="Events"
                  secondaryName="Customers"
                />
              )}
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="xl:col-span-2 border border-border rounded-xl bg-card flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="font-semibold text-base">Recent Activity</h3>
                <Link href="/analytics" className="text-sm font-medium text-brand hover:underline">
                  View All →
                </Link>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-5 py-3 font-medium">Time</th>
                      <th className="px-5 py-3 font-medium">Type</th>
                      <th className="px-5 py-3 font-medium">Details</th>
                      <th className="px-5 py-3 font-medium">User</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isLoading && !data ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          <td className="px-5 py-4"><Skeleton className="h-4 w-16" /></td>
                          <td className="px-5 py-4"><Skeleton className="h-4 w-32" /></td>
                          <td className="px-5 py-4"><Skeleton className="h-4 w-40" /></td>
                          <td className="px-5 py-4"><Skeleton className="h-4 w-32" /></td>
                          <td className="px-5 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                        </tr>
                      ))
                    ) : data?.recentActivity.map((activity: ActivityItem) => {
                      // Map activity type to the relevant module
                      let moduleHref = '/dashboard'
                      if (activity.type === 'organizer_onboarded') moduleHref = '/organizers'
                      if (activity.type === 'event_created' || activity.type === 'event_published') moduleHref = '/events'
                      if (activity.type === 'ticket_sold' || activity.type === 'payment_failed') moduleHref = '/orders'
                      if (activity.type === 'refund_requested') moduleHref = '/refunds'
                      if (activity.type === 'settlement_completed') moduleHref = '/settlements'
                      if (activity.type === 'support_ticket') moduleHref = '/support'

                      return (
                        <tr key={activity.id} className="hover:bg-muted/30 transition-colors group">
                          <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                            <Link href={moduleHref} className="block">{new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date(activity.timestamp))}</Link>
                          </td>
                          <td className="px-5 py-4">
                            <Link href={moduleHref} className="flex items-center gap-2">
                              {ACTIVITY_ICONS[activity.type]}
                              <span className="font-medium text-foreground group-hover:text-brand transition-colors">
                                {activity.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                            </Link>
                          </td>
                          <td className="px-5 py-4 text-foreground">
                            <Link href={moduleHref} className="block">{activity.details}</Link>
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">
                            <Link href={moduleHref} className="block">{activity.user}</Link>
                          </td>
                          <td className="px-5 py-4">
                            <Link href={moduleHref} className="block"><StatusBadge status={activity.status} /></Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Live Events */}
              <div className="border border-border rounded-xl bg-card flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <h3 className="font-semibold text-base">Live Events</h3>
                  <Link href="/events" className="text-sm font-medium text-brand hover:underline">
                    View All →
                  </Link>
                </div>
                <div className="p-5 space-y-4">
                  {isLoading && !data ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))
                  ) : (
                    data?.liveEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between gap-3 group">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={event.imageUrl} alt={event.title} className="w-10 h-10 rounded-lg object-cover bg-muted" />
                          <div>
                            <p className="text-sm font-semibold text-foreground group-hover:text-brand transition-colors cursor-pointer">
                              {event.title}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" /> {event.location}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Live</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(event.attendingCount)} attending
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border border-border rounded-xl bg-card p-5">
                <h3 className="font-semibold text-base mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Can module="organizers" action="edit">
                    <Link href="/organizers" className="flex items-center justify-center gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium text-sm">
                      <UserPlus className="w-4 h-4" /> Approve Organizer
                    </Link>
                  </Can>
                  <Can module="events" action="edit">
                    <Link href="/events" className="flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium text-sm">
                      <CalendarPlus className="w-4 h-4" /> Approve Event
                    </Link>
                  </Can>
                  <Can module="refunds" action="edit">
                    <Link href="/refunds" className="flex items-center justify-center gap-2 p-3 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors font-medium text-sm">
                      <Undo2 className="w-4 h-4" /> Issue Refund
                    </Link>
                  </Can>
                  <Can module="employees" action="create">
                    <Link href="/employees" className="flex items-center justify-center gap-2 p-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors font-medium text-sm">
                      <UserPlus className="w-4 h-4" /> Create Admin
                    </Link>
                  </Can>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}