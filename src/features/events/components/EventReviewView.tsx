'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, CheckCircle2, Send, XCircle, Eye, AlertTriangle, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shell/StatusBadge'
import { EmptyState } from '@/components/shell/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Can } from '@/components/shell/Can'
import { useEventReview, useApproveEvent, useSendBack, useRejectEvent } from '../hooks'
import { isChecklistComplete, getBlockingItems, getReviewActions } from '../lib/status'
import { EventContentPanel } from './EventContentPanel'
import { ReviewChecklistPanel } from './ReviewChecklistPanel'
import { EventAdminNotes } from './EventAdminNotes'
import { PreviewModal } from './PreviewModal'
import { getEventsApi } from '../api'
import type { EventDetail } from '../types'

interface EventReviewViewProps {
  id: string
}

function statusDisplayLabel(status: string): string {
  const map: Record<string, string> = {
    pending_review: 'Pending Review',
    sent_back: 'Sent Back',
    draft: 'Draft',
    submitted: 'Submitted',
    published: 'Published',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    completed: 'Completed',
  }
  return map[status] ?? status
}

export function EventReviewView({ id }: EventReviewViewProps) {
  const router = useRouter()
  const { data, isLoading, isError, refetch } = useEventReview(id)

  const approve = useApproveEvent(id)
  const sendBack = useSendBack(id)
  const reject = useRejectEvent(id)

  const [sendBackOpen, setSendBackOpen] = React.useState(false)
  const [rejectOpen, setRejectOpen] = React.useState(false)
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [previewEvent, setPreviewEvent] = React.useState<EventDetail | null>(null)
  const [previewLoading, setPreviewLoading] = React.useState(false)
  const [adminNotesSaving, setAdminNotesSaving] = React.useState(false)

  // ── Loading / Error states ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !data?.data.review) {
    return (
      <div className="p-8 space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <EmptyState
          title="Event not found"
          description="The event you are looking for does not exist or failed to load."
          action={{ label: 'Retry', onClick: () => refetch() }}
        />
      </div>
    )
  }

  const { event, checklist, adminNotes, reviewHistory } = data.data.review
  const availableActions = getReviewActions(event.status)
  const isReviewable = availableActions.length > 0
  const canApprove = isChecklistComplete(checklist)
  const blockingItems = getBlockingItems(checklist)

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleApprove = () => {
    if (!canApprove) return
    approve.mutate(undefined, { onSuccess: () => router.push('/events') })
  }

  const handlePreview = async () => {
    setPreviewLoading(true)
    setPreviewOpen(true)
    try {
      const detail = await getEventsApi().getPreview(id)
      setPreviewEvent(detail)
    } catch {
      setPreviewEvent(null)
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleSaveNotes = async (notes: string) => {
    setAdminNotesSaving(true)
    // In mock mode there's no dedicated endpoint yet — we optimistically update
    // The real PUT would go to /api/v1/admin/events/{id}/review with { adminNotes }
    await new Promise((r) => setTimeout(r, 400))
    setAdminNotesSaving(false)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-6 lg:px-8 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="sm" onClick={() => router.push('/events')} className="shrink-0">
              <ArrowLeft className="w-4 h-4 mr-1" /> Events
            </Button>
            <div className="w-px h-5 bg-border" />
            <div className="min-w-0">
              <h1 className="text-base font-semibold truncate max-w-[300px] lg:max-w-[500px]">
                {event.title}
              </h1>
              <p className="text-xs text-muted-foreground">{event.organizerName}</p>
            </div>
            <StatusBadge status={statusDisplayLabel(event.status)} />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              className="gap-1.5"
            >
              <Eye className="w-4 h-4" /> Preview
            </Button>

            <Can module="events" action="edit">
              {isReviewable && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-orange-600 border-orange-200 hover:bg-orange-50"
                    onClick={() => setSendBackOpen(true)}
                  >
                    <Send className="w-4 h-4" /> Send Back
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setRejectOpen(true)}
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </Button>

                  {/* Approve — gated on checklist completion */}
                  <div className="relative group">
                    <Button
                      size="sm"
                      className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white disabled:pointer-events-none"
                      onClick={handleApprove}
                      disabled={!canApprove || approve.isPending}
                      aria-disabled={!canApprove}
                      id="btn-approve"
                    >
                      {approve.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Approve & Publish
                    </Button>
                    {/* Tooltip when blocked */}
                    {!canApprove && (
                      <div className="absolute right-0 top-full mt-2 w-64 rounded-lg bg-popover border border-border shadow-lg p-3 text-xs z-50 hidden group-hover:block pointer-events-none">
                        <p className="font-medium text-foreground mb-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Approval blocked
                        </p>
                        <p className="text-muted-foreground mb-1.5">Mark all items as Looks Good first:</p>
                        <ul className="space-y-0.5">
                          {blockingItems.map((label) => (
                            <li key={label} className="flex items-center gap-1 text-muted-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              {label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              )}
            </Can>
          </div>
        </div>

        {/* Approve error banner */}
        {approve.isError && (
          <div className="px-6 lg:px-8 pb-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {approve.error?.message ?? 'Failed to approve event.'}
            </div>
          </div>
        )}
      </div>

      {/* Two-column body */}
      <div className="px-6 lg:px-8 py-6 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Left — event content */}
        <EventContentPanel event={event} reviewHistory={reviewHistory} />

        {/* Right — sticky review panel */}
        <div className="xl:sticky xl:top-[72px] space-y-4">
          <ReviewChecklistPanel
            checklist={checklist}
            eventId={id}
            isReadOnly={!isReviewable}
          />

          <EventAdminNotes
            value={adminNotes}
            onSave={handleSaveNotes}
            isSaving={adminNotesSaving}
            isReadOnly={!isReviewable}
          />

          {/* Mobile action buttons (replicate for small screens) */}
          <Can module="events" action="edit">
            {isReviewable && (
              <div className="xl:hidden space-y-2">
                <Button
                  className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleApprove}
                  disabled={!canApprove || approve.isPending}
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve & Publish
                </Button>
                {!canApprove && blockingItems.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
                    <p className="font-medium mb-1">Blocking items:</p>
                    <ul className="space-y-0.5">
                      {blockingItems.map((l) => <li key={l}>· {l}</li>)}
                    </ul>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                  onClick={() => setSendBackOpen(true)}
                >
                  <Send className="w-4 h-4" /> Send Back to Organizer
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setRejectOpen(true)}
                >
                  <XCircle className="w-4 h-4" /> Reject Event
                </Button>
              </div>
            )}
          </Can>
        </div>
      </div>

      {/* ── Dialogs ─────────────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={sendBackOpen}
        onOpenChange={setSendBackOpen}
        title="Send Back to Organizer"
        description="The event will be returned to the organizer with your notes. They can revise and resubmit — a new review cycle will begin and the current cycle will be preserved in the history."
        warningText="The event will be removed from the pending queue. Any published tickets will remain active until fully rejected."
        confirmText="Send Back"
        cancelText="Cancel"
        requireReason
        isLoading={sendBack.isPending}
        apiError={sendBack.error?.message}
        onConfirm={(notes) =>
          sendBack.mutate(
            { notes: notes! },
            { onSuccess: () => { setSendBackOpen(false); router.push('/events') } }
          )
        }
      />

      <ConfirmDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Reject Event"
        description="This event will be permanently rejected. The organizer will be notified with your reason. This action is terminal and cannot be undone."
        warningText="Rejecting is irreversible. The organizer will not be able to resubmit this event."
        confirmText="Reject Event"
        isDestructive
        requireReason
        isLoading={reject.isPending}
        apiError={reject.error?.message}
        onConfirm={(reason) =>
          reject.mutate(
            { reason: reason! },
            { onSuccess: () => { setRejectOpen(false); router.push('/events') } }
          )
        }
      />

      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        event={previewEvent}
        isLoading={previewLoading}
      />
    </div>
  )
}
