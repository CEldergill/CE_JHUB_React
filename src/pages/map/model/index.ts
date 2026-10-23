export interface PoliceForceSummary {
  id: string
  name: string
}

export interface ForceEngagementMethod {
  url: string
  type?: string
  description?: string
  title: string
}

export interface PoliceForceDetails {
  id: string
  name: string
  description: string | null
  url: string
  telephone: string
  engagement_methods: ForceEngagementMethod[]
}

export interface ForceOfficer {
  name: string
  rank: string
  bio: string | null
}

export interface NeighbourhoodSummary {
  id: string
  name: string
}

export interface NeighbourhoodDetails {
  id: string
  name: string
  url_force: string
  description?: string | null
  population?: string
  centre: {
    latitude: string
    longitude: string
  }
  contact_details?: {
    email?: string
    telephone?: string
    web?: string
    twitter?: string
    facebook?: string
  }
}

export interface NeighbourhoodPriority {
  issue: string
  'issue-date': string
  action: string | null
}

export interface CrimeCategory {
  url: string
  name: string
}

export interface CrimeDateEntry {
  date: string
  'stop-and-search': string[]
}

export interface StreetCrime {
  id: number
  category: string
  location_type: string
  location: {
    latitude: string
    longitude: string
    street: {
      id: number
      name: string
    }
  }
  context: string
  outcome_status: {
    category: string
    date: string
  } | null
  persistent_id: string
  location_subtype: string
  month: string
}

export const REGION_TO_FORCES: Record<string, string[]> = {
  Bedfordshire: ['bedfordshire'],
  Berkshire: ['thames-valley'],
  Buckinghamshire: ['thames-valley'],
  Cambridgeshire: ['cambridgeshire'],
  Cheshire: ['cheshire'],
  Cornwall: ['devon-and-cornwall'],
  Cumbria: ['cumbria'],
  Derbyshire: ['derbyshire'],
  Devon: ['devon-and-cornwall'],
  Dorset: ['dorset'],
  Durham: ['durham', 'cleveland'],
  Essex: ['essex'],
  Gloucestershire: ['gloucestershire'],
  'Greater London': ['metropolitan', 'city-of-london'],
  Hampshire: ['hampshire'],
  Herefordshire: ['west-mercia'],
  Hertfordshire: ['hertfordshire'],
  Kent: ['kent'],
  Lancashire: ['lancashire', 'greater-manchester', 'merseyside'],
  Leicestershire: ['leicestershire'],
  Lincolnshire: ['lincolnshire'],
  Norfolk: ['norfolk'],
  Northamptonshire: ['northamptonshire'],
  'Northern Ireland': ['northern-ireland'],
  Northumberland: ['northumbria'],
  Nottinghamshire: ['nottinghamshire'],
  Oxfordshire: ['thames-valley'],
  Rutland: ['leicestershire'],
  Shropshire: ['west-mercia'],
  Somerset: ['avon-and-somerset'],
  Staffordshire: ['staffordshire', 'west-midlands'],
  Suffolk: ['suffolk'],
  Surrey: ['surrey'],
  Sussex: ['sussex'],
  Wales: ['south-wales', 'north-wales', 'gwent', 'dyfed-powys'],
  Warwickshire: ['warwickshire', 'west-midlands'],
  Wiltshire: ['wiltshire'],
  Worcestershire: ['west-mercia'],
  Yorkshire: ['west-yorkshire', 'south-yorkshire', 'north-yorkshire', 'humberside'],
  Scotland: [],
  Ireland: [],
}

export function getRegionsForForce(forceId: string): string[] {
  if (!forceId) return []
  return Object.entries(REGION_TO_FORCES)
    .filter(([, forceIds]) => forceIds.includes(forceId))
    .map(([region]) => region)
}

export function stripHtml(html: string | null | undefined): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export { useMapExplorer } from './useMapExplorer'

