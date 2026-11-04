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

- Node.js 20.9 or newer
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

The app uses Clerk for authentication and Convex for data. Add the following values to your local `.env` file:

```env
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://your-instance.clerk.accounts.dev
```

For Cloudflare deployments, configure `VITE_CONVEX_URL` and `VITE_CLERK_PUBLISHABLE_KEY` as **build-time environment variables**. They are read by Vite while building; setting them only as Worker runtime variables after the build will not update the deployed client or server bundle. `VITE_CONVEX_URL` must point to the production Convex deployment.

Set `CLERK_SECRET_KEY` as a Cloudflare Worker secret for server-side Clerk authentication. Never expose it to client code. Configure Clerk's Convex integration and set `CLERK_JWT_ISSUER_DOMAIN` in the Convex development and production deployment environments; the value is the Frontend API URL shown in Clerk. For Vercel, configure the same Vite variables as build environment variables and `CLERK_SECRET_KEY` as a server-side secret.

After setting up Clerk, run `npx convex dev` to publish the Convex auth configuration for development. For production, run `npx convex deploy`.

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

Before deploying, make sure `VITE_CONVEX_URL` and `VITE_CLERK_PUBLISHABLE_KEY` are available to the production build. If deploying from a Cloudflare Git integration, add them to that project's build environment variables and trigger a new deployment. If deploying locally, make sure they are present in the environment used for the build/deploy command. Add `CLERK_SECRET_KEY` as a Worker secret in Cloudflare. Do not commit these values to the repository.

The app's production router throws during server rendering when `VITE_CONVEX_URL` is missing, which appears in the browser as a generic retry page. If the page still fails after configuring the variables and redeploying, inspect the Worker logs in Cloudflare for the underlying server error.

## Notes

- The app uses sample/mock agricultural data for some features and can be extended with real sensor, satellite, and weather APIs.
- Location-aware recommendations are based on user-selected or geolocated region data.
- The project is structured to support a full-stack product with a user-facing dashboard and backend services.

## License

This project does not currently include a license file. If needed, add an appropriate OSS license before publishing or distributing the project.
