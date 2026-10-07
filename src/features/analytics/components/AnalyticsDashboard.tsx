'use client'

import * as React from 'react'
import { KpiCard } from '@/components/shell/KpiCard'
import { FilterBar } from '@/components/shared/FilterBar'
import { AreaTrend } from '@/components/charts/AreaTrend'
import { DualLineTrend } from '@/components/charts/DualLineTrend'
import { DonutBreakdown } from '@/components/charts/DonutBreakdown'
import { LeaderboardTable } from './LeaderboardTable'
import { useUrlState } from '@/hooks/useUrlState'
import { Button } from '@/components/ui/button'
import { Download, RefreshCw } from 'lucide-react'
import { formatInr, formatNumber } from '@/lib/format'
import { Can } from '@/components/shell/Can'
import {
  useAnalyticsOverview,
  useAnalyticsTrends,
  useAnalyticsBreakdowns,
  useAnalyticsLeaderboards,
  useDownloadReport
} from '../hooks'

export function AnalyticsDashboard() {
  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  const { state: params, setUrlState: setParams } = useUrlState({
    dateFrom: thirtyDaysAgo,
    dateTo: today,
    granularity: 'daily' as 'daily' | 'weekly',
  })

  // Overview
  const { data: overviewRes, isLoading: overviewLoading, isError: overviewError, refetch: refetchOverview } = useAnalyticsOverview(params as any)
  const overview = overviewRes?.data

  // Trends
  const { data: gmvTrend, isLoading: gmvLoading, isError: gmvError, refetch: refetchGmv } = useAnalyticsTrends('gmv', params as any)
  const { data: ordersTrend, isLoading: ordersLoading, isError: ordersError, refetch: refetchOrders } = useAnalyticsTrends('orders_customers', params as any)
  const { data: usersTrend, isLoading: usersLoading, isError: usersError, refetch: refetchUsers } = useAnalyticsTrends('user_growth', params as any)

  // Breakdowns
  const { data: paymentBdown, isLoading: paymentLoading, isError: paymentError, refetch: refetchPayment } = useAnalyticsBreakdowns('payment_method', params as any)
  const { data: orderBdown, isLoading: orderLoading, isError: orderError, refetch: refetchOrder } = useAnalyticsBreakdowns('order_status', params as any)
  const { data: settlementBdown, isLoading: settlementLoading, isError: settlementError, refetch: refetchSettlement } = useAnalyticsBreakdowns('settlement_status', params as any)

  // Leaderboards
  const { data: topEvents, isLoading: eventsLoading, isError: eventsError, refetch: refetchEvents } = useAnalyticsLeaderboards('top_events', params as any)
  const { data: topOrgs, isLoading: orgsLoading, isError: orgsError, refetch: refetchOrgs } = useAnalyticsLeaderboards('top_organizers', params as any)
  const { data: topCities, isLoading: citiesLoading, isError: citiesError, refetch: refetchCities } = useAnalyticsLeaderboards('customers_by_city', params as any)

  const { mutate: downloadReport, isPending: isDownloading } = useDownloadReport()

  const handleDownload = (format: 'csv' | 'pdf') => {
    downloadReport({ ...params, format } as any, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics_report.${format}`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
      },
      onError: () => {
        alert('Failed to download report')
      }
    })
  }

  const handlePreset = (days: number) => {
    const end = new Date().toISOString().split('T')[0]
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    setParams({ dateFrom: start, dateTo: end })
  }

  const renderError = (refetch: () => void) => (
    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground border rounded-lg bg-muted/20">
      <p className="mb-4">Failed to load data</p>
      <Button variant="outline" size="sm" onClick={() => refetch()}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Retry
      </Button>
    </div>
  )

  const renderChartContainer = (title: string, content: React.ReactNode, loading: boolean) => (
    <div className="bg-card border rounded-lg p-6 flex flex-col shadow-sm">
      <h3 className="text-lg font-semibold mb-6">{title}</h3>
      {loading ? (
        <div className="flex-1 flex items-center justify-center bg-muted/20 rounded-md animate-pulse h-[300px]" />
      ) : (
        content
      )}
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Date Controls & Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-4 rounded-lg border">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handlePreset(7)}>7d</Button>
          <Button variant="outline" size="sm" onClick={() => handlePreset(30)}>30d</Button>
          <Button variant="outline" size="sm" onClick={() => handlePreset(90)}>90d</Button>
          <span className="text-muted-foreground px-2">|</span>
          <input 
            type="date" 
            className="h-9 px-3 rounded-md border text-sm"
            value={params.dateFrom}
            onChange={e => {
              if (e.target.value <= params.dateTo!) setParams({ dateFrom: e.target.value })
            }}
          />
          <span className="text-muted-foreground">to</span>
          <input 
            type="date" 
            className="h-9 px-3 rounded-md border text-sm"
            value={params.dateTo}
            onChange={e => {
              if (e.target.value >= params.dateFrom!) setParams({ dateTo: e.target.value })
            }}
          />
          <select
            className="h-9 px-3 rounded-md border text-sm ml-2"
            value={params.granularity}
            onChange={e => setParams({ granularity: e.target.value as 'daily'|'weekly' })}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
        
        <Can module="analytics" action="export">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleDownload('csv')} disabled={isDownloading}>
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDownload('pdf')} disabled={isDownloading}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </Can>
      </div>

      {/* Narrative Insight Callout */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 p-2 rounded-full mt-1 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-blue-900">Performance Insight</h3>
            <p className="text-blue-800 text-sm">
              Event registrations grew by <strong>14.8%</strong> over the selected period, driven by Music & Tech festivals in Bengaluru and Mumbai.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20">
              High Refund Rate (Cancellations)
            </span>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      {overviewError ? renderError(refetchOverview) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard label="Total GMV" value={overviewLoading ? '...' : formatInr((overview?.totalGmv || 0) / 100, true)} />
          <KpiCard label="Orders" value={overviewLoading ? '...' : formatNumber(overview?.totalOrders || 0, true)} />
          <KpiCard label="Tickets Sold" value={overviewLoading ? '...' : formatNumber(overview?.ticketsSold || 0, true)} />
          <KpiCard label="Active Events" value={overviewLoading ? '...' : formatNumber(overview?.activeEvents || 0, true)} />
          <KpiCard label="Unique Customers" value={overviewLoading ? '...' : formatNumber(overview?.uniqueCustomers || 0, true)} />
          <KpiCard label="Conversion Rate" value={overviewLoading ? '...' : `${overview?.conversionRate || 0}%`} />
        </div>
      )}

      {/* Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderChartContainer(
          'Gross Merchandise Value (GMV)',
          gmvError ? renderError(refetchGmv) : <AreaTrend data={gmvTrend?.data.map(d => ({ ...d, value: d.value / 100 })) || []} valuePrefix="currency" />,
          gmvLoading
        )}
        {renderChartContainer(
          'Orders vs Unique Customers',
          ordersError ? renderError(refetchOrders) : <DualLineTrend data={ordersTrend?.data || []} primaryName="Orders" secondaryName="Customers" />,
          ordersLoading
        )}
        {renderChartContainer(
          'User Growth (New Registrations)',
          usersError ? renderError(refetchUsers) : <AreaTrend data={usersTrend?.data || []} color="hsl(213, 58%, 11%)" />,
          usersLoading
        )}
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderChartContainer(
          'Payment Methods',
          paymentError ? renderError(refetchPayment) : <DonutBreakdown data={paymentBdown?.data.map(d => ({ ...d, value: d.value / 100 })) || []} valuePrefix="currency" />,
          paymentLoading
        )}
        {renderChartContainer(
          'Order Status',
          orderError ? renderError(refetchOrder) : <DonutBreakdown data={orderBdown?.data || []} valuePrefix="number" />,
          orderLoading
        )}
        {renderChartContainer(
          'Settlement Status',
          settlementError ? renderError(refetchSettlement) : <DonutBreakdown data={settlementBdown?.data.map(d => ({ ...d, value: d.value / 100 })) || []} valuePrefix="currency" />,
          settlementLoading
        )}
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderChartContainer(
          'Top Events by Revenue',
          eventsError ? renderError(refetchEvents) : <LeaderboardTable data={topEvents?.data.map(d => ({ ...d, metric: d.metric / 100 })) || []} valuePrefix="currency" />,
          eventsLoading
        )}
        {renderChartContainer(
          'Top Organizers by GMV',
          orgsError ? renderError(refetchOrgs) : <LeaderboardTable data={topOrgs?.data.map(d => ({ ...d, metric: d.metric / 100 })) || []} valuePrefix="currency" />,
          orgsLoading
        )}
        {renderChartContainer(
          'Customers by City',
          citiesError ? renderError(refetchCities) : <LeaderboardTable data={topCities?.data || []} valuePrefix="number" />,
          citiesLoading
        )}
      </div>
    </div>
  )
}
