import { Shield, Home, Map } from 'lucide-react'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from './ui/navigation-menu'
import { Badge } from './ui/badge'
import { cn } from '@shared/lib/utils'

export type PageRoute = 'landing' | 'map'

interface NavbarProps {
  activePage: PageRoute
  onNavigate: (page: PageRoute) => void
}

export function Navbar({ activePage, onNavigate }: NavbarProps) {
  const navItems: { id: PageRoute; path: string; label: string; icon: typeof Home }[] = [
    { id: 'landing', path: '/', label: 'Overview', icon: Home },
    { id: 'map', path: '/map', label: 'Interactive Map', icon: Map },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault()
            onNavigate('landing')
          }}
          className="flex items-center gap-2.5 text-left transition-opacity hover:opacity-80 cursor-pointer"
        >
          <div className="flex size-8 items-center justify-center rounded-md border bg-secondary text-foreground">
            <Shield className="size-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            UK Crime Map
          </span>
          <Badge variant="outline" className="hidden sm:inline-flex text-[10px]">
            data.police.uk
          </Badge>
        </a>

        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.id
              return (
                <NavigationMenuItem key={item.id}>
                  <NavigationMenuLink
                    href={item.path}
                    active={isActive}
                    onClick={(e) => {
                      e.preventDefault()
                      onNavigate(item.id)
                    }}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      'flex-row items-center gap-2 h-8 px-3 text-xs',
                    )}
                  >
                    <Icon className="size-3.5" />
                    <span>{item.label}</span>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  )
}
