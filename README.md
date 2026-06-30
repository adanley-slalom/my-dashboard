

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
