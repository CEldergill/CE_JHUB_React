import { useCallback, useEffect, useState } from 'react'
import { LandingPage } from '@/pages/landing'
import { MapPage } from '@/pages/map'
import { Navbar, type PageRoute } from '@shared/components'

const ROUTE_PATHS: Record<PageRoute, string> = {
  landing: '/',
  map: '/map',
}

function getPageFromPathname(pathname: string): PageRoute {
  return pathname.startsWith('/map') ? 'map' : 'landing'
}

export function App() {
  const [activePage, setActivePage] = useState<PageRoute>(() =>
    getPageFromPathname(window.location.pathname),
  )

  const navigate = useCallback((page: PageRoute) => {
    const targetPath = ROUTE_PATHS[page]
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath)
    }
    setActivePage(page)
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      setActivePage(getPageFromPathname(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  return (
    <div id="app-shell">
      <Navbar activePage={activePage} onNavigate={navigate} />
      {activePage === 'landing' ? (
        <LandingPage onOpenMap={() => navigate('map')} />
      ) : (
        <MapPage />
      )}
    </div>
  )
}
