# UK Crime Map

Interactive web application for exploring territorial policing data across England, Wales, and Northern Ireland using the [UK Police Data API](https://data.police.uk/docs/).

## Overview

UK Crime Map provides an interactive regional map alongside query controls to inspect force profiles, neighbourhood policing boundaries, local priorities, senior officers, and monthly street-level crime incidents.

### Key Features

- **Interactive UK Map & Force Selector**: Select regions directly on the map or choose from all 44 territorial police forces via the query controls, with two-way visual synchronisation.
- **Neighbourhood & Boundary Inspection**: Browse neighbourhood policing areas within a selected force to resolve central coordinates and view local contact links.
- **Street-Level Crime Explorer**: Filter monthly street-level incident records by offence category, reporting month, and street/outcome search terms.
- **Local Priorities & Senior Officers**: View published neighbourhood policing priorities and senior force leadership profiles.
- **Rate-Limited & Cached API Client**: Serialised request queue with post-request cooldowns, automatic retry on HTTP `429`, and in-memory + `sessionStorage` caching for responsive navigation.

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vite.dev/)
- **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives), and [Lucide Icons](https://lucide.dev/)
- **Map Visualisation**: [`@react-map/united-kingdom`](https://www.npmjs.com/package/@react-map/united-kingdom)
- **Data Source**: [UK Police API (`https://data.police.uk/api`)](https://data.police.uk/docs/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended) and `npm`

### Installation & Development

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`) in your browser.

### Available Scripts

```bash
npm run dev      # Start the Vite development server
npm run build    # Type-check with TypeScript and build for production
npm run lint     # Lint source files with Oxlint
npm run preview  # Preview the production build locally
```

## API Endpoints Used

All data is fetched live over HTTPS from `https://data.police.uk/api`:

| Endpoint | Purpose |
| :--- | :--- |
| `GET /forces` | List all territorial police forces |
| `GET /crimes-street-dates` | List available monthly reporting periods |
| `GET /crime-categories?date={date}` | List offence categories for a reporting period |
| `GET /forces/{forceId}` | Retrieve force summary, description, and contact channels |
| `GET /forces/{forceId}/people` | Retrieve senior officers for a force |
| `GET /{forceId}/neighbourhoods` | List neighbourhoods within a force boundary |
| `GET /{forceId}/{neighbourhoodId}` | Retrieve neighbourhood centre coordinates (`lat`/`lng`) and links |
| `GET /{forceId}/{neighbourhoodId}/priorities` | Retrieve local neighbourhood policing priorities |
| `GET /crimes-street/{category}?lat={lat}&lng={lng}&date={date}` | Retrieve street-level crimes and outcomes around a location |

## Project Structure

```text
src/
├── pages/
│   ├── landing/          # Overview page with live API status and entry navigation
│   │   ├── api/
│   │   ├── model/
│   │   └── ui/
│   └── map/              # Interactive UK map and Police API explorer
│       ├── api/
│       ├── model/
│       └── ui/
├── shared/
│   ├── api/              # Rate-limited, cached fetch client for data.police.uk
│   ├── components/       # Shared Navbar and shadcn/ui primitives
│   ├── config/           # API base URL configuration
│   └── lib/              # Classname merge utility (cn)
├── App.tsx               # Root application component & page router
└── main.tsx              # Application entry point
```
