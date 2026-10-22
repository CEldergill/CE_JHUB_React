export interface ForceBasic {
  id: string
  name: string
}

export interface AvailableCrimeDate {
  date: string
  'stop-and-search': string[]
}

export interface LandingOverviewStats {
  totalForces: number
  latestMonth: string | null
  sampleForces: ForceBasic[]
}
