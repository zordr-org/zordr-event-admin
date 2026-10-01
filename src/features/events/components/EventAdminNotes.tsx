'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const adminNotesSchema = z.object({
  notes: z.string().max(2000, 'Notes too long'),
})
type AdminNotesForm = z.infer<typeof adminNotesSchema>

interface EventAdminNotesProps {
  value: string
  onSave: (notes: string) => void
  isSaving?: boolean
  isReadOnly?: boolean
}

export function EventAdminNotes({ value, onSave, isSaving, isReadOnly }: EventAdminNotesProps) {
  const { register, handleSubmit, formState: { isDirty } } = useForm<AdminNotesForm>({
    resolver: zodResolver(adminNotesSchema),
    defaultValues: { notes: value },
  })

  const onSubmit = (data: AdminNotesForm) => onSave(data.notes)

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <h3 className="font-semibold text-sm flex items-center gap-2">
        <StickyNote className="w-4 h-4 text-muted-foreground" /> Admin Notes
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <textarea
          {...register('notes')}
          disabled={isReadOnly || isSaving}
          placeholder="Internal notes about this review — not visible to the organizer..."
          rows={4}
          className={cn(
            'w-full text-sm rounded-md border border-input bg-transparent px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 resize-none',
          )}
        />
        {!isReadOnly && (
          <Button
            type="submit"
            size="sm"
            variant="outline"
            disabled={!isDirty || isSaving}
            className="w-full"
          >
            {isSaving ? 'Saving...' : 'Save Notes'}
          </Button>
        )}
      </form>
    </div>
  )
}
