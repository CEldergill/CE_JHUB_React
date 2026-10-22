import { POLICE_API_BASE_URL } from '@shared/config'

const CACHE_PREFIX = 'police_api_v1:'
// Enforce a 350ms cooldown gap AFTER each request completes before starting the next one
const COOLDOWN_BETWEEN_REQUESTS_MS = 350

const memoryCache = new Map<string, unknown>()
const inFlightRequests = new Map<string, Promise<unknown>>()

let lastCompletedTime = 0
let rateLimitQueue: Promise<void> = Promise.resolve()

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function readCached<T>(url: string): T | undefined {
  if (memoryCache.has(url)) {
    return memoryCache.get(url) as T
  }
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + url)
    if (raw) {
      const parsed = JSON.parse(raw) as T
      memoryCache.set(url, parsed)
      return parsed
    }
  } catch {
    // Ignore storage read errors
  }
  return undefined
}

function writeCached(url: string, data: unknown): void {
  memoryCache.set(url, data)
  try {
    sessionStorage.setItem(CACHE_PREFIX + url, JSON.stringify(data))
  } catch {
    // Ignore storage quota errors
  }
}

function scheduleRateLimited<T>(task: () => Promise<T>): Promise<T> {
  const run = async (): Promise<T> => {
    const now = Date.now()
    const waitMs = Math.max(
      0,
      lastCompletedTime + COOLDOWN_BETWEEN_REQUESTS_MS - now,
    )
    if (waitMs > 0) {
      await delay(waitMs)
    }

    try {
      return await task()
    } finally {
      lastCompletedTime = Date.now()
    }
  }

  const result = rateLimitQueue.then(run, run)
  rateLimitQueue = result.then(
    () => undefined,
    () => undefined,
  )
  return result
}

async function fetchWithRetry(url: string, attemptsLeft = 4): Promise<Response> {
  const response = await scheduleRateLimited(() =>
    fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    }),
  )

  if (response.status === 429 && attemptsLeft > 0) {
    const retryAfterHeader = response.headers.get('Retry-After')
    const backoffMs = retryAfterHeader
      ? Number(retryAfterHeader) * 1000
      : (5 - attemptsLeft) * 1500
    await delay(Number.isFinite(backoffMs) && backoffMs > 0 ? backoffMs : 1500)
    return fetchWithRetry(url, attemptsLeft - 1)
  }

  return response
}

export async function fetchPoliceApi<T>(
  endpoint: string,
  _signal?: AbortSignal,
): Promise<T> {
  const normalizedPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${POLICE_API_BASE_URL}${normalizedPath}`

  const cached = readCached<T>(url)
  if (cached !== undefined) {
    return cached
  }

  const existingInFlight = inFlightRequests.get(url)
  if (existingInFlight) {
    return existingInFlight as Promise<T>
  }

  const requestPromise = (async () => {
    try {
      const response = await fetchWithRetry(url)

      if (!response.ok) {
        throw new Error(`API request failed (${response.status}): ${endpoint}`)
      }

      const data = (await response.json()) as T
      writeCached(url, data)
      return data
    } finally {
      inFlightRequests.delete(url)
    }
  })()

  inFlightRequests.set(url, requestPromise)
  return requestPromise
}
