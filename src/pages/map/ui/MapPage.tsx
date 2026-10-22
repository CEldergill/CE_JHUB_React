import { useState } from 'react'
import Unitedkingdom from '@react-map/united-kingdom'
import { MapPin } from 'lucide-react'
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from '@shared/components'

export function MapPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  return (
    <main
      id="map-page"
      className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-6xl flex-col items-center px-4 py-8 sm:px-6"
    >
      <Card className="w-full max-w-3xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">UK Interactive Map</CardTitle>
            <CardDescription className="mt-1">
              Click a county or region on the map to select it
            </CardDescription>
          </div>
          {selectedRegion ? (
            <Badge variant="default" className="gap-1.5 px-3 py-1 text-xs">
              <MapPin className="size-3.5" />
              {selectedRegion}
            </Badge>
          ) : (
            <Badge variant="outline" className="px-3 py-1 text-xs text-muted-foreground">
              No region selected
            </Badge>
          )}
        </CardHeader>

        <Separator />

        <CardContent className="flex justify-center pt-6">
          <Unitedkingdom
            type="select-single"
            size={500}
            mapColor="#27272a"
            strokeColor="#52525b"
            strokeWidth={0.8}
            hoverColor="#a1a1aa"
            selectColor="#fafafa"
            hints={true}
            hintTextColor="#fafafa"
            hintBackgroundColor="#09090b"
            onSelect={(state) => setSelectedRegion(state)}
          />
        </CardContent>
      </Card>
    </main>
  )
}
