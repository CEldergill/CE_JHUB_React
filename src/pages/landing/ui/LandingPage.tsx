import { useState } from 'react'
import Unitedkingdom from '@react-map/united-kingdom'

export function LandingPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  return (
    <main
      id="landing-page"
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem',
        boxSizing: 'border-box',
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.875rem', fontWeight: 700 }}>
          UK Interactive Map
        </h1>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '1rem' }}>
          {selectedRegion ? (
            <>
              Selected region: <strong style={{ color: '#38bdf8' }}>{selectedRegion}</strong>
            </>
          ) : (
            'Click a county or region on the map to select it'
          )}
        </p>
      </header>

      <section
        style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
        }}
      >
        <Unitedkingdom
          type="select-single"
          size={520}
          mapColor="#334155"
          strokeColor="#0f172a"
          strokeWidth={0.8}
          hoverColor="#38bdf8"
          selectColor="#0284c7"
          hints={true}
          hintTextColor="#f8fafc"
          hintBackgroundColor="#0f172a"
          onSelect={(state) => setSelectedRegion(state)}
        />
      </section>
    </main>
  )
}
