import Unitedkingdom from '@react-map/united-kingdom'
import { AlertCircle, MapPin } from 'lucide-react'
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
} from '@shared/components'
import type { PoliceForceSummary } from '../model'

interface RegionMapCardProps {
  selectedRegion: string | null
  selectedForceId: string
  forces: PoliceForceSummary[]
  regionForceIds: string[]
  isUnsupportedRegion: boolean
  mapSyncKey: number
  cityColors: Record<string, string>
  isBusy: boolean
  onRegionSelect: (region: string | null) => void
  onSelectForce: (forceId: string) => void
}

export function RegionMapCard({
  selectedRegion,
  selectedForceId,
  forces,
  regionForceIds,
  isUnsupportedRegion,
  mapSyncKey,
  cityColors,
  isBusy,
  onRegionSelect,
  onSelectForce,
}: RegionMapCardProps) {
  return (
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
        <div className="flex w-full justify-center overflow-hidden">
          <Unitedkingdom
            key={mapSyncKey}
            type="select-single"
            size={360}
            mapColor="#27272a"
            strokeColor="#52525b"
            strokeWidth={0.8}
            hoverColor="#a1a1aa"
            selectColor="#fafafa"
            cityColors={cityColors}
            hints={true}
            hintTextColor="#fafafa"
            hintBackgroundColor="#09090b"
            disableClick={isBusy}
            onSelect={onRegionSelect}
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
                    onClick={() => onSelectForce(id)}
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
  )
}

