'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, ShieldAlert, AlertCircle, WifiOff } from 'lucide-react'
import { loginSchema, type LoginFormValues } from '../schemas'
import { postLogin, ZordrApiError } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MfaStep } from './MfaStep'
import { cn } from '@/lib/utils'

type ApiErrorState =
  | { kind: 'invalid_credentials' }
  | { kind: 'locked'; retryAfter?: number }
  | { kind: 'network' }
  | { kind: 'server' }
  | null

function useCountdown(initial: number) {
  const [seconds, setSeconds] = useState(initial)
  const start = useCallback(() => {
    setSeconds(initial)
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) { clearInterval(id); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [initial])
  return { seconds, start }
}

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState<ApiErrorState>(null)
  const [mfaChallengeId, setMfaChallengeId] = useState<string | null>(null)
  const [retrySeconds, setRetrySeconds] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  })

  // Countdown timer for locked state
  const startCountdown = useCallback((seconds: number) => {
    setRetrySeconds(seconds)
    const id = setInterval(() => {
      setRetrySeconds((s) => {
        if (s <= 1) { clearInterval(id); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const { mutate, isPending } = useMutation({
    mutationFn: (data: LoginFormValues) => postLogin(data),
    onSuccess: (res) => {
      setApiError(null)
      if (res.mfaRequired) {
        setMfaChallengeId(res.challengeId)
      } else {
        router.replace('/dashboard')
      }
    },
    onError: (err: unknown) => {
      if (!(err instanceof ZordrApiError)) {
        setApiError({ kind: 'network' })
        return
      }
      if (err.status === 0) {
        setApiError({ kind: 'network' })
      } else if (err.status === 401) {
        setApiError({ kind: 'invalid_credentials' })
      } else if (err.status === 423 || err.status === 429) {
        setApiError({ kind: 'locked', retryAfter: err.retryAfter })
        if (err.retryAfter) startCountdown(err.retryAfter)
      } else {
        setApiError({ kind: 'server' })
      }
    },
  })

  const isLocked = apiError?.kind === 'locked'

  const onSubmit = (data: LoginFormValues) => {
    if (isPending || isLocked) return
    setApiError(null)
    mutate(data)
  }

  if (mfaChallengeId) {
    return <MfaStep challengeId={mfaChallengeId} onBack={() => setMfaChallengeId(null)} />
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Admin login form"
    >
      {/* ── API error banners ─────────────────────────────────────── */}
      {apiError && (
        <div
          role="alert"
          aria-live="assertive"
          className={cn(
            'mb-5 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm animate-fade-in',
            apiError.kind === 'locked'
              ? 'border-amber-300 bg-amber-50 text-amber-800'
              : 'border-destructive/30 bg-destructive/5 text-destructive',
          )}
        >
          {apiError.kind === 'locked' ? (
            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          ) : apiError.kind === 'network' ? (
            <WifiOff className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          )}
          <div className="flex-1">
            {apiError.kind === 'invalid_credentials' && (
              <p>Invalid email or password. Please try again.</p>
            )}
            {apiError.kind === 'locked' && (
              <>
                <p className="font-semibold">Account temporarily locked</p>
                <p className="mt-0.5">
                  Too many failed attempts.
                  {retrySeconds > 0
                    ? ` Please wait ${retrySeconds}s before trying again.`
                    : ' Please try again.'}
                </p>
              </>
            )}
            {apiError.kind === 'network' && (
              <p>
                Unable to reach the server.{' '}
                <button
                  type="button"
                  onClick={() => setApiError(null)}
                  className="underline hover:no-underline font-medium"
                >
                  Retry
                </button>
              </p>
            )}
            {apiError.kind === 'server' && (
              <p>
                Something went wrong on our end.{' '}
                <button
                  type="button"
                  onClick={() => setApiError(null)}
                  className="underline hover:no-underline font-medium"
                >
                  Try again
                </button>
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Email field ───────────────────────────────────────────── */}
      <div className="space-y-1.5 mb-4">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="admin@zordr.in"
            disabled={isPending || isLocked}
            className={cn(
              'pl-9',
              errors.email && 'border-destructive focus-visible:ring-destructive',
            )}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p id="email-error" role="alert" className="text-xs text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* ── Password field ────────────────────────────────────────── */}
      <div className="space-y-1.5 mb-1">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            disabled={isPending || isLocked}
            className={cn(
              'pl-9 pr-10',
              errors.password && 'border-destructive focus-visible:ring-destructive',
            )}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Eye className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" role="alert" className="text-xs text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* ── Forgot password ───────────────────────────────────────── */}
      <div className="flex justify-end mb-6 mt-1">
        <a
          href="/forgot-password"
          className="text-sm text-brand hover:text-brand-hover transition-colors font-medium"
        >
          Forgot password?
        </a>
      </div>

      {/* ── Submit ───────────────────────────────────────────────── */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isPending || isLocked}
        aria-busy={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Signing in…
          </>
        ) : (
          <>
            Login
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </>
        )}
      </Button>

      {/* ── Divider ──────────────────────────────────────────────── */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">OR</span>
        </div>
      </div>

      {/* ── Security notice ───────────────────────────────────────── */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
        <ShieldAlert className="w-5 h-5 text-muted-foreground shrink-0" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-foreground">Authorized personnel only.</p>
          <p className="text-xs text-muted-foreground">All access is monitored and logged.</p>
        </div>
      </div>
    </form>
  )
}
