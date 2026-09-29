'use client'

import * as React from 'react'
import { Calendar, Users, MapPin, Globe, Mail, Phone, User, CheckCircle2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StatusBadge } from '@/components/shell/StatusBadge'
import { KpiStrip } from '@/components/shared/KpiStrip'
import type { OrganizerDetail } from '../types'

export function OrganizerOverviewTab({ organizer: org }: { organizer: OrganizerDetail }) {
  const kpiItems = [
    {
      id: 'events',
      label: 'Total Events',
      value: org.activeEvents,
      icon: <Calendar className="w-5 h-5 text-indigo-600" />,
      sub: `${org.activeEvents} upcoming`
    },
    {
      id: 'registrations',
      label: 'Total Registrations',
      value: '1,248', // Mock data as per design
      icon: <Users className="w-5 h-5 text-blue-600" />,
      sub: 'across all events'
    },
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: `₹${org.totalRevenue.toLocaleString()}`,
      icon: <span className="font-serif text-lg text-emerald-600">₹</span>,
      sub: 'lifetime'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Top Banner / Identity */}
      <div className="rounded-xl border bg-card p-6 flex flex-col md:flex-row gap-6">
        <div className="flex-1 flex gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={org.avatarUrl} />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary uppercase">
              {org.orgName.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{org.orgName}</h2>
              {org.kycStatus === 'verified' && (
                <StatusBadge status="Verified" className="bg-emerald-100 text-emerald-700" />
              )}
            </div>
            {org.handle && <p className="text-muted-foreground">{org.handle}</p>}
            <p className="text-sm text-muted-foreground max-w-md mt-2 leading-relaxed">
              Official cultural club of {org.orgName}, organizing flagship events, fests and cultural activities.
            </p>
            <div className="flex gap-2 mt-3">
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">College Club</span>
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">{org.city || 'KITSW'}</span>
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Student Organization</span>
            </div>
          </div>
        </div>

        <div className="w-px bg-border hidden md:block" />

        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Primary Contact</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{org.contact.name}</span>
                <span className="text-muted-foreground">({org.contact.role})</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{org.contact.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{org.contact.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-px bg-border hidden md:block" />

        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Organization Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="leading-snug">{org.address}</span>
              </div>
              {org.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <a href={org.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">{org.website}</a>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Joined on {new Date(org.joinedOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <KpiStrip items={kpiItems} className="md:grid-cols-3 lg:grid-cols-4" />
    </div>
  )
}
