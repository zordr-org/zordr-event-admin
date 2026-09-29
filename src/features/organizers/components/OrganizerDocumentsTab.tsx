'use client'

import * as React from 'react'
import { FileText, Eye, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StatusBadge } from '@/components/shell/StatusBadge'
import { EmptyState } from '@/components/shell/EmptyState'
import type { OrganizerDocument } from '../types'

const DOC_TITLES: Record<string, string> = {
  pan: 'PAN Card',
  gst: 'GST Certificate',
  registration: 'Registration Document',
  other: 'Other Document'
}

export function OrganizerDocumentsTab({ documents }: { documents: OrganizerDocument[] }) {
  const [previewDoc, setPreviewDoc] = React.useState<OrganizerDocument | null>(null)

  if (!documents || documents.length === 0) {
    return <EmptyState title="No documents" description="This organizer has not uploaded any KYC documents." />
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <div key={doc.id} className="rounded-xl border bg-card overflow-hidden shadow-sm flex flex-col">
            <div className="p-5 border-b bg-muted/30 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium leading-none">{DOC_TITLES[doc.docType] || doc.docType}</h4>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-5 flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                {doc.status === 'verified' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {doc.status === 'pending_review' && <Clock className="w-4 h-4 text-amber-600" />}
                {doc.status === 'rejected' && <AlertCircle className="w-4 h-4 text-red-600" />}
                <span className="text-sm font-medium capitalize">
                  {doc.status.replace('_', ' ')}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setPreviewDoc(doc)}>
                <Eye className="w-4 h-4 mr-2" /> Preview
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!previewDoc} onOpenChange={(val) => !val && setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{previewDoc ? DOC_TITLES[previewDoc.docType] : 'Document Preview'}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 bg-muted/30 rounded-md border flex items-center justify-center overflow-hidden">
            {previewDoc ? (
              previewDoc.fileUrl.endsWith('.pdf') ? (
                <iframe src={previewDoc.fileUrl} className="w-full h-full" title="PDF Preview" />
              ) : (
                /* eslint-disable @next/next/no-img-element */
                <img 
                  src={previewDoc.fileUrl} 
                  alt="Document Preview" 
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    // Fallback for mocked URLs that might 404
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              )
            ) : null}
            <div className="hidden text-muted-foreground flex flex-col items-center">
              <FileText className="w-12 h-12 mb-2 opacity-20" />
              <p>Preview not available</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
