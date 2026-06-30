// Domain types + pure helpers for the FastForward dashboard.
// All numbers come from src/data/metrics.json (mock data, no backend).
import rawData from '@/data/metrics.json'

export type Severity = 'High' | 'Medium' | 'Low'

export interface PeriodMeta {
  id: string
  label: string
}

export interface RegionKpi {
  volume: number
  onTimeRate: number
  avgTransitDays: number
  prev: {
    volume: number
    onTimeRate: number
    avgTransitDays: number
  }
}

export interface TrendBucket {
  label: string
  byRegion: Record<string, number>
}

export interface ExceptionRecord {
  id: string
  region: string
  type: string
  severity: Severity
  ageDays: number
  status: string
  lane: string
}

export interface MetricsData {
  meta: {
    company: string
    generatedAt: string
    currency: string
    regions: string[]
    periods: PeriodMeta[]
    exceptionTypes: string[]
    exceptionPrevByRegion: Record<string, number>
  }
  kpisByPeriod: Record<string, Record<string, RegionKpi>>
  volumeTrend: Record<string, TrendBucket[]>
  exceptions: ExceptionRecord[]
}

export const data = rawData as MetricsData

export const ALL_REGIONS = 'All Regions'

/** Region options for the global filter (All Regions first). */
export function regionOptions(): string[] {
  return [ALL_REGIONS, ...data.meta.regions]
}

/** The concrete regions a filter value maps to. */
function regionsFor(region: string): string[] {
  return region === ALL_REGIONS ? data.meta.regions : [region]
}

/** KPI map for a period. The bundled dataset is complete, so this always resolves. */
function periodKpis(periodId: string): Record<string, RegionKpi> {
  return data.kpisByPeriod[periodId]!
}

/** KPI for a single region within a period. */
function kpiFor(periodId: string, region: string): RegionKpi {
  return periodKpis(periodId)[region]!
}

export type TrendDirection = 'up' | 'down' | 'flat'

export interface KpiTrend {
  direction: TrendDirection
  /** Display text for the delta, e.g. "+4.8%" or "-0.1 days". */
  text: string
  /** True when the movement is good for the business (drives green vs red). */
  positive: boolean
}

export interface Kpi {
  key: string
  label: string
  value: string
  unit: string
  icon: string
  trend: KpiTrend
  sparklinePoints: number[]
}

function direction(delta: number): TrendDirection {
  if (delta > 0) return 'up'
  if (delta < 0) return 'down'
  return 'flat'
}

function signed(value: number, digits = 0): string {
  const fixed = value.toFixed(digits)
  return value > 0 ? `+${fixed}` : fixed
}

/** Volume-weighted average of a metric across the selected regions. */
function weighted(
  regions: string[],
  periodId: string,
  pick: (kpi: RegionKpi) => number,
  weight: (kpi: RegionKpi) => number,
): number {
  let weightedSum = 0
  let weightTotal = 0
  for (const r of regions) {
    const kpi = kpiFor(periodId, r)
    weightedSum += pick(kpi) * weight(kpi)
    weightTotal += weight(kpi)
  }
  return weightTotal === 0 ? 0 : weightedSum / weightTotal
}

/**
 * Build a small trend series for a KPI sparkline. We only have a real
 * time-series for shipment volume, so for the other KPIs we interpolate from
 * the previous value to the current value and borrow the volume trend's shape
 * to add believable variation. The sparkline is min/max normalized when drawn,
 * so only the shape matters here.
 */
function sparklineSeries(
  volumeShape: number[],
  startValue: number,
  endValue: number,
): number[] {
  const n = volumeShape.length
  if (n < 2) return [startValue, endValue]

  const shapeMin = Math.min(...volumeShape)
  const shapeMax = Math.max(...volumeShape)
  const shapeRange = shapeMax - shapeMin || 1

  // Amplitude of the wiggle: a small fraction of the value so it reads as
  // subtle texture rather than noise. Falls back to the endValue for flat KPIs.
  const amplitude = (Math.abs(endValue - startValue) || Math.abs(endValue) * 0.06) * 0.6

  return volumeShape.map((v, i) => {
    const t = i / (n - 1)
    const base = startValue + (endValue - startValue) * t
    const wiggle = ((v - shapeMin) / shapeRange - 0.5) * amplitude
    return base + wiggle
  })
}

/** The four headline KPI cards for the active period + region filter. */
export function computeKpis(periodId: string, region: string): Kpi[] {
  const regions = regionsFor(region)

  const volume = regions.reduce((sum, r) => sum + kpiFor(periodId, r).volume, 0)
  const prevVolume = regions.reduce((sum, r) => sum + kpiFor(periodId, r).prev.volume, 0)
  const volumeDeltaPct = prevVolume === 0 ? 0 : ((volume - prevVolume) / prevVolume) * 100

  const onTime = weighted(regions, periodId, (k) => k.onTimeRate, (k) => k.volume)
  const prevOnTime = weighted(regions, periodId, (k) => k.prev.onTimeRate, (k) => k.prev.volume)
  const onTimeDelta = round1(onTime) - round1(prevOnTime)

  const transit = weighted(regions, periodId, (k) => k.avgTransitDays, (k) => k.volume)
  const prevTransit = weighted(regions, periodId, (k) => k.prev.avgTransitDays, (k) => k.prev.volume)
  const transitDelta = round1(transit) - round1(prevTransit)

  const openExceptions = filterExceptions(region).length
  const prevExceptions = regions.reduce(
    (sum, r) => sum + (data.meta.exceptionPrevByRegion[r] ?? 0),
    0,
  )
  const exceptionsDelta = openExceptions - prevExceptions

  // Real volume time-series drives the volume card and shapes the others.
  const buckets = data.volumeTrend[periodId] ?? []
  const volumeShape = buckets.map((bucket) =>
    regions.reduce((sum, r) => sum + (bucket.byRegion[r] ?? 0), 0),
  )

  return [
    {
      key: 'volume',
      label: 'Shipment Volume',
      value: volume.toLocaleString('en-US'),
      unit: '',
      icon: 'truck',
      trend: {
        direction: direction(volumeDeltaPct),
        text: `${signed(volumeDeltaPct, 1)}%`,
        positive: volumeDeltaPct >= 0,
      },
      sparklinePoints: volumeShape,
    },
    {
      key: 'onTime',
      label: 'On-Time Delivery',
      value: onTime.toFixed(1),
      unit: '%',
      icon: 'checkmark',
      trend: {
        direction: direction(onTimeDelta),
        text: `${signed(onTimeDelta, 1)} pp`,
        positive: onTimeDelta >= 0,
      },
      sparklinePoints: sparklineSeries(volumeShape, prevOnTime, onTime),
    },
    {
      key: 'transit',
      label: 'Avg Transit Time',
      value: transit.toFixed(1),
      unit: ' days',
      icon: 'time',
      trend: {
        direction: direction(transitDelta),
        text: `${signed(transitDelta, 1)} days`,
        // Faster (down or flat) is good.
        positive: transitDelta <= 0,
      },
      sparklinePoints: sparklineSeries(volumeShape, prevTransit, transit),
    },
    {
      key: 'exceptions',
      label: 'Open Exceptions',
      value: openExceptions.toLocaleString('en-US'),
      unit: '',
      icon: 'warning-alt',
      trend: {
        direction: direction(exceptionsDelta),
        text: `${signed(exceptionsDelta)} vs prev`,
        // Fewer (down or flat) is good.
        positive: exceptionsDelta <= 0,
      },
      sparklinePoints: sparklineSeries(volumeShape, prevExceptions, openExceptions),
    },
  ]
}

export interface RegionalRow {
  region: string
  volume: number
  onTimeRate: number
  avgTransitDays: number
  exceptions: number
  share: number
}

/** Per-region breakdown for the active period, sorted by volume desc. */
export function computeRegionalRows(periodId: string): RegionalRow[] {
  const totalVolume = data.meta.regions.reduce(
    (sum, r) => sum + kpiFor(periodId, r).volume,
    0,
  )

  return data.meta.regions
    .map((region) => {
      const kpi = kpiFor(periodId, region)
      return {
        region,
        volume: kpi.volume,
        onTimeRate: kpi.onTimeRate,
        avgTransitDays: kpi.avgTransitDays,
        exceptions: data.exceptions.filter((e) => e.region === region).length,
        share: totalVolume === 0 ? 0 : (kpi.volume / totalVolume) * 100,
      }
    })
    .sort((a, b) => b.volume - a.volume)
}

export interface TrendPoint {
  label: string
  value: number
}

/** Shipment-volume time series for the active period + region filter. */
export function computeTrend(periodId: string, region: string): TrendPoint[] {
  const regions = regionsFor(region)
  const buckets = data.volumeTrend[periodId] ?? []
  return buckets.map((bucket) => ({
    label: bucket.label,
    value: regions.reduce((sum, r) => sum + (bucket.byRegion[r] ?? 0), 0),
  }))
}

const severityRank: Record<Severity, number> = { High: 0, Medium: 1, Low: 2 }

/** Open exceptions for the active region, highest severity + oldest first. */
export function filterExceptions(region: string): ExceptionRecord[] {
  const rows =
    region === ALL_REGIONS
      ? data.exceptions
      : data.exceptions.filter((e) => e.region === region)

  return [...rows].sort(
    (a, b) => severityRank[a.severity] - severityRank[b.severity] || b.ageDays - a.ageDays,
  )
}

export function severityColor(severity: Severity): string {
  if (severity === 'High') return '#da1e28'
  if (severity === 'Medium') return '#f1c21b'
  return '#525252'
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}
