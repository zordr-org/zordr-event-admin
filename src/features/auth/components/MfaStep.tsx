'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Loader2, ArrowLeft } from 'lucide-react'
import { mfaSchema, type MfaFormValues } from '../schemas'
import { postMfaVerify, ZordrApiError } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface MfaStepProps {
  challengeId: string
  onBack: () => void
}

export function MfaStep({ challengeId, onBack }: MfaStepProps) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<MfaFormValues>({
    resolver: zodResolver(mfaSchema),
    mode: 'onBlur',
  })

  const { mutate, isPending, isError, error, status } = useMutation({
    mutationFn: (data: MfaFormValues) =>
      postMfaVerify({ challengeId, code: data.code }),
    onSuccess: () => {
      router.replace('/dashboard')
    },
    onError: (err: unknown) => {
      if (err instanceof ZordrApiError && err.status === 401) {
        setError('code', { message: 'Invalid verification code. Try again.' })
      }
    },
  })

  const apiError =
    isError && error instanceof ZordrApiError && error.status !== 401 ? error : null

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-brand" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Two-Factor Verification</h2>
          <p className="text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app</p>
        </div>
      </div>

      {apiError && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-5 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3"
        >
          <p className="text-sm text-destructive">
            {apiError.status === 0
              ? 'Unable to reach the server. Check your connection.'
              : 'Something went wrong. Please try again.'}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit((d) => mutate(d))} noValidate>
        <div className="space-y-1.5 mb-6">
          <Label htmlFor="mfa-code">Verification Code</Label>
          <Input
            id="mfa-code"
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            autoComplete="one-time-code"
            placeholder="000000"
            className={cn(
              'text-center tracking-[0.4em] text-lg font-semibold',
              errors.code && 'border-destructive focus-visible:ring-destructive',
            )}
            aria-invalid={!!errors.code}
            aria-describedby={errors.code ? 'mfa-code-error' : undefined}
            {...register('code')}
          />
          {errors.code && (
            <p id="mfa-code-error" className="text-xs text-destructive mt-1" role="alert">
              {errors.code.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Verifying…
            </>
          ) : (
            'Verify & Continue'
          )}
        </Button>
      </form>

      <button
        onClick={onBack}
        className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
        type="button"
      >
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
        Back to login
      </button>
    </div>
  )
}
