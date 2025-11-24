import { useEffect, useState } from 'react'
import { onlineManager } from '@tanstack/react-query'

export function useConnectivity() {
  const [online, setOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true)

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true)
      onlineManager.setOnline(true)
    }
    const handleOffline = () => {
      setOnline(false)
      onlineManager.setOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return online
}
