'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useSettings, useUpdateSettings } from '../hooks'
import { settingsSchema, type SettingsFormData } from '../schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageHeader } from '@/components/shell/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Can } from '@/components/shell/Can'
import { Skeleton } from '@/components/ui/skeleton'

export function SettingsForm() {
  const { data, isLoading } = useSettings()
  const updateMutation = useUpdateSettings()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      platformFeePercent: 0,
      convenienceFeePercent: 0,
      maxGatewayFeePercent: 0,
      supportEmail: '',
      logoUrl: '',
    },
  })

  useEffect(() => {
    if (data?.data) {
      reset({
        platformFeePercent: data.data.platformFeePercent,
        convenienceFeePercent: data.data.convenienceFeePercent,
        maxGatewayFeePercent: data.data.maxGatewayFeePercent,
        supportEmail: data.data.supportEmail,
        logoUrl: data.data.logoUrl || '',
      })
    }
  }, [data, reset])

  const onSubmit = async (formData: SettingsFormData) => {
    try {
      await updateMutation.mutateAsync(formData)
      reset(formData)
    } catch (error) {
      // toast in hook
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Platform Settings" description="Loading..." />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full max-w-2xl" />
          <Skeleton className="h-24 w-full max-w-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Settings"
        description="Configure fees, branding, and platform-wide defaults."
      />

      <Can module="settings" action="view">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
          
          <div className="rounded-md border bg-card p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium">Fee Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Set platform and convenience fees applied across the platform.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platformFeePercent">Platform Fee (%)</Label>
                <div className="relative">
                  <Input
                    id="platformFeePercent"
                    type="number"
                    step="0.01"
                    {...register('platformFeePercent', { valueAsNumber: true })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                {errors.platformFeePercent && <p className="text-sm text-destructive">{errors.platformFeePercent.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="convenienceFeePercent">Convenience Fee (%)</Label>
                <div className="relative">
                  <Input
                    id="convenienceFeePercent"
                    type="number"
                    step="0.01"
                    {...register('convenienceFeePercent', { valueAsNumber: true })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                {errors.convenienceFeePercent && <p className="text-sm text-destructive">{errors.convenienceFeePercent.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxGatewayFeePercent">Max Gateway Fee (%)</Label>
                <div className="relative">
                  <Input
                    id="maxGatewayFeePercent"
                    type="number"
                    step="0.01"
                    {...register('maxGatewayFeePercent', { valueAsNumber: true })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                {errors.maxGatewayFeePercent && <p className="text-sm text-destructive">{errors.maxGatewayFeePercent.message}</p>}
              </div>
            </div>
          </div>

          <div className="rounded-md border bg-card p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium">Branding & Contact</h3>
              <p className="text-sm text-muted-foreground">
                Organization branding and support contact information.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  {...register('supportEmail')}
                />
                {errors.supportEmail && <p className="text-sm text-destructive">{errors.supportEmail.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">Organization Logo URL</Label>
                <Input
                  id="logoUrl"
                  placeholder="https://..."
                  {...register('logoUrl')}
                />
                <p className="text-xs text-muted-foreground">Backend pre-signed uploads for admin are pending. Use an external URL for now.</p>
                {errors.logoUrl && <p className="text-sm text-destructive">{errors.logoUrl.message}</p>}
              </div>
            </div>
          </div>

          <Can module="settings" action="edit">
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => reset()} disabled={!isDirty || isSubmitting}>
                Discard
              </Button>
              <Button type="submit" disabled={!isDirty || isSubmitting || updateMutation.isPending}>
                {isSubmitting ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </Can>
        </form>
      </Can>
    </div>
  )
}
