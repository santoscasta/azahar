import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProviderProps } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const isStorageAvailable = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false
    const testKey = '__azahar_test__'
    window.localStorage.setItem(testKey, '1')
    window.localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 60 * 48, // 48h
    },
  },
})

export const queryPersister = isStorageAvailable()
  ? createSyncStoragePersister({
      storage: window.localStorage,
    })
  : undefined

export const persistenceOptions: PersistQueryClientProviderProps['persistOptions'] | undefined = queryPersister
  ? {
      persister: queryPersister,
      maxAge: 1000 * 60 * 60 * 24, // 24h
      dehydrateOptions: {
        shouldDehydrateQuery: ({ queryKey }) => {
          const [key] = queryKey
          if (typeof key !== 'string') return false
          // Solo cacheamos queries de datos (no auth)
          return [
            'tasks',
            'projects',
            'areas',
            'labels',
            'headings',
            'checklist',
          ].some(prefix => key.startsWith(prefix))
        },
      },
    }
  : undefined
