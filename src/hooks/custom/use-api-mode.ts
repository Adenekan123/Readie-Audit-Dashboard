import { useSyncExternalStore } from 'react'

import { getApiMode, subscribeToApiMode } from '@/api/api-mode'

export function useApiMode() {
  return useSyncExternalStore(subscribeToApiMode, getApiMode, getApiMode)
}
