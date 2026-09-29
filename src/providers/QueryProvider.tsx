'use client'

import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query'
import { useState } from 'react'
import { ZordrApiError } from '@/lib/api/client'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => {
    const qc = new QueryClient({
      queryCache: new QueryCache({
        onError: (error) => {
          // Central 401 handler: clear cache and redirect to login.
          // Handles session expiry from any query, including GET /admin/auth/me.
          if (error instanceof ZordrApiError && error.status === 401) {
            qc.clear()
            if (typeof window !== 'undefined') {
              const from = encodeURIComponent(window.location.pathname)
              window.location.href = `/login?from=${from}`
            }
          }
        },
      }),
      defaultOptions: {
        queries: { retry: 1, staleTime: 30_000 },
        mutations: { retry: 0 },
      },
    })
    return qc
  })

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}