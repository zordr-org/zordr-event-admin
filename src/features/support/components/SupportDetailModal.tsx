import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { SupportTicketListItem } from '../types'
import { useSupportThread, useReplyTicket } from '../hooks'
import { Can } from '@/components/shell/Can'

interface SupportDetailModalProps {
  ticket: SupportTicketListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SupportDetailModal({
  ticket,
  open,
  onOpenChange
}: SupportDetailModalProps) {
  const [message, setMessage] = React.useState('')
  const [status, setStatus] = React.useState<'open' | 'pending' | 'resolved' | ''>('')
  
  const { data: threadData, isLoading } = useSupportThread(open && ticket ? ticket.id : undefined)
  const { mutate: replyTicket, isPending } = useReplyTicket()

  React.useEffect(() => {
    if (!open) {
      setMessage('')
      setStatus('')
    } else if (ticket) {
      setStatus(ticket.status)
    }
  }, [open, ticket])

  if (!ticket) return null

  const handleReply = () => {
    if (!message && status === ticket.status) return
    
    replyTicket(
      { id: ticket.id, data: { message, status: status as any } },
      {
        onSuccess: () => {
          setMessage('')
        }
      }
    )
  }

  const handleQuickResolve = () => {
    replyTicket(
      { id: ticket.id, data: { status: 'resolved' } },
      {
        onSuccess: () => {
          onOpenChange(false)
        }
      }
    )
  }

  const thread = threadData?.data?.messages || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Ticket: {ticket.subject}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-2 pr-2 space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm bg-muted p-3 rounded-md">
            <span className="text-muted-foreground">ID:</span>
            <span className="font-medium">{ticket.id}</span>
            
            <span className="text-muted-foreground">Status:</span>
            <span className="font-medium capitalize">{ticket.status}</span>
            
            <span className="text-muted-foreground">Priority:</span>
            <span className="font-medium capitalize">{ticket.priority}</span>
            
            <span className="text-muted-foreground">Requester:</span>
            <span className="font-medium">
              {ticket.requesterName} ({ticket.requesterType})
            </span>
            
            <span className="text-muted-foreground">Category:</span>
            <span className="font-medium capitalize">{ticket.category.replace('_', ' ')}</span>
            
            {ticket.eventName && (
              <>
                <span className="text-muted-foreground">Event:</span>
                <span className="font-medium">{ticket.eventName}</span>
              </>
            )}
          </div>

          <div className="space-y-3" aria-live="polite">
            {isLoading ? (
              <div className="text-sm text-muted-foreground text-center py-4">Loading thread...</div>
            ) : (
              thread.map(msg => (
                <div 
                  key={msg.id} 
                  className={`p-3 rounded-md text-sm ${msg.authorType === 'admin' ? 'bg-[var(--brand-light)] border border-[var(--brand-green)] ml-8' : 'bg-muted mr-8'}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold">{msg.authorName} ({msg.authorType})</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <Can module="support" action="edit">
          <div className="pt-4 border-t space-y-3 shrink-0">
            <textarea
              placeholder="Type your reply here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isPending}
              className="w-full h-24 px-3 py-2 rounded-md border border-input bg-transparent text-sm resize-none"
            />
            
            <div className="flex justify-between items-center">
              <select
                className="h-10 px-3 rounded-md border border-input bg-transparent text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                disabled={isPending}
              >
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
              
              <div className="space-x-2">
                {ticket.status !== 'resolved' && (
                  <Button
                    variant="outline"
                    onClick={handleQuickResolve}
                    disabled={isPending}
                    className="text-muted-foreground"
                    title="Quick Resolve"
                  >
                    Resolve
                  </Button>
                )}
                <Button
                  onClick={handleReply}
                  disabled={isPending || (!message && status === ticket.status)}
                >
                  {isPending ? 'Sending...' : 'Update & Reply'}
                </Button>
              </div>
            </div>
          </div>
        </Can>
      </DialogContent>
    </Dialog>
  )
}
