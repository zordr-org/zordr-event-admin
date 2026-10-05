import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { RefundListItem } from '../types'
import { useReviewRefund } from '../hooks'
import { formatInr } from '@/lib/format'

interface RefundReviewModalProps {
  refund: RefundListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  readOnly?: boolean
}

export function RefundReviewModal({
  refund,
  open,
  onOpenChange,
  readOnly = false
}: RefundReviewModalProps) {
  const [notes, setNotes] = React.useState('')
  const { mutate: reviewRefund, isPending } = useReviewRefund()

  React.useEffect(() => {
    if (!open) setNotes('')
  }, [open])

  if (!refund) return null

  const handleDecision = (decision: 'approve' | 'reject') => {
    reviewRefund(
      { id: refund.id, data: { decision, notes } },
      {
        onSuccess: () => {
          onOpenChange(false)
        }
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{readOnly ? 'Refund Details' : 'Review Refund'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Refund ID:</span>
            <span className="font-medium">{refund.id}</span>
            
            <span className="text-muted-foreground">Order ID:</span>
            <span className="font-medium">{refund.orderId}</span>
            
            <span className="text-muted-foreground">Customer:</span>
            <span className="font-medium">{refund.customerName}</span>
            
            <span className="text-muted-foreground">Event:</span>
            <span className="font-medium">{refund.eventName}</span>
            
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium">{formatInr(refund.amount, true)}</span>
            
            <span className="text-muted-foreground">Reason:</span>
            <span className="font-medium">{refund.reason}</span>
            
            <span className="text-muted-foreground">Requested On:</span>
            <span className="font-medium">{new Date(refund.requestedOn).toLocaleDateString('en-IN')}</span>

            {refund.processedOn && (
              <>
                <span className="text-muted-foreground">Processed On:</span>
                <span className="font-medium">{new Date(refund.processedOn).toLocaleDateString('en-IN')}</span>
              </>
            )}

            {refund.settlementAdjustment && (
              <>
                <span className="text-muted-foreground">Adjustment:</span>
                <span className="font-medium">
                  {refund.settlementAdjustment === 'applied' 
                    ? 'Applied to Pending Settlement' 
                    : 'Deferred (Settlement already paid)'}
                </span>
              </>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t">
            <label htmlFor="notes" className="text-sm font-medium">Notes {readOnly ? '' : '(Optional)'}</label>
            {readOnly ? (
              <div className="p-3 bg-muted rounded-md text-muted-foreground min-h-[60px]">
                {refund.notes || 'No notes provided.'}
              </div>
            ) : (
              <textarea
                id="notes"
                placeholder="Add any internal notes about this decision..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isPending}
                className="w-full h-24 px-3 py-2 rounded-md border border-input bg-transparent text-sm resize-none"
              />
            )}
          </div>
        </div>

        {!readOnly && (
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => handleDecision('reject')}
              disabled={isPending}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
            >
              Reject
            </Button>
            <Button
              onClick={() => handleDecision('approve')}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Approve Refund
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
