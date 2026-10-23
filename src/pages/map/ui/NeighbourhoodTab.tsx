import { Loader2 } from 'lucide-react'
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from '@shared/components'
import {
  stripHtml,
  type NeighbourhoodDetails,
  type NeighbourhoodPriority,
} from '../model'

interface NeighbourhoodTabProps {
  neighbourhoodDetails: NeighbourhoodDetails | null
  priorities: NeighbourhoodPriority[]
  neighbourhoodLoading: boolean
}

export function NeighbourhoodTab({
  neighbourhoodDetails,
  priorities,
  neighbourhoodLoading,
}: NeighbourhoodTabProps) {
  return (
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
            <div key={idx} className="space-y-1.5 rounded-lg border p-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline">Priority</Badge>
                {p['issue-date'] && (
                  <span className="text-muted-foreground">
                    {p['issue-date'].slice(0, 10)}
                  </span>
                )}
              </div>
              <p className="font-medium leading-relaxed">{stripHtml(p.issue)}</p>
              {p.action && (
                <p className="leading-relaxed text-muted-foreground">
                  Action: {stripHtml(p.action)}
                </p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

