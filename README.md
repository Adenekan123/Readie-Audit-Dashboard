# Readie Audit Dashboard

React and TypeScript dashboard for the Readie candidate integrity and interview audit portal.

## Getting started

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

## App structure

- Vite + React + TypeScript
- React Router routes for `/jobs/campaign/:campaignId` and `/jobs/room/:roomName`
- Campaign overview with status totals, email search, sorting, pagination, and table/grid layouts
- Candidate transcript, identity verification, and proctoring views with the active tab in the URL
- TanStack Query provider ready for API data
- Axios and `react-data-table-component` installed for the API-backed implementation
- Tailwind CSS v4 and shadcn/ui configured; add components with `npx shadcn@latest add <component>`

The dashboard currently uses local sample sessions that follow the supplied visual reference.
