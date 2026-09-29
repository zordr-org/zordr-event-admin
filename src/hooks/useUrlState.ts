import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

export function useUrlState<T extends Record<string, string | number | undefined>>(
  defaultState: T
) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const state = useMemo(() => {
    const s = { ...defaultState } as Record<string, any>
    for (const key of Object.keys(defaultState)) {
      const val = searchParams.get(key)
      if (val !== null) {
        if (typeof defaultState[key] === 'number') {
          s[key] = Number(val)
        } else {
          s[key] = val
        }
      }
    }
    return s as T
  }, [searchParams, defaultState])

  const setUrlState = useCallback(
    (newState: Partial<T>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(newState)) {
        if (value === undefined || value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, String(value))
        }
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const clearState = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    for (const key of Object.keys(defaultState)) {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }, [pathname, router, searchParams, defaultState])

  return { state, setUrlState, clearState }
}
