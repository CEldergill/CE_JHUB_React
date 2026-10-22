import { useState } from 'react'
import { LandingPage } from '@/pages/landing'
import { MapPage } from '@/pages/map'
import { Navbar, type PageRoute } from '@shared/components'

export function App() {
  const [activePage, setActivePage] = useState<PageRoute>('landing')

  return (
    <div id="app-shell">
      <Navbar activePage={activePage} onNavigate={setActivePage} />
      {activePage === 'landing' ? (
        <LandingPage onOpenMap={() => setActivePage('map')} />
      ) : (
        <MapPage />
      )}
    </div>
  )
}
