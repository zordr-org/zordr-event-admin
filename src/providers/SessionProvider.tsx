'use client'

import { createContext, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMe } from '@/lib/api/client'
import { canDo } from '@/lib/permissions'
import type { AdminUser, Module, Action } from '@/types/auth'

interface SessionContextValue {
  user: AdminUser | null
  isLoading: boolean
  can: (module: Module, action: Action) => boolean
}

const SessionContext = createContext<SessionContextValue>({
  user: null,
  isLoading: true,
  can: () => false,
})

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const can = (module: Module, action: Action) => canDo(user ?? null, module, action)

  return (
    <SessionContext.Provider value={{ user: user ?? null, isLoading, can }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession(): SessionContextValue {
  return useContext(SessionContext)
}