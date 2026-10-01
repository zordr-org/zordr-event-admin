'use client'

import * as React from 'react'
import { X, ExternalLink, CalendarDays, MapPin, Ticket, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { EventDetail } from '../types'

interface PreviewModalProps {
  open: boolean
  onClose: () => void
  event: EventDetail | null
  isLoading?: boolean
}

export function PreviewModal({ open, onClose, event, isLoading }: PreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-left">Customer Preview</DialogTitle>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium shrink-0">
              Admin Preview — Not Live
            </span>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-40 bg-muted rounded-xl" />
            <div className="h-6 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-20 bg-muted rounded" />
          </div>
        ) : event ? (
          <div className="space-y-5 pt-2">
            {/* Banner */}
            <div className="rounded-xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 aspect-video flex items-center justify-center">
              {event.bannerImages?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={event.bannerImages[0]} alt={event.title} className="w-full h-full object-cover" />
              ) : (
                <p className="text-white/40 text-sm">No banner</p>
              )}
            </div>

            {/* Title */}
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-blue-100 text-blue-700">{event.category}</span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-muted text-muted-foreground">{event.venueType}</span>
              </div>
              <h2 className="text-xl font-bold">{event.title}</h2>
              <p className="text-muted-foreground text-sm mt-0.5">by {event.organizerName}</p>
            </div>

            {/* Key info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="w-4 h-4 shrink-0" />
                <span>{new Date(event.dateFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              {event.venueName && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{event.venueName}, {event.city}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h4 className="font-semibold text-sm mb-2">About</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
            </div>

            {/* Tickets */}
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                <Ticket className="w-4 h-4" /> Tickets
              </h4>
              <div className="space-y-2">
                {event.ticketTypes.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                    </div>
                    <span className="font-bold">{t.price === 0 ? 'Free' : `₹${t.price.toLocaleString()}`}</span>
                  </div>
                ))}
              </div>
            </div>

            {event.refundPolicy && (
              <div>
                <h4 className="font-semibold text-sm mb-1">Refund Policy</h4>
                <p className="text-xs text-muted-foreground">{event.refundPolicy}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">Failed to load preview.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
