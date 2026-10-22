import { fetchPoliceApi } from '@shared/api'
import type {
  AvailableCrimeDate,
  ForceBasic,
  LandingOverviewStats,
} from '../model'

export async function getLandingOverviewStats(
  signal?: AbortSignal,
): Promise<LandingOverviewStats> {
  const [forces, dates] = await Promise.all([
    fetchPoliceApi<ForceBasic[]>('/forces', signal),
    fetchPoliceApi<AvailableCrimeDate[]>('/crimes-street-dates', signal),
  ])

  return {
    totalForces: forces.length,
    latestMonth: dates[0]?.date ?? null,
    sampleForces: forces.slice(0, 6),
  }
}
