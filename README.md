# TerraBites

TerraBites is a location-aware farm intelligence dashboard for growers and agribusiness users. It helps people understand field conditions, climate signals, crop suitability, and recommended actions using a clean mobile-friendly interface.

The app combines a modern React frontend with a Convex backend and is configured for deployment on Cloudflare Workers via Wrangler.

## Overview

TerraBites gives users the ability to:

- view local field conditions and farm health metrics
- allow location access for region-specific crop recommendations
- monitor rainfall, temperature, and other environmental signals
- explore recommended crops for their area
- receive farm alerts and actionable insights
- review plant health and satellite-informed conditions
- sign in and manage a personalized farm profile

## Features

- Farm dashboard with personalized greeting and status cards
- GPS-based or manual location selection for region-aware recommendations
- Crop recommendation cards based on local conditions
- Alert panels for weather and farm issues
- Insights page for plant health and climate context
- Profile management and user session flow
- Responsive UI built for desktop and mobile use
- Cloudflare Worker deployment support

## Tech Stack

- React 19
- TanStack Router and TanStack Start
- TypeScript
- Vite
- Convex
- Tailwind CSS
- Cloudflare Workers / Wrangler
- Vitest for testing
- ESLint + Prettier for code quality

## Project Structure

```text
TerraBites/
├── convex/               # Convex backend and schema
├── public/               # Static assets
├── src/                  # Frontend app and routes
├── .gitignore
├── convex.json           # Convex config
├── package.json          # Scripts and dependencies
├── pnpm-workspace.yaml   # pnpm workspace config
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite config
├── vitest.config.ts      # Test config
├── wrangler.jsonc        # Cloudflare Worker config
└── README.md             # Project documentation
```

## Prerequisites

Before running the app locally, make sure you have:

- Node.js 18+ or newer
- pnpm
- a Convex account and project setup
- a Cloudflare account if you want to deploy to Workers

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Start the Convex backend:

```bash
npx convex dev
```

3. Start the app:

```bash
pnpm dev
```

4. Open the local app in your browser. The default development URL is usually:

```text
http://localhost:3000
```

## Environment Variables

This project expects a Convex URL in the frontend environment. Create a `.env` file or configure your local environment with values similar to:

```env
VITE_CONVEX_URL=http://localhost:3000
HERCULES_AUTH_REDIRECT_URI=http://localhost:3000/auth/callback
```

For production, set these to your deployed Convex URL and the public callback endpoint for authentication.

## Available Scripts

```bash
pnpm dev           # Run the local app
pnpm build         # Build the app for production
pnpm preview       # Preview production build locally
pnpm test          # Run Vitest tests
pnpm lint          # Lint the project
pnpm typecheck     # Type-check app and Convex code
pnpm prettier-fix  # Auto-format files with Prettier
```

## Deployment

This project is configured for Cloudflare Workers via `wrangler.jsonc` and uses a `src/server.ts` entry point. To deploy:

```bash
npx wrangler deploy
```

If you are using Convex in production, make sure the frontend `VITE_CONVEX_URL` points to the live Convex deployment.

## Notes

- The app uses sample/mock agricultural data for some features and can be extended with real sensor, satellite, and weather APIs.
- Location-aware recommendations are based on user-selected or geolocated region data.
- The project is structured to support a full-stack product with a user-facing dashboard and backend services.

## License

This project does not currently include a license file. If needed, add an appropriate OSS license before publishing or distributing the project.
