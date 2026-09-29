'use client'

// NOTE: This component hides UI elements for UX purposes only.
// The backend enforces the real authorization check on every request.
// Never rely on client-side permission hiding as a security boundary.

import { useSession } from '@/providers/SessionProvider'
import type { Module, Action } from '@/types/auth'

interface CanProps {
  module: Module
  action: Action
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function Can({ module, action, children, fallback = null }: CanProps) {
  const { can } = useSession()
  return can(module, action) ? <>{children}</> : <>{fallback}</>
}