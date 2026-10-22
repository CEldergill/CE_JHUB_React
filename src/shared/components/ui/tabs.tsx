import * as React from 'react'
import { cn } from '@shared/lib/utils'

interface TabsContextValue {
  value: string
  onValueChange: (val: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  defaultValue: string
  value?: string
  onValueChange?: (val: string) => void
}) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const value = controlledValue ?? uncontrolledValue

  const handleValueChange = React.useCallback(
    (next: string) => {
      setUncontrolledValue(next)
      onValueChange?.(next)
    },
    [onValueChange],
  )

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div data-slot="tabs" className={cn('flex flex-col gap-2', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

function TabsList({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="tabs-list"
      role="tablist"
      className={cn(
        'bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-1',
        className,
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  value,
  className,
  ...props
}: React.ComponentProps<'button'> & { value: string }) {
  const ctx = React.useContext(TabsContext)
  const isActive = ctx?.value === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? 'active' : 'inactive'}
      onClick={() => ctx?.onValueChange(value)}
      className={cn(
        'data-[state=active]:bg-background data-[state=active]:text-foreground focus-visible:ring-ring/50 inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm cursor-pointer',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({
  value,
  className,
  ...props
}: React.ComponentProps<'div'> & { value: string }) {
  const ctx = React.useContext(TabsContext)
  if (ctx?.value !== value) return null

  return (
    <div
      data-slot="tabs-content"
      role="tabpanel"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }

