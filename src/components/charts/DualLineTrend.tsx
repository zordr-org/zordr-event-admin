'use client'

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { formatNumber } from '@/lib/format'

interface DualLineTrendProps {
  data: { date: string; value: number; secondaryValue?: number }[]
  primaryColor?: string
  secondaryColor?: string
  primaryName?: string
  secondaryName?: string
  height?: number
}

export function DualLineTrend({ 
  data, 
  primaryColor = 'hsl(var(--brand))', 
  secondaryColor = '#8B5CF6', // A nice purple matching the design
  primaryName = 'Primary',
  secondaryName = 'Secondary',
  height = 300 
}: DualLineTrendProps) {
  const formattedData = data.map(d => ({
    ...d,
    displayDate: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(d.date))
  }))

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer>
        <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="displayDate" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
            dy={10}
            minTickGap={20}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(val) => formatNumber(val, true)}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: any, name: any) => [formatNumber(Number(value)), name]}
            labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
          />
          <Legend 
            verticalAlign="top" 
            align="left"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px', fontSize: '13px' }}
          />
          <Line 
            name={primaryName}
            type="monotone" 
            dataKey="value" 
            stroke={primaryColor} 
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 0, fill: primaryColor }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          {data[0]?.secondaryValue !== undefined && (
            <Line 
              name={secondaryName}
              type="monotone" 
              dataKey="secondaryValue" 
              stroke={secondaryColor} 
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 0, fill: secondaryColor }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
