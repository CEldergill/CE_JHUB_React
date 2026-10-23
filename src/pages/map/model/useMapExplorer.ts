import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getCrimeCategories,
  getCrimeDates,
  getForceDetails,
  getForceOfficers,
  getForces,
  getNeighbourhoodDetails,
  getNeighbourhoodPriorities,
  getNeighbourhoods,
  getStreetCrimes,
} from '../api'
import {
  REGION_TO_FORCES,
  getRegionsForForce,
  type CrimeCategory,
  type ForceOfficer,
  type NeighbourhoodDetails,
  type NeighbourhoodPriority,
  type NeighbourhoodSummary,
  type PoliceForceDetails,
  type PoliceForceSummary,
  type StreetCrime,
} from './index'

const SELECTION_COOLDOWN_MS = 600

export function useMapExplorer() {
  // Initial reference data
  const [forces, setForces] = useState<PoliceForceSummary[]>([])
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [categories, setCategories] = useState<CrimeCategory[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // User selections
  const [activeTab, setActiveTab] = useState<string>('crimes')
  const [selectedRegion, setSelectedRegion] = useState<string | null>('Kent')
  const [selectedForceId, setSelectedForceId] = useState<string>('kent')
  const [selectedNeighbourhoodId, setSelectedNeighbourhoodId] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all-crime')
  const [streetSearch, setStreetSearch] = useState<string>('')
  const [isCoolingDown, setIsCoolingDown] = useState(false)
  const [mapSyncKey, setMapSyncKey] = useState<number>(0)
  const lastSelectionTimestamp = useRef<number>(0)

  // Force-level API state
  const [forceDetails, setForceDetails] = useState<PoliceForceDetails | null>(null)
  const [officers, setOfficers] = useState<ForceOfficer[]>([])
  const [neighbourhoods, setNeighbourhoods] = useState<NeighbourhoodSummary[]>([])
  const [forceLoading, setForceLoading] = useState(true)

  // Neighbourhood-level API state
  const [neighbourhoodDetails, setNeighbourhoodDetails] =
    useState<NeighbourhoodDetails | null>(null)
  const [priorities, setPriorities] = useState<NeighbourhoodPriority[]>([])
  const [neighbourhoodLoading, setNeighbourhoodLoading] = useState(false)

  // Street crimes API state
  const [crimes, setCrimes] = useState<StreetCrime[]>([])
  const [crimesLoading, setCrimesLoading] = useState(false)

  const triggerCooldown = () => {
    lastSelectionTimestamp.current = Date.now()
    setIsCoolingDown(true)
    setTimeout(() => {
      setIsCoolingDown(false)
    }, SELECTION_COOLDOWN_MS)
  }

  const selectForce = (forceId: string, explicitRegion?: string) => {
    if (!forceId) return
    if (forceId === selectedForceId) {
      if (explicitRegion) setSelectedRegion(explicitRegion)
      return
    }
    if (Date.now() - lastSelectionTimestamp.current < SELECTION_COOLDOWN_MS) {
      return
    }
    triggerCooldown()
    if (explicitRegion) {
      setSelectedRegion(explicitRegion)
    } else {
      const matchingRegions = getRegionsForForce(forceId)
      if (matchingRegions.length > 0) {
        setSelectedRegion(matchingRegions.join(', '))
      }
      setMapSyncKey((k) => k + 1)
    }
    setForceLoading(true)
    setSelectedNeighbourhoodId('')
    setNeighbourhoods([])
    setNeighbourhoodDetails(null)
    setPriorities([])
    setOfficers([])
    setCrimes([])
    setSelectedForceId(forceId)
  }

  const selectNeighbourhood = (hoodId: string) => {
    if (!hoodId || hoodId === selectedNeighbourhoodId) return
    if (Date.now() - lastSelectionTimestamp.current < SELECTION_COOLDOWN_MS) {
      return
    }
    triggerCooldown()
    setNeighbourhoodLoading(true)
    setPriorities([])
    setCrimes([])
    setSelectedNeighbourhoodId(hoodId)
  }

  const selectCategory = (category: string) => {
    triggerCooldown()
    setCrimesLoading(true)
    setSelectedCategory(category)
  }

  const selectDate = (date: string) => {
    triggerCooldown()
    setCrimesLoading(true)
    setSelectedDate(date)
  }

  // Initial load: forces, available months, crime categories
  useEffect(() => {
    let cancelled = false

    Promise.all([getForces(), getCrimeDates(), getCrimeCategories()])
      .then(([forcesData, datesData, categoriesData]) => {
        if (cancelled) return
        setForces(forcesData)
        const monthList = datesData.map((d) => d.date).slice(0, 12)
        setAvailableDates(monthList)
        if (monthList[0]) {
          setSelectedDate(monthList[0])
        }
        setCategories(categoriesData)
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load initial API data')
      })
      .finally(() => {
        if (!cancelled) setInitialLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // When selectedForceId changes -> fetch force details and neighbourhoods
  useEffect(() => {
    if (!selectedForceId || initialLoading) return

    let cancelled = false

    Promise.all([
      getForceDetails(selectedForceId),
      getNeighbourhoods(selectedForceId),
    ])
      .then(([details, hoodList]) => {
        if (cancelled) return
        setForceDetails(details)
        setNeighbourhoods(hoodList)
        const firstHood = hoodList[0]?.id ?? ''
        setSelectedNeighbourhoodId(firstHood)
        if (firstHood) {
          setNeighbourhoodLoading(true)
        }
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load police force data')
      })
      .finally(() => {
        if (!cancelled) setForceLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedForceId, initialLoading])

  // Only fetch senior officers when the "Force & Officers" tab is opened
  useEffect(() => {
    if (!selectedForceId || activeTab !== 'force') return

    let cancelled = false
    getForceOfficers(selectedForceId)
      .then((people) => {
        if (!cancelled) setOfficers(people)
      })
      .catch(() => {
        if (!cancelled) setOfficers([])
      })

    return () => {
      cancelled = true
    }
  }, [selectedForceId, activeTab])

  // When selectedNeighbourhoodId changes -> fetch neighbourhood details (including lat/lng)
  useEffect(() => {
    if (!selectedForceId || !selectedNeighbourhoodId || initialLoading) return

    let cancelled = false

    getNeighbourhoodDetails(selectedForceId, selectedNeighbourhoodId)
      .then((details) => {
        if (cancelled) return
        setNeighbourhoodDetails(details)
        if (details?.centre?.latitude && details?.centre?.longitude) {
          setCrimesLoading(true)
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(
          err instanceof Error ? err.message : 'Failed to load neighbourhood details',
        )
      })
      .finally(() => {
        if (!cancelled) setNeighbourhoodLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedForceId, selectedNeighbourhoodId, initialLoading])

  // Only fetch neighbourhood priorities when the "Neighbourhood & Priorities" tab is opened
  useEffect(() => {
    if (
      !selectedForceId ||
      !selectedNeighbourhoodId ||
      activeTab !== 'neighbourhood'
    ) {
      return
    }

    let cancelled = false
    getNeighbourhoodPriorities(selectedForceId, selectedNeighbourhoodId)
      .then((priorityList) => {
        if (!cancelled) setPriorities(priorityList)
      })
      .catch(() => {
        if (!cancelled) setPriorities([])
      })

    return () => {
      cancelled = true
    }
  }, [selectedForceId, selectedNeighbourhoodId, activeTab])

  // Debounced street-level crime call after neighbourhood coordinates settle
  useEffect(() => {
    const lat = neighbourhoodDetails?.centre?.latitude
    const lng = neighbourhoodDetails?.centre?.longitude
    if (!lat || !lng || initialLoading) return

    let cancelled = false
    const debounceTimer = setTimeout(() => {
      getStreetCrimes({
        lat,
        lng,
        category: selectedCategory,
        date: selectedDate || undefined,
      })
        .then((crimeList) => {
          if (!cancelled) setCrimes(crimeList)
        })
        .catch(() => {
          if (!cancelled) setCrimes([])
        })
        .finally(() => {
          if (!cancelled) setCrimesLoading(false)
        })
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(debounceTimer)
    }
  }, [
    initialLoading,
    neighbourhoodDetails?.centre?.latitude,
    neighbourhoodDetails?.centre?.longitude,
    selectedCategory,
    selectedDate,
  ])

  const handleRegionSelect = (region: string | null) => {
    if (!region) return
    const mappedForces = REGION_TO_FORCES[region]
    if (mappedForces && mappedForces.length > 0) {
      selectForce(mappedForces[0], region)
    } else {
      setSelectedRegion(region)
    }
  }

  const highlightedRegions = useMemo(() => {
    if (selectedRegion && REGION_TO_FORCES[selectedRegion]) {
      return [selectedRegion]
    }
    return getRegionsForForce(selectedForceId)
  }, [selectedRegion, selectedForceId])

  const cityColors = useMemo(() => {
    const colors: Record<string, string> = {}
    for (const region of highlightedRegions) {
      colors[region] = '#fafafa'
    }
    return colors
  }, [highlightedRegions])

  const primaryRegionKey =
    selectedRegion && REGION_TO_FORCES[selectedRegion]
      ? selectedRegion
      : (highlightedRegions[0] ?? null)
  const regionForceIds = primaryRegionKey
    ? (REGION_TO_FORCES[primaryRegionKey] ?? [])
    : []
  const isUnsupportedRegion =
    selectedRegion === 'Scotland' || selectedRegion === 'Ireland'

  const categoryNameMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const c of categories) {
      map[c.url] = c.name
    }
    return map
  }, [categories])

  const filteredCrimes = useMemo(() => {
    if (!streetSearch.trim()) return crimes
    const q = streetSearch.toLowerCase()
    return crimes.filter(
      (c) =>
        c.location.street.name.toLowerCase().includes(q) ||
        (c.outcome_status?.category ?? 'Under investigation').toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q),
    )
  }, [crimes, streetSearch])

  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const crime of filteredCrimes) {
      counts[crime.category] = (counts[crime.category] ?? 0) + 1
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
  }, [filteredCrimes])

  const isBusy =
    initialLoading || forceLoading || neighbourhoodLoading || crimesLoading || isCoolingDown

  return {
    // Data
    forces,
    availableDates,
    categories,
    forceDetails,
    officers,
    neighbourhoods,
    neighbourhoodDetails,
    priorities,
    filteredCrimes,
    categoryBreakdown,
    categoryNameMap,

    // Selections & map state
    activeTab,
    setActiveTab,
    selectedRegion,
    selectedForceId,
    selectedNeighbourhoodId,
    selectedDate,
    selectedCategory,
    streetSearch,
    setStreetSearch,
    mapSyncKey,
    cityColors,
    regionForceIds,
    isUnsupportedRegion,

    // Loading & error flags
    error,
    forceLoading,
    neighbourhoodLoading,
    crimesLoading,
    isBusy,

    // Handlers
    selectForce,
    selectNeighbourhood,
    selectCategory,
    selectDate,
    handleRegionSelect,
  }
}

