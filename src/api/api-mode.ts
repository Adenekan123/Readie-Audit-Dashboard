export type ApiMode = 'live' | 'local'

const STORAGE_KEY = 'readie-audit-api-mode'
const subscribers = new Set<() => void>()

function readStoredMode(): ApiMode {
  if (typeof window === 'undefined') return 'live'

  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'local' ? 'local' : 'live'
  } catch {
    return 'live'
  }
}

let currentMode = readStoredMode()

function notifySubscribers() {
  subscribers.forEach((subscriber) => subscriber())
}

export function getApiMode(): ApiMode {
  return currentMode
}

export function setApiMode(mode: ApiMode) {
  if (mode === currentMode) return

  currentMode = mode
  try {
    window.localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // Keep the current session usable if browser storage is unavailable.
  }
  notifySubscribers()
}

export function subscribeToApiMode(subscriber: () => void) {
  subscribers.add(subscriber)
  return () => subscribers.delete(subscriber)
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return
    currentMode = event.newValue === 'local' ? 'local' : 'live'
    notifySubscribers()
  })
}
