# TerraBites

TerraBites is a location-aware farm weather and crop-suitability app. It uses
live and archived Open-Meteo data, a transparent rule-based crop comparison,
and a server-side Cloudflare Workers AI assistant.

## What is live

- Current conditions and a seven-day forecast from Open-Meteo.
- Historical temperature, precipitation, and modelled 0–7 cm soil moisture.
- Recent NASA POWER gridded temperature, precipitation, and solar estimates,
  also provided to Siesta as additional context.
- A five-day NASA GEOS-CF temperature and precipitation outlook.
- Optional NASA GIBS VIIRS NDVI vegetation and SMAP surface-soil-moisture
  image layers on the farm map.
- Browser GPS or Open-Meteo place search, with the selected location saved in
  the current browser.
- Crop suitability calculated from the forecast, farmer-entered soil
  information (or a labelled general estimate), and selected priorities.
- A reference catalog of global crops; the default crop picks show the best
  weather- and soil-ranked options for the selected farm location.
- Cloudflare Workers AI answers using the prompt and weather data when available.

Weather and soil-moisture values are gridded model/reanalysis data, not
measurements from sensors on a farm. The crop catalog contains general
reference traits and suitability is heuristic, not a calibrated yield
probability. Recommendations are not yield guarantees or planting-date
predictions. NASA POWER values are gridded satellite/model estimates, not
farm sensors, forecasts, or vegetation-health measurements. The NASA GIBS
VIIRS NDVI and SMAP soil-moisture layers are visual context only, not field-level
crop-health or soil measurements. Crop rankings use broad reference traits and
local forecast inputs; they do not represent verified seed availability in a
country or region. NASA GEOS-CF forecasts are coarse global research-model
estimates, not official weather warnings or field-level predictions. The app
does not provide pest reports, market prices, push notifications, or
cross-device farm-profile sync.

## Stack

- React 19, TypeScript, TanStack Start/Router, and Vite
- Convex and Clerk for account authentication
- Cloudflare Workers / Wrangler
- Open-Meteo Forecast, Archive, and Geocoding APIs (no API key)
- NASA POWER, NASA GEOS-CF, and NASA GIBS / EOSDIS (no API key)
- Cloudflare Workers AI (10,000 Neurons per day included at no charge)

## Local development

Requirements: Node.js 20.9+, npm or pnpm, a Convex deployment, and Clerk
credentials. Install packages and configure the build-time variables:

```env
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

Set the Clerk server secret in `.dev.vars` for local Cloudflare development.
Workers AI uses the configured Cloudflare binding and does not need a separate
AI API key:

```env
CLERK_SECRET_KEY=sk_test_...
```

Copy `.dev.vars.example` and replace its placeholder values. `.dev.vars` is
git-ignored.

Configure Clerk's Convex JWT issuer domain in the Convex environment as
`CLERK_JWT_ISSUER_DOMAIN`, then publish the Convex auth configuration:

```bash
npx convex dev
npm run dev
```

Sign in to use Siesta. Workers AI calls use the account's free daily allocation
of 10,000 Neurons; local development also calls Cloudflare and uses this
allocation. Exceeding the free allocation requires the Workers Paid plan.

## Production deployment

1. Configure a production Convex deployment and Clerk instance. Set
   `CLERK_JWT_ISSUER_DOMAIN` in the Convex production environment and run
   `npx convex deploy`.
2. Provide `VITE_CONVEX_URL` and `VITE_CLERK_PUBLISHABLE_KEY` as Cloudflare
   **build-time** variables.
3. Configure server-only Worker secrets:

   ```bash
   npx wrangler secret put CLERK_SECRET_KEY
   ```

4. Build and deploy:

   ```bash
   npm run build
   npx wrangler deploy
   ```

Never put private keys in `VITE_*` variables or commit `.dev.vars`. Farm
location, profile, preferences, and soil entries are currently stored in
browser local storage; authentication records are managed by Convex.

## Checks

```bash
npm run typecheck
npm test
npm run lint
npm run build
```
