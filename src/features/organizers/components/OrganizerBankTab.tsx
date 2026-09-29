'use client'

import * as React from 'react'
import { Landmark, ShieldCheck, ShieldAlert, EyeOff, Building, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shell/StatusBadge'
import { EmptyState } from '@/components/shell/EmptyState'
import type { OrganizerDetail } from '../types'

export function OrganizerBankTab({ organizer }: { organizer: OrganizerDetail }) {
  const { payoutAccount, gstNumber, panNumber } = organizer

  if (!payoutAccount && !gstNumber && !panNumber) {
    return <EmptyState title="No financial details" description="This organizer has not provided bank or tax details." />
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Bank Account Details */}
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <div className="p-5 border-b bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium leading-none text-base">Bank Account</h4>
                <p className="text-xs text-muted-foreground mt-1.5">Primary payout method</p>
              </div>
            </div>
            {payoutAccount && (
              <StatusBadge 
                status={payoutAccount.verificationStatus} 
                className={payoutAccount.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-700' : ''} 
              />
            )}
          </div>
          
          <div className="p-6 space-y-4">
            {payoutAccount ? (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account Holder</label>
                  <p className="font-medium mt-1 text-base">{payoutAccount.accountHolder}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account Number</label>
                  <div className="flex items-center justify-between mt-1">
                    <p className="font-mono text-lg font-medium tracking-tight">
                      {payoutAccount.maskedAccountNumber}
                    </p>
                    <Button variant="outline" size="sm" disabled title="Reveal endpoint not yet implemented by backend">
                      <EyeOff className="w-4 h-4 mr-2" /> Reveal
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bank Name</label>
                    <p className="font-medium mt-1">{payoutAccount.bankName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">IFSC Code</label>
                    <p className="font-medium mt-1">{payoutAccount.ifsc}</p>
                  </div>
                </div>

                {payoutAccount.verificationStatus === 'verified' && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t text-sm text-emerald-600 bg-emerald-50/50 p-3 rounded-md">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Penny drop verification successful</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Bank account details not submitted.</p>
            )}
          </div>
        </div>

        {/* Tax Information */}
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm h-fit">
          <div className="p-5 border-b bg-muted/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-medium leading-none text-base">Tax Information</h4>
              <p className="text-xs text-muted-foreground mt-1.5">GST & PAN details</p>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">GST Number</label>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-mono font-medium text-base">{gstNumber || 'Not provided'}</p>
                {gstNumber && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">PAN Number</label>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-mono font-medium text-base">{panNumber || 'Not provided'}</p>
                {panNumber && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
