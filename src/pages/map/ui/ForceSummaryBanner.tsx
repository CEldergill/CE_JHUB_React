import { ExternalLink, Loader2, Phone } from 'lucide-react'
import {
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shared/components'
import type { NeighbourhoodDetails, PoliceForceDetails } from '../model'

interface ForceSummaryBannerProps {
  forceDetails: PoliceForceDetails | null
  neighbourhoodDetails: NeighbourhoodDetails | null
  forceLoading: boolean
  isBusy: boolean
}

export function ForceSummaryBanner({
  forceDetails,
  neighbourhoodDetails,
  forceLoading,
  isBusy,
}: ForceSummaryBannerProps) {
  return (
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
  )
}

