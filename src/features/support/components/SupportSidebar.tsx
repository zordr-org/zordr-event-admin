import * as React from 'react'
import { Button } from '@/components/ui/button'
import { TicketCategory } from '../types'

interface SupportSidebarProps {
  onCategoryFilter: (category: TicketCategory | '') => void
  currentCategory: TicketCategory | ''
}

const categories = [
  { value: 'tickets', label: 'Tickets' },
  { value: 'payments', label: 'Payments' },
  { value: 'refunds', label: 'Refunds' },
  { value: 'event_info', label: 'Event Info' },
  { value: 'orders', label: 'Orders' },
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'general', label: 'General' },
]

export function SupportSidebar({ onCategoryFilter, currentCategory }: SupportSidebarProps) {
  return (
    <div className="w-64 space-y-6 flex-shrink-0">
      
      {/* Actions */}
      <div className="space-y-2">
        <Button className="w-full justify-start" onClick={() => alert('Create Ticket Modal')}>
          + Create Ticket
        </Button>
        <Button className="w-full justify-start" variant="outline" onClick={() => window.open('/faqs', '_blank')}>
          View FAQs
        </Button>
        <div className="pt-2 text-sm text-muted-foreground flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          Live Chat: Online
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Categories</h4>
        <div className="space-y-1">
          <button
            className={`w-full text-left px-2 py-1.5 rounded-md text-sm ${currentCategory === '' ? 'bg-secondary' : 'hover:bg-secondary/50'}`}
            onClick={() => onCategoryFilter('')}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.value}
              className={`w-full text-left px-2 py-1.5 rounded-md text-sm ${currentCategory === c.value ? 'bg-secondary' : 'hover:bg-secondary/50'}`}
              onClick={() => onCategoryFilter(c.value as TicketCategory)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* SLA Panel */}
      <div className="rounded-md border bg-card p-4 space-y-4">
        <h4 className="font-medium text-sm">SLA Metrics</h4>
        <div className="space-y-3 text-sm">
          <div>
            <div className="text-muted-foreground flex justify-between">
              <span>First Response</span>
              <span>&lt; 6h</span>
            </div>
            <div className="font-medium text-green-600">98.2% on-time</div>
          </div>
          <div>
            <div className="text-muted-foreground flex justify-between">
              <span>Resolution Time</span>
              <span>&lt; 24h</span>
            </div>
            <div className="font-medium text-green-600">94.5% on-time</div>
          </div>
          <div>
            <div className="text-muted-foreground">Customer Satisfaction</div>
            <div className="font-medium flex items-center gap-1">
              <span>⭐</span> 4.7 / 5.0
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
