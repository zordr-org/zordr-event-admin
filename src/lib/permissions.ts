import type { AdminUser, Module, Action } from '@/types/auth'

/**
 * Pure helper — unit-testable without React context.
 * The UI hides elements based on this; the backend enforces the real authorization.
 */
export function canDo(user: AdminUser | null, module: Module, action: Action): boolean {
  if (!user) return false
  return user.permissions[module]?.[action] ?? false
}