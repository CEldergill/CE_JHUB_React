import { useEffect, useMemo, useRef, useState } from 'react'
import Unitedkingdom from '@react-map/united-kingdom'
import {
  MapPin,
  Phone,
  ExternalLink,
  Search,
  Loader2,
  AlertCircle,
  Shield,
  Users,
} from 'lucide-react'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/components'
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
  stripHtml,
  type CrimeCategory,
  type ForceOfficer,
  type NeighbourhoodDetails,
  type NeighbourhoodPriority,
  type NeighbourhoodSummary,
  type PoliceForceDetails,
  type PoliceForceSummary,
  type StreetCrime,
} from '../model'

const SELECTION_COOLDOWN_MS = 600

export function MapPage() {
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

  const selectForce = (forceId: string) => {
    if (!forceId || forceId === selectedForceId) return
    if (Date.now() - lastSelectionTimestamp.current < SELECTION_COOLDOWN_MS) {
      return
    }
    triggerCooldown()
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

  // 1. Initial load: forces, available months, crime categories
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
    setSelectedRegion(region)
    if (!region) return
    const mappedForces = REGION_TO_FORCES[region]
    if (mappedForces && mappedForces.length > 0) {
      selectForce(mappedForces[0])
    }
  }

  const regionForceIds = selectedRegion ? (REGION_TO_FORCES[selectedRegion] ?? []) : []
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

  return (
    <main
      id="map-page"
      className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6"
    >
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Error communicating with Police.uk API</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Interactive Map & Filters */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">UK Region Map</CardTitle>
                <CardDescription className="mt-0.5 text-xs">
                  Click a county to load its police force
                </CardDescription>
              </div>
              {selectedRegion && (
                <Badge variant="secondary" className="gap-1">
                  <MapPin className="size-3" />
                  {selectedRegion}
                </Badge>
              )}
            </CardHeader>

            <Separator />

            <CardContent className="flex flex-col items-center pt-4">
              <div className="w-full overflow-hidden flex justify-center">
                <Unitedkingdom
                  type="select-single"
                  size={360}
                  mapColor="#27272a"
                  strokeColor="#52525b"
                  strokeWidth={0.8}
                  hoverColor="#a1a1aa"
                  selectColor="#fafafa"
                  hints={true}
                  hintTextColor="#fafafa"
                  hintBackgroundColor="#09090b"
                  disableClick={isBusy}
                  onSelect={handleRegionSelect}
                />
              </div>

              {isUnsupportedRegion && (
                <Alert className="mt-4">
                  <AlertCircle className="size-4" />
                  <AlertTitle>{selectedRegion} is outside Police.uk scope</AlertTitle>
                  <AlertDescription>
                    The data.police.uk API covers England, Wales, and Northern Ireland. Select
                    another region or choose a force below.
                  </AlertDescription>
                </Alert>
              )}

              {regionForceIds.length > 1 && (
                <div className="mt-3 flex w-full flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground">
                    Forces in {selectedRegion}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {regionForceIds.map((id) => {
                      const forceObj = forces.find((f) => f.id === id)
                      return (
                        <Button
                          key={id}
                          size="sm"
                          disabled={isBusy}
                          variant={selectedForceId === id ? 'default' : 'outline'}
                          onClick={() => selectForce(id)}
                          className="h-7 text-xs"
                        >
                          {forceObj?.name ?? id}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Controls Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Query Controls</CardTitle>
              <CardDescription className="text-xs">
                Refine police force, neighbourhood, crime category, and month
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="flex flex-col gap-4 pt-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="force-select" className="text-xs font-medium">
                  Police Force ({forces.length})
                </label>
                <select
                  id="force-select"
                  value={selectedForceId}
                  onChange={(e) => selectForce(e.target.value)}
                  disabled={isBusy}
                  className="bg-background border-input h-9 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  {forces.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="neighbourhood-select" className="text-xs font-medium">
                  Neighbourhood ({neighbourhoods.length})
                </label>
                <select
                  id="neighbourhood-select"
                  value={selectedNeighbourhoodId}
                  onChange={(e) => selectNeighbourhood(e.target.value)}
                  disabled={isBusy || neighbourhoods.length === 0}
                  className="bg-background border-input h-9 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  {neighbourhoods.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="category-select" className="text-xs font-medium">
                    Crime Category
                  </label>
                  <select
                    id="category-select"
                    value={selectedCategory}
                    onChange={(e) => {
                      triggerCooldown()
                      setCrimesLoading(true)
                      setSelectedCategory(e.target.value)
                    }}
                    disabled={isBusy}
                    className="bg-background border-input h-9 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  >
                    {categories.map((cat) => (
                      <option key={cat.url} value={cat.url}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="date-select" className="text-xs font-medium">
                    Reporting Month
                  </label>
                  <select
                    id="date-select"
                    value={selectedDate}
                    onChange={(e) => {
                      triggerCooldown()
                      setCrimesLoading(true)
                      setSelectedDate(e.target.value)
                    }}
                    disabled={isBusy}
                    className="bg-background border-input h-9 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  >
                    {availableDates.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live API Results */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          {/* Force & Neighbourhood Summary Header */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">
                      {forceLoading
                        ? 'Loading force...'
                        : (forceDetails?.name ?? 'Select a Police Force')}
                    </CardTitle>
                    {isBusy && (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <CardDescription className="mt-1">
                    {neighbourhoodDetails
                      ? `Neighbourhood: ${neighbourhoodDetails.name} (${neighbourhoodDetails.centre.latitude}, ${neighbourhoodDetails.centre.longitude})`
                      : 'Loading neighbourhood coordinates...'}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  {forceDetails?.telephone && (
                    <Badge variant="outline" className="gap-1">
                      <Phone className="size-3" />
                      {forceDetails.telephone}
                    </Badge>
                  )}
                  {forceDetails?.url && (
                    <a
                      href={forceDetails.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-medium hover:bg-accent"
                    >
                      Website
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Detailed Tabs */}
          <Tabs
            defaultValue="crimes"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="crimes">
                Street Crimes ({filteredCrimes.length})
              </TabsTrigger>
              <TabsTrigger value="neighbourhood">
                Neighbourhood &amp; Priorities
              </TabsTrigger>
              <TabsTrigger value="force">
                Force &amp; Officers
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Street Crimes */}
            <TabsContent value="crimes" className="mt-4 flex flex-col gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">
                        Recorded Street Incidents
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {selectedDate ? `Month: ${selectedDate}` : 'Latest month'} ·{' '}
                        {categoryNameMap[selectedCategory] ?? selectedCategory}
                      </CardDescription>
                    </div>

                    <div className="relative w-full sm:w-60">
                      <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
                      <input
                        type="text"
                        placeholder="Filter by street or outcome..."
                        value={streetSearch}
                        onChange={(e) => setStreetSearch(e.target.value)}
                        className="bg-background border-input h-9 w-full rounded-md border pr-3 pl-8 text-xs outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                </CardHeader>

                <Separator />

                <CardContent className="pt-4">
                  {crimesLoading ? (
                    <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                      Fetching street-level crimes from data.police.uk...
                    </div>
                  ) : filteredCrimes.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No recorded incidents match the current filters.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {/* Top Categories Breakdown */}
                      {categoryBreakdown.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Top Offence Categories
                          </span>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {categoryBreakdown.map(([catSlug, count]) => {
                              const pct = Math.round(
                                (count / filteredCrimes.length) * 100,
                              )
                              return (
                                <div
                                  key={catSlug}
                                  className="flex flex-col gap-1 rounded-lg border p-2.5"
                                >
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium truncate">
                                      {categoryNameMap[catSlug] ?? catSlug}
                                    </span>
                                    <span className="text-muted-foreground">
                                      {count} ({pct}%)
                                    </span>
                                  </div>
                                  <div className="bg-secondary h-1.5 w-full overflow-hidden rounded-full">
                                    <div
                                      className="bg-primary h-full rounded-full"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Incident List */}
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Showing {Math.min(filteredCrimes.length, 40)} of{' '}
                          {filteredCrimes.length} incidents
                        </span>
                        <div className="max-h-96 overflow-y-auto pr-1 flex flex-col gap-2">
                          {filteredCrimes.slice(0, 40).map((crime) => (
                            <div
                              key={crime.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-xs"
                            >
                              <div className="flex flex-col gap-0.5">
                                <span className="font-semibold">
                                  {categoryNameMap[crime.category] ?? crime.category}
                                </span>
                                <span className="text-muted-foreground">
                                  {crime.location.street.name}
                                </span>
                              </div>
                              <Badge variant="secondary" className="text-[11px]">
                                {crime.outcome_status?.category ??
                                  'No outcome recorded'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Neighbourhood & Local Priorities */}
            <TabsContent value="neighbourhood" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {neighbourhoodDetails?.name ?? 'Neighbourhood Details'}
                    </CardTitle>
                    {neighbourhoodDetails?.population &&
                      neighbourhoodDetails.population !== '0' && (
                        <Badge variant="outline">
                          Population: {neighbourhoodDetails.population}
                        </Badge>
                      )}
                  </div>
                  {neighbourhoodDetails?.description && (
                    <CardDescription className="mt-1">
                      {stripHtml(neighbourhoodDetails.description)}
                    </CardDescription>
                  )}
                </CardHeader>

                <Separator />

                <CardContent className="flex flex-col gap-3 pt-4">
                  <span className="text-xs font-medium text-muted-foreground">
                    Local Policing Priorities
                  </span>
                  {neighbourhoodLoading ? (
                    <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                      Loading priorities...
                    </div>
                  ) : priorities.length === 0 ? (
                    <p className="py-4 text-sm text-muted-foreground">
                      No published priorities for this neighbourhood.
                    </p>
                  ) : (
                    priorities.slice(0, 6).map((p, idx) => (
                      <div key={idx} className="rounded-lg border p-3 text-xs space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="outline">Priority</Badge>
                          {p['issue-date'] && (
                            <span className="text-muted-foreground">
                              {p['issue-date'].slice(0, 10)}
                            </span>
                          )}
                        </div>
                        <p className="font-medium leading-relaxed">
                          {stripHtml(p.issue)}
                        </p>
                        {p.action && (
                          <p className="text-muted-foreground leading-relaxed">
                            Action: {stripHtml(p.action)}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Force Details & Senior Officers */}
            <TabsContent value="force" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="size-4 text-muted-foreground" />
                    <CardTitle className="text-base">
                      {forceDetails?.name ?? 'Force Overview'}
                    </CardTitle>
                  </div>
                  <CardDescription className="mt-1 leading-relaxed">
                    {stripHtml(forceDetails?.description) ||
                      'Official force information and senior leadership from data.police.uk.'}
                  </CardDescription>
                </CardHeader>

                <Separator />

                <CardContent className="flex flex-col gap-4 pt-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Users className="size-3.5" />
                    <span>Senior Officers ({officers.length})</span>
                  </div>

                  {officers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No senior officer biographies published by this force via the API.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {officers.map((officer, idx) => (
                        <div key={idx} className="rounded-lg border p-3 text-xs space-y-1">
                          <div className="font-semibold">{officer.name}</div>
                          <Badge variant="secondary" className="text-[10px]">
                            {officer.rank}
                          </Badge>
                          {officer.bio && (
                            <p className="text-muted-foreground pt-1 line-clamp-3 leading-relaxed">
                              {stripHtml(officer.bio)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
