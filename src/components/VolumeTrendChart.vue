<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { TrendPoint } from '@/lib/metrics'

const props = defineProps<{
  points: TrendPoint[]
  periodLabel: string
}>()

const hoveredIndex = ref<number | null>(null)
const tooltipPos = ref<{ x: number; y: number } | null>(null)
const svgRef = ref<SVGSVGElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

const maxValue = computed(() => Math.max(1, ...props.points.map(p => p.value)))
const minValue = computed(() => Math.min(...props.points.map(p => p.value)))
const range = computed(() => Math.max(1, maxValue.value - minValue.value))

// SVG Chart dimensions
const chartWidth = 620
const chartHeight = 280
const padding = { top: 24, right: 24, bottom: 48, left: 56 }
const plotWidth = chartWidth - padding.left - padding.right
const plotHeight = chartHeight - padding.top - padding.bottom

// Calculate point positions
const plotPoints = computed(() => {
  return props.points.map((point, index) => {
    const x = padding.left + (index / Math.max(1, props.points.length - 1)) * plotWidth
    const normalizedValue = (point.value - minValue.value) / range.value
    const y = padding.top + plotHeight - normalizedValue * plotHeight
    return { x, y, ...point }
  })
})

// Handle hover and position tooltip
const onPointHover = (index: number) => {
  hoveredIndex.value = index
  
  if (!svgRef.value || !containerRef.value) return
  
  // Get the plot point in SVG coordinates
  const point = plotPoints.value[index]
  if (!point) return
  
  // Calculate scale factor between viewBox and rendered size
  const svgRect = svgRef.value.getBoundingClientRect()
  const containerRect = containerRef.value.getBoundingClientRect()
  const scaleX = svgRect.width / chartWidth
  const scaleY = svgRect.height / chartHeight
  
  // Convert SVG coordinates to rendered pixels
  const renderedX = point.x * scaleX
  const renderedY = point.y * scaleY
  
  // Calculate offset of SVG relative to container (accounting for padding)
  const svgOffsetLeft = svgRect.left - containerRect.left
  const svgOffsetTop = svgRect.top - containerRect.top
  
  // Position relative to container
  const x = svgOffsetLeft + renderedX
  const y = svgOffsetTop + renderedY
  
  tooltipPos.value = { x, y }
}

const onPointLeave = () => {
  hoveredIndex.value = null
  tooltipPos.value = null
}

const getTooltipStyle = () => {
  if (!tooltipPos.value) return {}
  const x = tooltipPos.value.x
  const y = tooltipPos.value.y
  // Position tooltip above the data point with 10px gap
  // Subtract the tooltip height (58px) + desired gap (10px) for proper positioning above
  return {
    left: `${x}px`,
    top: `${y - 168}px`,
    transform: 'translateX(-50%)'
  }
}

// SVG path for line with smooth curves (Catmull-Rom spline)
const linePath = computed(() => {
  const points = plotPoints.value
  if (points.length === 0) return ''
  
  const firstPoint = points[0]
  if (!firstPoint) return ''
  if (points.length === 1) return `M ${firstPoint.x} ${firstPoint.y}`
  
  const secondPoint = points[1]
  if (!secondPoint) return `M ${firstPoint.x} ${firstPoint.y}`
  if (points.length === 2) return `M ${firstPoint.x} ${firstPoint.y} L ${secondPoint.x} ${secondPoint.y}`
  
  // Generate smooth curve using Catmull-Rom spline
  let path = `M ${firstPoint.x} ${firstPoint.y}`
  
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = i < points.length - 2 ? points[i + 2] : points[i + 1]
    
    if (!p0 || !p1 || !p2 || !p3) continue
    
    // Catmull-Rom control points
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    
    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  
  return path
})

// SVG path for area fill (Catmull-Rom spline)
const areaPath = computed(() => {
  const points = plotPoints.value
  if (points.length === 0) return ''
  
  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]
  
  if (!firstPoint || !lastPoint) return ''
  if (points.length === 1) return `M ${firstPoint.x} ${firstPoint.y} L ${firstPoint.x} ${padding.top + plotHeight} Z`
  
  const secondPoint = points[1]
  if (!secondPoint) return `M ${firstPoint.x} ${firstPoint.y} L ${lastPoint.x} ${lastPoint.y} L ${lastPoint.x} ${padding.top + plotHeight} L ${firstPoint.x} ${padding.top + plotHeight} Z`
  if (points.length === 2) return `M ${firstPoint.x} ${firstPoint.y} L ${secondPoint.x} ${secondPoint.y} L ${lastPoint.x} ${padding.top + plotHeight} L ${firstPoint.x} ${padding.top + plotHeight} Z`
  
  // Generate smooth curve using Catmull-Rom spline
  let path = `M ${firstPoint.x} ${firstPoint.y}`
  
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = i < points.length - 2 ? points[i + 2] : points[i + 1]
    
    if (!p0 || !p1 || !p2 || !p3) continue
    
    // Catmull-Rom control points
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    
    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  
  // Close the path with bottom line
  path += ` L ${lastPoint.x.toFixed(2)} ${(padding.top + plotHeight).toFixed(2)} L ${firstPoint.x.toFixed(2)} ${(padding.top + plotHeight).toFixed(2)} Z`
  
  return path
})

const formatNumber = (value: number) => value.toLocaleString('en-US')

// Get current hovered point data
const hoveredPoint = computed(() => {
  if (hoveredIndex.value === null) return null
  return props.points[hoveredIndex.value]
})
</script>

<template>
  <div class="card" ref="containerRef">
    <div class="card-header">
      <h3 class="card-title">Shipment Volume Trend</h3>
      <p class="card-subtitle">{{ periodLabel }}</p>
    </div>
    <div class="chart-container" ref="containerRef">
      <!-- Tooltip (positioned absolutely) -->
      <div v-if="hoveredIndex !== null && hoveredPoint" class="tooltip-container" :style="getTooltipStyle()">
        <div class="tooltip-content">
          <div class="tooltip-label">{{ hoveredPoint.label }}</div>
          <div class="tooltip-value">{{ formatNumber(hoveredPoint.value) }}</div>
        </div>
        <div class="tooltip-caret"></div>
      </div>

      <svg ref="svgRef" :width="chartWidth" :height="chartHeight" class="svg-chart" viewBox="0 0 620 280">
        <!-- Define gradients -->
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color: #0f62fe; stop-opacity: 0.3" />
            <stop offset="100%" style="stop-color: #0f62fe; stop-opacity: 0.05" />
          </linearGradient>
        </defs>

        <!-- Grid lines -->
        <g class="grid">
          <line
            v-for="i in 4"
            :key="`grid-${i}`"
            :x1="padding.left"
            :y1="padding.top + (i / 4) * plotHeight"
            :x2="chartWidth - padding.right"
            :y2="padding.top + (i / 4) * plotHeight"
            class="grid-line"
          />
        </g>

        <!-- Y-axis -->
        <line :x1="padding.left" :y1="padding.top" :x2="padding.left" :y2="padding.top + plotHeight" class="axis" />

        <!-- X-axis -->
        <line :x1="padding.left" :y1="padding.top + plotHeight" :x2="chartWidth - padding.right" :y2="padding.top + plotHeight" class="axis" />

        <!-- Y-axis labels -->
        <g class="axis-labels">
          <text
            v-for="i in 5"
            :key="`y-label-${i}`"
            :x="padding.left - 10"
            :y="padding.top + ((5 - i) / 4) * plotHeight + 4"
            class="y-label"
          >
            {{ formatNumber(Math.round(minValue + (range / 4) * (i - 1))) }}
          </text>
        </g>

        <!-- X-axis labels -->
        <g class="axis-labels">
          <text
            v-for="(point, index) in plotPoints"
            :key="`x-label-${index}`"
            :x="point.x"
            :y="chartHeight - 12"
            class="x-label"
          >
            {{ point.label }}
          </text>
        </g>

        <!-- Area fill under line -->
        <path :d="areaPath" class="area-fill" />

        <!-- Line -->
        <path :d="linePath" class="line" />

        <!-- Data points with hover interaction -->
        <g v-for="(point, index) in plotPoints" :key="`point-${index}`">
          <!-- Invisible hover zone - larger for easier targeting -->
          <circle
            :cx="point.x"
            :cy="point.y"
            r="18"
            class="hover-zone"
            @mouseenter="onPointHover(index)"
            @mouseleave="onPointLeave"
          />
          <!-- Visible point -->
          <circle
            :cx="point.x"
            :cy="point.y"
            r="5"
            class="point"
            :class="{ 'point-active': hoveredIndex === index }"
          />
        </g>
      </svg>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@carbon/type' as type;

.card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 0;
  padding: 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  border-color: #0f62fe;
}

.card-header {
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.card-title {
  @include type.type-style('heading-02');
  margin: 0 0 8px 0;
  color: #161616;
}

.card-subtitle {
  @include type.type-style('label-01');
  margin: 0;
  color: #525252;
}

.chart-container {
  padding: 20px;
  display: flex;
  justify-content: center;
  background: white;
  position: relative;
}

.svg-chart {
  max-width: 100%;
  height: auto;
}

/* Tooltip styling */
.tooltip-container {
  position: absolute;
  z-index: 100;
  transform: translateX(-50%);
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tooltip-content {
  @include type.type-style('label-01');
  background: #161616;
  color: white;
  padding: 8px 12px;
  border-radius: 2px;
  white-space: nowrap;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.tooltip-label {
  font-size: 11px;
  color: #c0c0c0;
  font-weight: 500;
}

.tooltip-value {
  font-size: 13px;
  color: white;
  font-weight: 700;
}

.tooltip-caret {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #161616;
  margin-top: -2px;
}

/* Grid lines (light) */
.grid-line {
  stroke: #e0e0e0;
  stroke-width: 1;
  stroke-dasharray: 3, 2;
}

/* Axes */
.axis {
  stroke: #8d8d8d;
  stroke-width: 1.5;
}

/* Axis labels */
.y-label {
  font-size: 11px;
  fill: #525252;
  text-anchor: end;
  dominant-baseline: middle;
}

.x-label {
  font-size: 11px;
  fill: #525252;
  text-anchor: middle;
  dominant-baseline: hanging;
}

/* Area and line (Carbon sequential blue palette - monochromatic) */
.area-fill {
  fill: url(#areaGradient);
}

.line {
  stroke: #0f62fe;
  stroke-width: 3;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Data points */
.point {
  fill: #0f62fe;
  stroke: white;
  stroke-width: 2;
  transition: all 0.2s ease;
  pointer-events: none;
}

.point-active {
  r: 6.5;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.hover-zone {
  fill: transparent;
  cursor: pointer;
}
</style>
