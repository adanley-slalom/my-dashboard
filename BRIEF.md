# BRIEF.md — FastForward Logistics Executive Dashboard

## Summary

**Client:** FastForward Logistics — a mid-size freight and supply chain company.

**Stakeholder:** VP of Operations.

**Problem:** The operations team runs the business out of scattered spreadsheets.
There is no single, trustworthy view of how the business is performing. Leadership
meetings waste time reconciling numbers instead of making decisions.

**Goal:** Ship a single internal **executive dashboard** the VP can pull up live in
leadership meetings to answer, at a glance: *Are we shipping enough, on time, in the
right regions, and what's on fire right now?*

**Audience:** Executives and ops leadership. Non-technical. Reading the screen on a
projector or a shared laptop. Clarity and scannability beat density.

**Success looks like:** In under 10 seconds, a viewer can read the four headline
numbers, spot whether each is trending up or down, see which regions are strong or
weak, and identify the open exceptions that need attention.

---

## Design

### Information architecture (top to bottom)

1. **App bar / header** — Product name "FastForward Ops", a subtitle, and the
   global **interactive filters** (region + time period).
2. **KPI row** — Four headline metric cards (the most important numbers):
   - Shipment Volume (count for the period)
   - On-Time Delivery Rate (%)
   - Average Transit Time (days)
   - Open Exceptions (count)
   Each card shows a label, a big value, and a trend indicator (direction + delta vs.
   the previous period).
3. **Regional performance** — A panel breaking down volume and on-time rate by
   region (Northeast, Southeast, Midwest, West, Southwest). Sortable/scannable so the
   VP can see leaders and laggards.
4. **Shipment volume trend** — A simple time series (last several periods) so the
   conversation can move from "what" to "is it getting better."
5. **Open exceptions table** — The live worklist: shipment ID, region, type
   (Delayed, Damaged, Lost, Customs Hold, Address Issue), severity, and age. This is
   the "what needs attention now" section.

### Layout & behavior

- **Responsive grid.** KPI cards sit 4-across on desktop, stacking gracefully on
  smaller screens.
- **Filters drive everything.** Changing region or time period recomputes the KPI
  cards, the regional panel, the trend, and the exceptions list.
- **Consistent card pattern.** Every section is a card with a clear title so the
  page reads as a set of discrete, labeled answers.

### Style

- Clean, corporate, calm. Light surface, generous whitespace, strong typographic
  hierarchy (big KPI numbers).
- A restrained brand palette: a deep blue primary with semantic accents —
  **green = good / up**, **amber = watch**, **red = bad / down / high severity**.
- Material Design via **Vuetify 3** for a professional, consistent look without
  hand-rolling components.

---

## Data

- All data is **mock / fake** for the prototype, stored as a static JSON file at
  `src/data/metrics.json` and loaded at runtime. No backend.
- Numbers must be **realistic** for a mid-size freight company (thousands of
  shipments per period, on-time rates in the high 80s–90s%, a believable spread of
  exceptions).
- Shape of the dataset:
  - `meta` — company name, the available regions, and the available time periods.
  - `periods` — for each time period, per-region KPI values (volume, on-time rate,
    avg transit days, exceptions) plus a previous-period comparison so cards can show
    trend deltas.
  - `volumeTrend` — a short series of shipment volume per period, per region, for the
    trend chart.
  - `exceptions` — a list of open exception records (id, region, type, severity,
    ageDays, status).

---

## Interactions

- **Region filter** (All Regions + each region) — global control in the app bar.
- **Time period filter** (e.g., Last 7 / 30 / 90 days) — global control in the app
  bar.
- Selecting a filter updates **every** section reactively (KPIs, regional panel,
  trend, exceptions).
- Exceptions list reflects the active region filter.

---

## Tech

- **Framework:** Vue 3 (`<script setup>` + TypeScript)
- **Build tool:** Vite
- **Routing:** Vue Router (single dashboard route for now; structured to grow)
- **Component library:** Vuetify 3 (+ Material Design Icons)
- **State:** Local component state + computed properties driven by the JSON data
  (no Pinia, no testing, no JSX, no ESLint/Prettier per project constraints)
- **Deploy target:** Vercel (static SPA build)

---

## Nice to Haves (future, not required for the prototype)

- Real data source / API instead of static JSON.
- Drill-down from a region into its shipments.
- Charts library upgrade (interactive tooltips, multiple series).
- Export to PDF / "present mode" for meetings.
- Password protection on the deployed URL.
- Alerting when exceptions cross a severity/age threshold.

---

## Build instructions for Copilot

1. Read this brief and treat it as the source of truth for scope and layout.
2. Generate `src/data/metrics.json` matching the **Data** shape above with realistic
   fake numbers.
3. Build the dashboard described in **Design** using Vuetify 3 components (app bar,
   cards, grid, table, selects).
4. Extract the repeated metric tile into a reusable **`MetricCard`** component with
   props for `label`, `value`, and `trend` (direction + delta).
5. Wire the **region** and **time period** filters so they reactively update every
   section.
6. Replace the Vue starter content entirely; the app should open directly on the
   FastForward dashboard.
