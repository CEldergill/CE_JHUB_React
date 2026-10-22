import { fetchPoliceApi } from '@shared/api'
import type {
  CrimeCategory,
  CrimeDateEntry,
  ForceOfficer,
  NeighbourhoodDetails,
  NeighbourhoodPriority,
  NeighbourhoodSummary,
  PoliceForceDetails,
  PoliceForceSummary,
  StreetCrime,
} from '../model'

export function getForces(signal?: AbortSignal) {
  return fetchPoliceApi<PoliceForceSummary[]>('/forces', signal)
}

export function getCrimeDates(signal?: AbortSignal) {
  return fetchPoliceApi<CrimeDateEntry[]>('/crimes-street-dates', signal)
}

export function getCrimeCategories(date?: string, signal?: AbortSignal) {
  const query = date ? `?date=${encodeURIComponent(date)}` : ''
  return fetchPoliceApi<CrimeCategory[]>(`/crime-categories${query}`, signal)
}

export function getForceDetails(forceId: string, signal?: AbortSignal) {
  return fetchPoliceApi<PoliceForceDetails>(
    `/forces/${encodeURIComponent(forceId)}`,
    signal,
  )
}

export function getForceOfficers(forceId: string, signal?: AbortSignal) {
  return fetchPoliceApi<ForceOfficer[]>(
    `/forces/${encodeURIComponent(forceId)}/people`,
    signal,
  )
}

export function getNeighbourhoods(forceId: string, signal?: AbortSignal) {
  return fetchPoliceApi<NeighbourhoodSummary[]>(
    `/${encodeURIComponent(forceId)}/neighbourhoods`,
    signal,
  )
}

export function getNeighbourhoodDetails(
  forceId: string,
  neighbourhoodId: string,
  signal?: AbortSignal,
) {
  return fetchPoliceApi<NeighbourhoodDetails>(
    `/${encodeURIComponent(forceId)}/${encodeURIComponent(neighbourhoodId)}`,
    signal,
  )
}

export function getNeighbourhoodPriorities(
  forceId: string,
  neighbourhoodId: string,
  signal?: AbortSignal,
) {
  return fetchPoliceApi<NeighbourhoodPriority[]>(
    `/${encodeURIComponent(forceId)}/${encodeURIComponent(neighbourhoodId)}/priorities`,
    signal,
  )
}

export function getStreetCrimes(
  params: {
    lat: string
    lng: string
    category?: string
    date?: string
  },
  signal?: AbortSignal,
) {
  const categorySlug = params.category || 'all-crime'
  const searchParams = new URLSearchParams({
    lat: params.lat,
    lng: params.lng,
  })
  if (params.date) {
    searchParams.set('date', params.date)
  }

  return fetchPoliceApi<StreetCrime[]>(
    `/crimes-street/${encodeURIComponent(categorySlug)}?${searchParams.toString()}`,
    signal,
  )
}
