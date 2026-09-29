import { useSession } from '@/providers/SessionProvider'
import type { Module, Action } from '@/types/auth'

/** Returns whether the current user can perform `action` on `module`. */
export function usePermission(module: Module, action: Action): boolean {
  const { can } = useSession()
  return can(module, action)
}