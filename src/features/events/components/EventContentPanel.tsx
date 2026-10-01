'use client'

import * as React from 'react'
import {
  CalendarDays, MapPin, Ticket, Users, FileText, ShieldCheck, Globe, Phone, Mail,
  ImageIcon, Tag
} from 'lucide-react'
import type { EventDetail } from '../types'
import { ReviewHistoryTimeline } from './ReviewHistoryTimeline'
import type { ReviewCycle } from '../types'

const CHECKLIST_SECTION_MAP: Record<string, string[]> = {
  'banner_images': ['banner_images'],
  'details_description': ['details_description'],
  'datetime_venue': ['datetime_venue'],
  'ticket_pricing': ['ticket_pricing'],
  'organizer_info': ['organizer_info'],
  'policies_terms': ['policies_terms'],
  'content_guidelines': ['content_guidelines'],
}

interface EventContentPanelProps {
  event: EventDetail
  reviewHistory: ReviewCycle[]
}

export function EventContentPanel({ event, reviewHistory }: EventContentPanelProps) {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div
        id="section-banner_images"
        className="rounded-xl overflow-hidden border bg-gradient-to-br from-slate-800 to-slate-900 aspect-[16/5] flex items-center justify-center relative"
      >
        {event.bannerImages?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.bannerImages[0]} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-3 text-white/50">
            <ImageIcon className="w-12 h-12" />
            <span className="text-sm font-medium">No banner uploaded</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur text-white text-xs font-medium">
              {event.category}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur text-white text-xs font-medium">
              {event.venueType}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white leading-tight">{event.title}</h2>
          <p className="text-white/70 text-sm mt-1">{event.organizerName}</p>
        </div>
      </div>

      {/* Details & Description */}
      <div id="section-details_description" className="rounded-xl border bg-card p-6 space-y-4">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" /> Event Details
        </h3>
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent text-xs font-medium text-muted-foreground">
                <Tag className="w-3 h-3" /> {tag}
              </span>
            ))}
          </div>
        )}
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{event.description}</p>
      </div>

      {/* Date, Time & Venue */}
      <div id="section-datetime_venue" className="rounded-xl border bg-card p-6 space-y-4">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-muted-foreground" /> Date, Time & Venue
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Start</p>
            <p className="font-medium">
              {new Date(event.dateFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="text-muted-foreground">
              {new Date(event.dateFrom).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">End</p>
            <p className="font-medium">
              {new Date(event.dateTo).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="text-muted-foreground">
              {new Date(event.dateTo).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {event.venueType !== 'online' && (
          <div className="flex items-start gap-3 pt-2 border-t border-border">
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              {event.venueName && <p className="font-medium text-sm">{event.venueName}</p>}
              {event.venueAddress && <p className="text-sm text-muted-foreground">{event.venueAddress}</p>}
            </div>
          </div>
        )}

        {/* Static Map Placeholder */}
        {event.venueType !== 'online' && (
          <div className="rounded-lg bg-muted/50 border border-dashed border-border h-40 flex items-center justify-center">
            <div className="text-center space-y-1">
              <MapPin className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs text-muted-foreground">Map preview — {event.city}</p>
              {event.venueLatLng && (
                <p className="text-[10px] text-muted-foreground/60">
                  {event.venueLatLng.lat.toFixed(4)}, {event.venueLatLng.lng.toFixed(4)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ticket Types & Pricing */}
      <div id="section-ticket_pricing" className="rounded-xl border bg-card p-6 space-y-4">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <Ticket className="w-4 h-4 text-muted-foreground" /> Ticket Types & Pricing
        </h3>
        <div className="space-y-3">
          {event.ticketTypes.map((ticket) => (
            <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
              <div>
                <p className="font-medium text-sm">{ticket.name}</p>
                {ticket.description && <p className="text-xs text-muted-foreground mt-0.5">{ticket.description}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  {ticket.sold} / {ticket.quantity} sold
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-base">₹{ticket.price.toLocaleString('en-IN')}</p>
                {ticket.price === 0 && <p className="text-xs text-emerald-600">Free</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Organizer Info */}
      <div id="section-organizer_info" className="rounded-xl border bg-card p-6 space-y-4">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" /> Organizer Info
        </h3>
        <div className="text-sm space-y-2">
          <div className="flex items-center gap-2 font-medium">{event.organizerName}</div>
          {event.contactEmail && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-3.5 h-3.5 shrink-0" /> {event.contactEmail}
            </div>
          )}
          {event.contactPhone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-3.5 h-3.5 shrink-0" /> {event.contactPhone}
            </div>
          )}
        </div>
      </div>

      {/* Policies & Terms */}
      <div id="section-policies_terms" className="rounded-xl border bg-card p-6 space-y-4">
        <h3 className="font-semibold text-base flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-muted-foreground" /> Policies & Terms
        </h3>
        <div className="space-y-4 text-sm">
          {event.refundPolicy && (
            <div>
              <p className="font-medium mb-1">Refund Policy</p>
              <p className="text-muted-foreground leading-relaxed">{event.refundPolicy}</p>
            </div>
          )}
          {event.termsAndConditions && (
            <div className="border-t pt-3">
              <p className="font-medium mb-1">Terms & Conditions</p>
              <p className="text-muted-foreground leading-relaxed">{event.termsAndConditions}</p>
            </div>
          )}
          {event.ageRestriction && (
            <div className="border-t pt-3">
              <p className="font-medium mb-1">Age Restriction</p>
              <p className="text-muted-foreground">{event.ageRestriction}</p>
            </div>
          )}
        </div>
      </div>

      {/* Review History */}
      {reviewHistory.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-semibold text-base mb-4">Review History</h3>
          <ReviewHistoryTimeline cycles={reviewHistory} />
        </div>
      )}
    </div>
  )
}
