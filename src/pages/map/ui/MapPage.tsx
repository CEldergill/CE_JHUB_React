import { AlertCircle } from 'lucide-react'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/components'
import { useMapExplorer } from '../model'
import { ForceOfficersTab } from './ForceOfficersTab'
import { ForceSummaryBanner } from './ForceSummaryBanner'
import { NeighbourhoodTab } from './NeighbourhoodTab'
import { QueryControlsCard } from './QueryControlsCard'
import { RegionMapCard } from './RegionMapCard'
import { StreetCrimesTab } from './StreetCrimesTab'

export function MapPage() {
  const {
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
    error,
    forceLoading,
    neighbourhoodLoading,
    crimesLoading,
    isBusy,
    selectForce,
    selectNeighbourhood,
    selectCategory,
    selectDate,
    handleRegionSelect,
  } = useMapExplorer()

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
        {/* Left Column: Interactive Map & Query Controls */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <RegionMapCard
            selectedRegion={selectedRegion}
            selectedForceId={selectedForceId}
            forces={forces}
            regionForceIds={regionForceIds}
            isUnsupportedRegion={isUnsupportedRegion}
            mapSyncKey={mapSyncKey}
            cityColors={cityColors}
            isBusy={isBusy}
            onRegionSelect={handleRegionSelect}
            onSelectForce={selectForce}
          />

          <QueryControlsCard
            forces={forces}
            neighbourhoods={neighbourhoods}
            categories={categories}
            availableDates={availableDates}
            selectedForceId={selectedForceId}
            selectedNeighbourhoodId={selectedNeighbourhoodId}
            selectedCategory={selectedCategory}
            selectedDate={selectedDate}
            isBusy={isBusy}
            onSelectForce={selectForce}
            onSelectNeighbourhood={selectNeighbourhood}
            onSelectCategory={selectCategory}
            onSelectDate={selectDate}
          />
        </div>

        {/* Right Column: Live API Results */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          <ForceSummaryBanner
            forceDetails={forceDetails}
            neighbourhoodDetails={neighbourhoodDetails}
            forceLoading={forceLoading}
            isBusy={isBusy}
          />

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
              <TabsTrigger value="force">Force &amp; Officers</TabsTrigger>
            </TabsList>

            <TabsContent value="crimes" className="mt-4 flex flex-col gap-4">
              <StreetCrimesTab
                selectedDate={selectedDate}
                selectedCategory={selectedCategory}
                categoryNameMap={categoryNameMap}
                streetSearch={streetSearch}
                onStreetSearchChange={setStreetSearch}
                crimesLoading={crimesLoading}
                filteredCrimes={filteredCrimes}
                categoryBreakdown={categoryBreakdown}
              />
            </TabsContent>

            <TabsContent value="neighbourhood" className="mt-4">
              <NeighbourhoodTab
                neighbourhoodDetails={neighbourhoodDetails}
                priorities={priorities}
                neighbourhoodLoading={neighbourhoodLoading}
              />
            </TabsContent>

            <TabsContent value="force" className="mt-4">
              <ForceOfficersTab
                forceDetails={forceDetails}
                officers={officers}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
