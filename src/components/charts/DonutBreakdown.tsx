'use client'

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { formatNumber, formatInr } from '@/lib/format'

interface DonutBreakdownProps {
  data: { label: string; value: number; percentage: number }[]
  height?: number
  valuePrefix?: 'currency' | 'number'
}

const COLORS = [
  'hsl(145, 73%, 44%)', // Brand green
  'hsl(213, 58%, 11%)', // Dark navy
  'hsl(220, 9%, 46%)',  // Muted foreground
  'hsl(145, 60%, 80%)', // Lighter green
  'hsl(213, 30%, 50%)', // Lighter navy
]

export function DonutBreakdown({ data, height = 300, valuePrefix = 'number' }: DonutBreakdownProps) {
  const formatValue = (val: number) => {
    return valuePrefix === 'currency' ? formatInr(val, true) : formatNumber(val, true)
  }

  const renderLegend = (props: any) => {
    const { payload } = props
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
        {payload.map((entry: any, index: number) => {
          const item = data.find(d => d.label === entry.value)
          return (
            <li key={`item-${index}`} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.value}</span>
              <span className="font-medium">{item ? formatValue(item.value) : ''} ({item?.percentage.toFixed(1)}%)</span>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            nameKey="label"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: any, name: any) => [formatValue(Number(value)), String(name)]}
            labelStyle={{ display: 'none' }}
          />
          <Legend content={renderLegend} verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
