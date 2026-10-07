'use client'

import { useEffect, useState } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'

export function SettingsForm() {
  const { data, isLoading } = useSettings()
  const updateMutation = useUpdateSettings()
  const [deleteInput, setDeleteInput] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      platformFeePercent: 0,
      convenienceFeePercent: 0,
      maxGatewayFeePercent: 0,
      supportEmail: '',
      logoUrl: '',
      orgName: '',
      orgContactPhone: '',
      orgAddress: '',
      orgWebsite: '',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
      currency: 'INR (₹)',
      language: 'en',
      itemsPerPage: 15,
      notifyOnNewOrganizer: false,
      notifyOnEventSubmitted: false,
      notifyOnRefundRequest: false,
      notifyOnPaymentFailure: false,
      notifyOnSettlementDue: false,
      notifyByEmail: false,
      notifySms: false,
      maintenanceMode: false,
      systemVersion: '',
      environment: 'production',
      sessionTimeoutMinutes: 60,
      passwordRotationDays: 90,
      auditLogRetentionDays: 365,
      mfaRequired: false,
      razorpayEnabled: false,
      razorpayKeyId: '',
      sesEnabled: false,
      sentryEnabled: false,
    },
  })

  useEffect(() => {
    if (data?.data) {
      reset({
        ...data.data,
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

  const handleCheckboxChange = (field: keyof SettingsFormData) => (checked: boolean) => {
    setValue(field, checked, { shouldDirty: true })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Platform Settings" description="Loading..." />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Settings"
        description="Configure fees, branding, notifications, and platform-wide defaults."
      />

      <Can module="settings" action="view">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid grid-cols-7 w-full max-w-4xl h-auto flex-wrap">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="users">Users & Access</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="platform">Platform</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
            </TabsList>
            
            {/* 1. GENERAL TAB */}
            <TabsContent value="general" className="space-y-6 max-w-3xl pt-4">
              <div className="rounded-md border bg-card p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Organization Profile</h3>
                  <p className="text-sm text-muted-foreground">Basic info about the platform organization.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input id="orgName" {...register('orgName')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input id="supportEmail" type="email" {...register('supportEmail')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Number</Label>
                    <Input {...register('orgContactPhone')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input {...register('orgWebsite')} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Registered Address</Label>
                    <Input {...register('orgAddress')} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Logo URL</Label>
                    <Input {...register('logoUrl')} placeholder="https://..." />
                  </div>
                </div>
              </div>

              <div className="rounded-md border bg-card p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Preferences</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Input {...register('timezone')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Input {...register('dateFormat')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Input {...register('currency')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Items Per Page</Label>
                    <Input type="number" {...register('itemsPerPage', { valueAsNumber: true })} />
                  </div>
                </div>
              </div>

              {data?.platformInfo && (
                <div className="rounded-md border bg-card p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Platform Information</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Plan:</strong> {data.platformInfo.plan}</div>
                    <div><strong>Member Since:</strong> {new Date(data.platformInfo.memberSince).toLocaleDateString()}</div>
                    <div><strong>Events Created:</strong> {data.platformInfo.totalEventsCreated}</div>
                    <div><strong>Registered Users:</strong> {data.platformInfo.totalRegisteredUsers}</div>
                    <div><strong>Storage:</strong> {data.platformInfo.storageUsedGB} GB / {data.platformInfo.storageMaxGB} GB</div>
                  </div>
                </div>
              )}

              {data?.activityLog && (
                <div className="rounded-md border bg-card p-6 space-y-4">
                  <h3 className="text-lg font-medium">Recent Activity</h3>
                  <div className="space-y-3">
                    {data.activityLog.map((log: any) => (
                      <div key={log.id} className="text-sm flex justify-between border-b pb-2">
                        <span><strong>{log.admin}</strong>: {log.action}</span>
                        <span className="text-muted-foreground">{new Date(log.at).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Can module="settings" action="delete">
                <div className="rounded-md border border-destructive bg-destructive/10 p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
                    <p className="text-sm">Permanently delete this organization and all associated data.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-destructive">Type "DELETE ORGANIZATION" to confirm</Label>
                    <Input 
                      value={deleteInput}
                      onChange={(e) => setDeleteInput(e.target.value)}
                      className="border-destructive" 
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="destructive" 
                    disabled={deleteInput !== 'DELETE ORGANIZATION'}
                  >
                    Delete Organization
                  </Button>
                </div>
              </Can>
            </TabsContent>

            {/* 2. USERS & ACCESS TAB */}
            <TabsContent value="users" className="space-y-6 max-w-3xl pt-4">
              <div className="rounded-md border bg-card p-6 space-y-4">
                <h3 className="text-lg font-medium">Users & Access Policies</h3>
                <p className="text-sm text-muted-foreground">Manage employees and their role-based access control.</p>
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => window.location.href = '/dashboard/employees'}>
                    Go to Staff Directory
                  </Button>
                  <Button type="button" variant="outline" onClick={() => window.location.href = '/dashboard/roles'}>
                    Manage Roles
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* 3. NOTIFICATIONS TAB */}
            <TabsContent value="notifications" className="space-y-6 max-w-3xl pt-4">
              <div className="rounded-md border bg-card p-6 space-y-6">
                <h3 className="text-lg font-medium">Operational Alerts</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="notifyOnNewOrganizer" checked={watch('notifyOnNewOrganizer')} onCheckedChange={handleCheckboxChange('notifyOnNewOrganizer')} />
                    <Label htmlFor="notifyOnNewOrganizer">Notify on New Organizer KYC Submit</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="notifyOnEventSubmitted" checked={watch('notifyOnEventSubmitted')} onCheckedChange={handleCheckboxChange('notifyOnEventSubmitted')} />
                    <Label htmlFor="notifyOnEventSubmitted">Notify on New Event Submitted</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="notifyOnRefundRequest" checked={watch('notifyOnRefundRequest')} onCheckedChange={handleCheckboxChange('notifyOnRefundRequest')} />
                    <Label htmlFor="notifyOnRefundRequest">Notify on Refund Requests</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="notifyOnPaymentFailure" checked={watch('notifyOnPaymentFailure')} onCheckedChange={handleCheckboxChange('notifyOnPaymentFailure')} />
                    <Label htmlFor="notifyOnPaymentFailure">Notify on High Payment Failure Rate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="notifyOnSettlementDue" checked={watch('notifyOnSettlementDue')} onCheckedChange={handleCheckboxChange('notifyOnSettlementDue')} />
                    <Label htmlFor="notifyOnSettlementDue">Notify on Settlements Due</Label>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <h4 className="font-medium text-sm">Delivery Methods</h4>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="notifyByEmail" checked={watch('notifyByEmail')} onCheckedChange={handleCheckboxChange('notifyByEmail')} />
                    <Label htmlFor="notifyByEmail">Email Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="notifySms" checked={watch('notifySms')} onCheckedChange={handleCheckboxChange('notifySms')} />
                    <Label htmlFor="notifySms">SMS Notifications</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 4. PAYMENTS TAB */}
            <TabsContent value="payments" className="space-y-6 max-w-3xl pt-4">
              <div className="rounded-md border bg-card p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Fee Schedule</h3>
                  <p className="text-sm text-muted-foreground">Global defaults for platform and convenience fees.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Platform Fee (%)</Label>
                    <Input type="number" step="0.01" {...register('platformFeePercent', { valueAsNumber: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Convenience Fee (%)</Label>
                    <Input type="number" step="0.01" {...register('convenienceFeePercent', { valueAsNumber: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Gateway Fee (%)</Label>
                    <Input type="number" step="0.01" {...register('maxGatewayFeePercent', { valueAsNumber: true })} />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 5. PLATFORM TAB */}
            <TabsContent value="platform" className="space-y-6 max-w-3xl pt-4">
              <div className="rounded-md border bg-card p-6 space-y-6">
                <h3 className="text-lg font-medium">System State</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between border p-4 rounded-md">
                    <div>
                      <p className="font-medium">Maintenance Mode</p>
                      <p className="text-sm text-muted-foreground">Temporarily disable public access</p>
                    </div>
                    <Checkbox checked={watch('maintenanceMode')} onCheckedChange={handleCheckboxChange('maintenanceMode')} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Environment</Label>
                      <Input {...register('environment')} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>System Version</Label>
                      <Input {...register('systemVersion')} disabled />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 6. SECURITY TAB */}
            <TabsContent value="security" className="space-y-6 max-w-3xl pt-4">
              <div className="rounded-md border bg-card p-6 space-y-6">
                <h3 className="text-lg font-medium">Security Policies</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Session Timeout (Minutes)</Label>
                    <Input type="number" {...register('sessionTimeoutMinutes', { valueAsNumber: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Password Rotation (Days)</Label>
                    <Input type="number" {...register('passwordRotationDays', { valueAsNumber: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Audit Log Retention (Days)</Label>
                    <Input type="number" {...register('auditLogRetentionDays', { valueAsNumber: true })} />
                  </div>
                </div>

                <div className="flex items-center justify-between border p-4 rounded-md">
                  <div>
                    <p className="font-medium">Require MFA</p>
                    <p className="text-sm text-muted-foreground">Force all admin users to use 2FA</p>
                  </div>
                  <Checkbox checked={watch('mfaRequired')} onCheckedChange={handleCheckboxChange('mfaRequired')} />
                </div>
              </div>
            </TabsContent>

            {/* 7. INTEGRATIONS TAB */}
            <TabsContent value="integrations" className="space-y-6 max-w-3xl pt-4">
              <div className="rounded-md border bg-card p-6 space-y-6">
                <h3 className="text-lg font-medium">External Services</h3>
                
                <div className="space-y-4">
                  <div className="border p-4 rounded-md space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">RazorpayX</p>
                        <p className="text-sm text-muted-foreground">Payment gateway integration</p>
                      </div>
                      <Checkbox checked={watch('razorpayEnabled')} onCheckedChange={handleCheckboxChange('razorpayEnabled')} />
                    </div>
                    {watch('razorpayEnabled') && (
                      <div className="space-y-2">
                        <Label>Razorpay Key ID</Label>
                        <Input {...register('razorpayKeyId')} type="password" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border p-4 rounded-md">
                    <div>
                      <p className="font-medium">AWS SES / SendGrid</p>
                      <p className="text-sm text-muted-foreground">Email delivery service</p>
                    </div>
                    <Checkbox checked={watch('sesEnabled')} onCheckedChange={handleCheckboxChange('sesEnabled')} />
                  </div>

                  <div className="flex items-center justify-between border p-4 rounded-md">
                    <div>
                      <p className="font-medium">Sentry</p>
                      <p className="text-sm text-muted-foreground">Error tracking</p>
                    </div>
                    <Checkbox checked={watch('sentryEnabled')} onCheckedChange={handleCheckboxChange('sentryEnabled')} />
                  </div>
                </div>
              </div>
            </TabsContent>

          </Tabs>

          <Can module="settings" action="edit">
            <div className="flex justify-end gap-2 max-w-3xl">
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
