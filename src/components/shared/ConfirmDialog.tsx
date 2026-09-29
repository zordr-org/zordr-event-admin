'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'

// Assuming a standard textarea component exists, or use plain textarea styled
// I will use a simple textarea for now if ui/textarea is missing.
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: React.ReactNode
  warningText?: string
  confirmText?: string
  cancelText?: string
  onConfirm: (reason?: string) => void
  isLoading?: boolean
  requireReason?: boolean
  isDestructive?: boolean
  apiError?: string | null
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  warningText,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  isLoading,
  requireReason,
  isDestructive,
  apiError,
}: ConfirmDialogProps) {
  const [reason, setReason] = React.useState('')
  const [touched, setTouched] = React.useState(false)

  // Reset reason when dialog opens
  React.useEffect(() => {
    if (open) {
      setReason('')
      setTouched(false)
    }
  }, [open])

  const isValid = !requireReason || reason.trim().length >= 10
  const showError = requireReason && touched && !isValid

  const handleConfirm = () => {
    setTouched(true)
    if (isValid) {
      onConfirm(reason)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!isLoading) onOpenChange(val)
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4 pt-2">
              <p>{description}</p>
              
              {warningText && (
                <div className="flex items-start gap-2 text-amber-700 bg-amber-50 p-3 rounded-md text-sm border border-amber-200">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{warningText}</p>
                </div>
              )}

              {requireReason && (
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason (required)</Label>
                  <textarea
                    id="reason"
                    className={cn(
                      "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                      showError && "border-destructive focus-visible:ring-destructive"
                    )}
                    placeholder="Provide a reason (min 10 chars)..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    onBlur={() => setTouched(true)}
                    disabled={isLoading}
                  />
                  {showError && (
                    <p className="text-sm text-destructive">Reason must be at least 10 characters.</p>
                  )}
                </div>
              )}

              {apiError && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {apiError}
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button 
            variant={isDestructive ? 'destructive' : 'default'} 
            onClick={handleConfirm}
            disabled={isLoading || (requireReason && reason.trim().length < 10)}
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
