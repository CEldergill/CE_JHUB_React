import { ArrowRight, MapPin, ShieldCheck, Activity } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
} from '@shared/components'

interface LandingPageProps {
  onOpenMap: () => void
}

export function LandingPage({ onOpenMap }: LandingPageProps) {
  return (
    <main
      id="landing-page"
      className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-5xl flex-col justify-center gap-6 px-4 py-10 sm:px-6"
    >
      <Card>
        <CardHeader className="gap-2">
          <Badge variant="secondary" className="mb-1">
            England, Wales &amp; Northern Ireland
          </Badge>
          <CardTitle className="text-3xl font-bold tracking-tight sm:text-4xl">
            UK Crime Map
          </CardTitle>
          <CardDescription className="max-w-2xl text-base leading-relaxed">
            Browse regional police forces, neighbourhood teams, and monthly street-level crime
            reports across the UK using public data from{' '}
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-xs">
              data.police.uk
            </code>
            .
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardFooter className="flex items-center justify-between pt-6">
          <span className="text-xs text-muted-foreground">
            Source: Police.uk Open Data
          </span>
          <Button onClick={onOpenMap}>
            Open Map
            <ArrowRight className="size-4" />
          </Button>
        </CardFooter>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <MapPin className="size-4 text-muted-foreground mb-1" />
            <CardTitle className="text-base">Regional Forces</CardTitle>
            <CardDescription>
              Select a county on the map to view the local police force, contact details, and
              senior officers.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <ShieldCheck className="size-4 text-muted-foreground mb-1" />
            <CardTitle className="text-base">Neighbourhoods</CardTitle>
            <CardDescription>
              Drill down into specific policing neighbourhoods to see local priorities and community
              events.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Activity className="size-4 text-muted-foreground mb-1" />
            <CardTitle className="text-base">Street Crime</CardTitle>
            <CardDescription>
              Filter recorded offences and investigation outcomes by category and month.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </main>
  )
}
