'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, MoreHorizontal, Mail, Ban, XCircle, Edit, KeySquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusBadge } from '@/components/shell/StatusBadge'
import { EmptyState } from '@/components/shell/EmptyState'
import { useOrganizer, useOrganizerActions } from '../hooks'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { getAvailableActions } from '../lib/status'
import { Can } from '@/components/shell/Can'

import { OrganizerOverviewTab } from './OrganizerOverviewTab'
import { OrganizerDocumentsTab } from './OrganizerDocumentsTab'
import { OrganizerBankTab } from './OrganizerBankTab'
import { OrganizerEventsList } from './OrganizerEventsList'
import { OrganizerNotes } from './OrganizerNotes'

// We will stub the others to just show EmptyState for now, or just basic UI,
// but the prompt says: Events, Revenue, Settlements, Support Tickets: read-only lists
// Since we don't have endpoints for events scoped to organizer in Admin yet,
// wait, `GET /api/v1/admin/events` has `?organizerId=`
// Let's check the API contract. Yes, `GET /api/v1/admin/events` takes `organizerId`.
// But for now, we can just render the tabs.

export function OrganizerDetailView({ id }: { id: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'

  const { data, isLoading, isError, refetch } = useOrganizer(id)
  const { approve, reject, suspend } = useOrganizerActions()

  const [rejectOpen, setRejectOpen] = React.useState(false)
  const [suspendOpen, setSuspendOpen] = React.useState(false)

  if (isLoading) {
    return <div className="p-8 animate-pulse space-y-4">
      <div className="h-8 bg-muted rounded w-1/4"></div>
      <div className="h-64 bg-muted rounded w-full"></div>
    </div>
  }

  if (isError || !data?.data.organizer) {
    return (
      <div className="p-8 space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Organizers
        </Button>
        <EmptyState 
          title="Organizer not found"
          description="The organizer you are looking for does not exist or failed to load."
          action={{ label: 'Retry', onClick: () => refetch() }}
        />
      </div>
    )
  }

  const org = data.data.organizer
  const availableActions = getAvailableActions(org.status)

  const handleTabChange = (val: string) => {
    router.push(`/organizers/${id}?tab=${val}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Button variant="link" className="p-0 h-auto mb-2 text-muted-foreground" onClick={() => router.push('/organizers')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Organizers
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Organizer Details</h1>
          </div>
          <p className="text-muted-foreground mt-1">View organizer information, documents, events, revenue and more.</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={org.status} />
          {org.joinedOn && (
            <span className="text-sm text-muted-foreground">
              Active since {new Date(org.joinedOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
          
          <Can module="organizers" action="edit">
            <Button variant="outline" disabled title="Reset Password endpoint not yet implemented">
              Reset Password
            </Button>
            
            {availableActions.includes('suspend') && (
              <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => setSuspendOpen(true)}>
                Suspend
              </Button>
            )}
            
            {/* The ellipsis menu in header */}
            <Button variant="outline" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </Can>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger value="overview" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3">Overview</TabsTrigger>
              <TabsTrigger value="documents" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3">Documents</TabsTrigger>
              <TabsTrigger value="bank" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3">Bank & GST</TabsTrigger>
              <TabsTrigger value="events" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3">Events</TabsTrigger>
              <TabsTrigger value="revenue" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3">Revenue</TabsTrigger>
              <TabsTrigger value="settlements" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3">Settlements</TabsTrigger>
              <TabsTrigger value="support" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3">Support Tickets</TabsTrigger>
              <TabsTrigger value="notes" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3 xl:hidden">Notes</TabsTrigger>
            </TabsList>

            <div className="pt-6">
              <TabsContent value="overview" className="mt-0 outline-none">
                <OrganizerOverviewTab organizer={org} />
              </TabsContent>
              <TabsContent value="documents" className="mt-0 outline-none">
                <OrganizerDocumentsTab documents={org.documents} />
              </TabsContent>
              <TabsContent value="bank" className="mt-0 outline-none">
                <OrganizerBankTab organizer={org} />
              </TabsContent>
              <TabsContent value="events" className="mt-0 outline-none">
                <OrganizerEventsList organizerId={id} />
              </TabsContent>
              
              {/* Stub for others */}
              <TabsContent value="revenue" className="mt-0 outline-none">
                <EmptyState title="Revenue" description="Revenue metrics coming soon." />
              </TabsContent>
              <TabsContent value="settlements" className="mt-0 outline-none">
                <EmptyState title="Settlements" description="Settlements table coming soon." />
              </TabsContent>
              <TabsContent value="support" className="mt-0 outline-none">
                <EmptyState title="Support Tickets" description="Support tickets table coming soon." />
              </TabsContent>
              <TabsContent value="notes" className="mt-0 outline-none xl:hidden">
                <OrganizerNotes organizerId={id} notes={org.notes} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Right sidebar for Actions and Notes */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
            <h3 className="font-semibold leading-none tracking-tight">Actions</h3>
            
            <Can module="organizers" action="edit">
              <Button className="w-full justify-start" disabled title="Update Organizer endpoint not yet implemented">
                <Edit className="w-4 h-4 mr-2" /> Update Organizer
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Mail className="w-4 h-4 mr-2" /> Send Message
              </Button>

              {availableActions.includes('suspend') && (
                <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => setSuspendOpen(true)}>
                  <Ban className="w-4 h-4 mr-2" /> Suspend Organizer
                </Button>
              )}

              {availableActions.includes('reject') && (
                <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => setRejectOpen(true)}>
                  <XCircle className="w-4 h-4 mr-2" /> Reject Organizer
                </Button>
              )}
            </Can>
          </div>

          <div className="hidden xl:block">
            <OrganizerNotes organizerId={id} notes={org.notes} />
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        title="Suspend Organizer"
        description="Are you sure you want to suspend this organizer?"
        warningText="This hides the organizer's events from customers and holds their pending settlements."
        confirmText="Suspend"
        isDestructive
        requireReason
        isLoading={suspend.isPending}
        apiError={suspend.error?.message}
        onConfirm={(reason) => suspend.mutate({ id, data: { reason: reason! } }, {
          onSuccess: () => setSuspendOpen(false)
        })}
      />

      <ConfirmDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Reject Organizer"
        description="Are you sure you want to reject this organizer's KYC application?"
        warningText="This hides the organizer's events from customers and holds their pending settlements."
        confirmText="Reject"
        isDestructive
        requireReason
        isLoading={reject.isPending}
        apiError={reject.error?.message}
        onConfirm={(reason) => reject.mutate({ id, data: { reason: reason! } }, {
          onSuccess: () => setRejectOpen(false)
        })}
      />
    </div>
  )
}
