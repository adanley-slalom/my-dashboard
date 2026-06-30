# FastForward Ops — Executive Dashboard

An internal executive dashboard prototype for the (fictional) **FastForward Logistics**
operations team. It gives the VP of Operations a single, scannable view of shipment
volume, on-time delivery, regional performance, and open exceptions for leadership
meetings.

See [BRIEF.md](BRIEF.md) for the full design spec (the source of truth for scope).

## Features

- **Executive KPI Dashboard** — Real-time overview of key performance indicators including on-time delivery rate, average shipment value, and monthly revenue
- **Shipment Volume Trends** — Interactive chart visualizing shipment volume over time with clear trend indicators
- **Regional Performance Matrix** — Multi-region breakdown showing on-time delivery, average shipment value, and volume by region
- **Open Exceptions Tracking** — Dedicated table for monitoring active issues and exceptions across the operations network
- **Dynamic Filtering** — Region and time period filters to drill down into specific operational areas and time windows
- **Exportable CSV** — Download filtered metrics and performance data as CSV that dynamically updates based on Region and Period selections
- **Responsive Design** — Clean, scannable layout optimized for executive leadership meetings and quick decision-making
- **Mock Data Integration** — Pre-populated with realistic operations metrics for prototype and demo purposes

## Tech stack

- Vue 3 (`<script setup>` + TypeScript) + Vite
- Vue Router
- Vuetify 3 (+ Material Design Icons)
- Mock data in [src/data/metrics.json](src/data/metrics.json) — no backend

## Key files

- `src/views/DashboardView.vue` — page layout + global region/period filters
- `src/components/MetricCard.vue` — reusable KPI tile (props: `label`, `value`, `trend`, …)
- `src/components/RegionalPerformance.vue` / `VolumeTrendChart.vue` / `ExceptionsTable.vue`
- `src/lib/metrics.ts` — types + pure functions that compute KPIs/trend from the data

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```
