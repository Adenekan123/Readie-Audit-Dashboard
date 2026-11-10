# Readie Audit Dashboard

React and TypeScript dashboard for the Readie candidate integrity and interview audit portal.

## Getting started

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

## Tests

Run the unit tests once with `npm test`, or keep the test runner open while editing with `npm run test:watch`. Tests live in `tests/` and use Vitest with the same `@` source alias as the app.

## App structure

- Vite + React + TypeScript
- React Router routes for `/jobs/campaign/:campaignId` and `/jobs/room/:roomName`
- Vite SPA fallback serves the app shell for direct campaign and room URLs during development/preview; production hosting must rewrite those routes to `index.html`.
- Campaign overview with status totals, email search, sorting, pagination, and table/grid layouts
- Candidate transcript, identity verification, and proctoring views with the active tab in the URL
- TanStack Query provider and Axios client for API-backed data
- `react-data-table-component` for the candidate assessment table
- Tailwind CSS v4 and shadcn/ui configured; add components with `npx shadcn@latest add <component>`
- Feature folders group campaign and room-review pages with their model logic
- `src/api` contains raw backend calls; `src/hooks/custom` contains reusable query/mutation wrappers; `src/hooks/api` contains endpoint-specific hooks

The app opens the most recently viewed campaign, defaulting to campaign 119 on first launch. Use the campaign dropdown to switch among the documented test IDs and recently viewed campaigns. Candidate and room information comes from the Readie API.

## API foundation

- Configure `VITE_API_BASE_URL`, `VITE_API_MY_AUTHORIZATIONX`, and `VITE_API_AUTHORIZATION` in a local `.env` file using `.env.example` as a template.
- The header's Live/Local switch controls the data source. Live is the default; Local uses the isolated offline API adapter for campaigns 119, 120, 122, and 123, and the selection persists in browser storage.
- Vite proxies `/api` during development. `vercel.json` proxies `/api` to the Readie API on Vercel and rewrites client-side routes to `index.html`, so direct campaign and room URLs load after refresh. Configure the API credential variables in Vercel project settings for deployments.
- `src/api/client.ts` provides the shared Axios instance and sends `Content-Type: application/json`, `MyAuthorizationx`, and `Authorization: Basic ...` on requests.
- Raw request functions live in `src/api`. `useApiQuery` and `useApiMutation` in `src/hooks/custom` provide shared TanStack Query behavior, while endpoint-specific hooks in `src/hooks/api` call those request functions.
- `useGetCampaignJobs` fetches `campaignHACKATHON/{campaignId}`; `useGetRoomEvaluation` fetches a room's evaluation records. Campaign response mapping lives under `src/features/campaigns/model`.
- `PageLoader`, `InlineLoader`, `LoadingSpinner`, and `Skeleton` in `src/components/ui/loader.tsx` are reusable loading states for routes, controls, and data panels.
- The campaign dropdown stores recently opened IDs locally because the documented API does not provide a campaign-list endpoint.

Vite exposes `VITE_` values in the browser bundle. This matches the hackathon's direct-client API requirement; production credentials should be sent through a server-side proxy instead.
