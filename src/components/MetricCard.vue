<script setup lang="ts">
import { computed } from 'vue'
import type { KpiTrend } from '@/lib/metrics'

const props = defineProps<{
  label: string
  value: string
  unit?: string
  icon: string
  trend?: KpiTrend | null
  sparklinePoints?: number[]
}>()

const trendIcon = computed(() => {
  if (!props.trend || props.trend.direction === 'flat') return '→'
  return props.trend.direction === 'up' ? '↑' : '↓'
})

const trendColor = computed(() => {
  if (!props.trend || props.trend.direction === 'flat') return '#525252'
  return props.trend.positive ? '#24a148' : '#da1e28'
})

// Build the smooth curve (Catmull-Rom spline) shared by the line and area.
const sparklineCurve = computed(() => {
  const points = props.sparklinePoints || []
  if (points.length === 0) return null

  const maxV = Math.max(...points)
  const minV = Math.min(...points)
  const range = maxV - minV || 1

  const w = 100
  const h = 50
  const topPad = 4 // keep the peak from touching the very top

  const coords = points.map((v, i) => ({
    x: (i / (points.length - 1 || 1)) * w,
    y: topPad + (1 - (v - minV) / range) * (h - topPad),
  }))

  const first = coords[0]
  const last = coords[coords.length - 1]
  if (!first || !last) return null

  // The open line path (no baseline closure)
  let line = `M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`

  if (coords.length < 3) {
    line += ` L ${last.x.toFixed(2)} ${last.y.toFixed(2)}`
  } else {
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i - 1] ?? coords[i]!
      const p1 = coords[i]!
      const p2 = coords[i + 1]!
      const p3 = coords[i + 2] ?? coords[i + 1]!

      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6

      line += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
    }
  }

  return { line, first, last, h }
})

// Open line path drawn on top of the fill
const sparklineLinePath = computed(() => sparklineCurve.value?.line ?? '')

// Closed area path for the gradient fill
const sparklineAreaPath = computed(() => {
  const curve = sparklineCurve.value
  if (!curve) return ''
  return `${curve.line} L ${curve.last.x.toFixed(2)} ${curve.h} L ${curve.first.x.toFixed(2)} ${curve.h} Z`
})
</script>

<template>
  <div class="metric-card">
    <div class="card-header">
      <span class="label">{{ label }}</span>
    </div>
    <div class="card-content">
      <div class="value-group">
        <span class="value">{{ value }}</span>
        <span v-if="unit" class="unit">{{ unit }}</span>
      </div>
      <div v-if="trend" class="trend" :style="{ color: trendColor }">
        <span style="display: inline; margin-right: 4px">{{ trendIcon }}</span>
        <span>{{ trend.text }}</span>
      </div>
    </div>
    <!-- Sparkline area chart -->
    <svg
      v-if="props.sparklinePoints && props.sparklinePoints.length > 0"
      class="sparkline"
      viewBox="0 0 100 50"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color: #0f62fe; stop-opacity: 0.3" />
          <stop offset="100%" style="stop-color: #0f62fe; stop-opacity: 0.05" />
        </linearGradient>
      </defs>
      <path :d="sparklineAreaPath" fill="url(#sparklineGradient)" />
      <path :d="sparklineLinePath" class="sparkline-line" />
    </svg>
  </div>
</template>

<style lang="scss" scoped>
@use '@carbon/type' as type;

.metric-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 0;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.metric-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  border-color: #0f62fe;
}

.card-header {
  margin-bottom: 16px;
}

.label {
  @include type.type-style('label-01');
  color: #525252;
  text-transform: uppercase;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.value-group {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 12px;
}

.value {
  font-size: 32px;
  font-weight: 700;
  color: #161616;
  line-height: 40px;
  letter-spacing: 0;
}

.unit {
  @include type.type-style('body-compact-01');
  color: #525252;
}

.trend {
  @include type.type-style('label-01');
  font-size: 14px !important;
  display: flex;
  align-items: center;
  gap: 4px;
}

.sparkline {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 50%;
  height: 100px;
  z-index: 0;
  pointer-events: none;
}

.sparkline-line {
  fill: none;
  stroke: #0f62fe;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}
</style>
