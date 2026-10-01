'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { addNoteSchema } from '../schemas'
import type { AddNoteFormValues, OrganizerNote } from '../types'
import { useAddNote } from '../hooks'
import { Can } from '@/components/shell/Can'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export function OrganizerNotes({ organizerId, notes }: { organizerId: string, notes: OrganizerNote[] }) {
  const { mutate, isPending } = useAddNote(organizerId)
  
  const form = useForm<AddNoteFormValues>({
    resolver: zodResolver(addNoteSchema),
    defaultValues: { note: '' }
  })

  const onSubmit = (data: AddNoteFormValues) => {
    mutate(data, {
      onSuccess: () => {
        form.reset()
      }
    })
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-6 flex flex-col h-full max-h-[800px]">
      <div>
        <h3 className="font-semibold leading-none tracking-tight">Quick Notes</h3>
        <p className="text-sm text-muted-foreground mt-1.5">Internal notes about this organizer.</p>
      </div>

      <Can module="Organizers" action="edit">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 shrink-0">
          <div>
            <textarea
              {...form.register('note')}
              className={cn(
                "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                form.formState.errors.note && "border-destructive focus-visible:ring-destructive"
              )}
              placeholder="Add a note about this organizer..."
              disabled={isPending}
            />
            {form.formState.errors.note && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.note.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200" disabled={isPending}>
            {isPending ? 'Adding...' : 'Add Note'}
          </Button>
        </form>
      </Can>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        <h4 className="font-semibold text-sm">Recent Notes</h4>
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No notes yet.</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="flex gap-3 items-start">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs uppercase">
                  {note.authorName.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">{note.authorName}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(note.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-snug whitespace-pre-wrap">{note.note}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
