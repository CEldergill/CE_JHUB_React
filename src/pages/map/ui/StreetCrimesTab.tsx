import { Loader2, Search } from 'lucide-react'
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from '@shared/components'
import type { StreetCrime } from '../model'

interface StreetCrimesTabProps {
  selectedDate: string
  selectedCategory: string
  categoryNameMap: Record<string, string>
  streetSearch: string
  onStreetSearchChange: (value: string) => void
  crimesLoading: boolean
  filteredCrimes: StreetCrime[]
  categoryBreakdown: [string, number][]
}

export function StreetCrimesTab({
  selectedDate,
  selectedCategory,
  categoryNameMap,
  streetSearch,
  onStreetSearchChange,
  crimesLoading,
  filteredCrimes,
  categoryBreakdown,
}: StreetCrimesTabProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">Recorded Street Incidents</CardTitle>
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
              onChange={(e) => onStreetSearchChange(e.target.value)}
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
                    const pct = Math.round((count / filteredCrimes.length) * 100)
                    return (
                      <div
                        key={catSlug}
                        className="flex flex-col gap-1 rounded-lg border p-2.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="truncate font-medium">
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
              <div className="flex max-h-96 flex-col gap-2 overflow-y-auto pr-1">
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
                      {crime.outcome_status?.category ?? 'No outcome recorded'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

