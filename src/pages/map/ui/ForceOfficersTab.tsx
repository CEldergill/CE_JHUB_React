import { Shield, Users } from 'lucide-react'
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
  type ForceOfficer,
  type PoliceForceDetails,
} from '../model'

interface ForceOfficersTabProps {
  forceDetails: PoliceForceDetails | null
  officers: ForceOfficer[]
}

export function ForceOfficersTab({
  forceDetails,
  officers,
}: ForceOfficersTabProps) {
  return (
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
              <div key={idx} className="space-y-1 rounded-lg border p-3 text-xs">
                <div className="font-semibold">{officer.name}</div>
                <Badge variant="secondary" className="text-[10px]">
                  {officer.rank}
                </Badge>
                {officer.bio && (
                  <p className="line-clamp-3 pt-1 leading-relaxed text-muted-foreground">
                    {stripHtml(officer.bio)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

