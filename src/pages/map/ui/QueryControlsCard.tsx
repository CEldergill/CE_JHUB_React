import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from '@shared/components'
import type {
  CrimeCategory,
  NeighbourhoodSummary,
  PoliceForceSummary,
} from '../model'

interface QueryControlsCardProps {
  forces: PoliceForceSummary[]
  neighbourhoods: NeighbourhoodSummary[]
  categories: CrimeCategory[]
  availableDates: string[]
  selectedForceId: string
  selectedNeighbourhoodId: string
  selectedCategory: string
  selectedDate: string
  isBusy: boolean
  onSelectForce: (forceId: string) => void
  onSelectNeighbourhood: (hoodId: string) => void
  onSelectCategory: (category: string) => void
  onSelectDate: (date: string) => void
}

export function QueryControlsCard({
  forces,
  neighbourhoods,
  categories,
  availableDates,
  selectedForceId,
  selectedNeighbourhoodId,
  selectedCategory,
  selectedDate,
  isBusy,
  onSelectForce,
  onSelectNeighbourhood,
  onSelectCategory,
  onSelectDate,
}: QueryControlsCardProps) {
  return (
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
            onChange={(e) => onSelectForce(e.target.value)}
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
            onChange={(e) => onSelectNeighbourhood(e.target.value)}
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
              onChange={(e) => onSelectCategory(e.target.value)}
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
              onChange={(e) => onSelectDate(e.target.value)}
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
  )
}

