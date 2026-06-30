<script setup lang="ts">
import { computed, ref } from 'vue'
import MetricCard from '@/components/MetricCard.vue'
import RegionalPerformance from '@/components/RegionalPerformance.vue'
import VolumeTrendChart from '@/components/VolumeTrendChart.vue'
import ExceptionsTable from '@/components/ExceptionsTable.vue'
import CustomSelect from '@/components/CustomSelect.vue'
import type { Option } from '@/components/CustomSelect.vue'
import {
  computeKpis,
  computeRegionalRows,
  computeTrend,
  data,
  filterExceptions,
  regionOptions,
  ALL_REGIONS,
} from '@/lib/metrics'

const regions = regionOptions()
const periods = data.meta.periods

const selectedRegion = ref<string>(ALL_REGIONS)
const selectedPeriod = ref<string>('30d')

const regionOptions_computed = computed<Option[]>(() =>
  regions.map((r) => ({ label: r, value: r })),
)

const periodOptions = computed<Option[]>(() =>
  periods.map((p) => ({ label: p.label, value: p.id })),
)

const periodLabel = computed(
  () => periods.find((p) => p.id === selectedPeriod.value)?.label ?? '',
)

const kpis = computed(() => computeKpis(selectedPeriod.value, selectedRegion.value))
const regionalRows = computed(() => computeRegionalRows(selectedPeriod.value))
const trendPoints = computed(() => computeTrend(selectedPeriod.value, selectedRegion.value))
const exceptions = computed(() => filterExceptions(selectedRegion.value))

const lastUpdated = computed(() => {
  const date = new Date(`${data.meta.generatedAt}T00:00:00`)
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
})

const exportCSV = () => {
  const lines: string[] = []

  // Header section
  lines.push(`FastForward Ops Dashboard Export`)
  lines.push(`Region: ${selectedRegion.value}`)
  lines.push(`Period: ${periodLabel.value}`)
  lines.push(`Generated: ${lastUpdated.value}`)
  lines.push('')

  // KPIs section
  lines.push('Key Performance Indicators')
  lines.push('Metric,Value,Unit,Trend')
  kpis.value.forEach((kpi) => {
    const trendText = kpi.trend ? `${kpi.trend.text} (${kpi.trend.direction})` : ''
    lines.push(`"${kpi.label}","${kpi.value}","${kpi.unit}","${trendText}"`)
  })
  lines.push('')

  // Regional Performance section
  lines.push('Regional Performance')
  lines.push('Region,Volume,On-Time Rate,Avg Transit Days,Exceptions,Volume Share %')
  regionalRows.value.forEach((row) => {
    lines.push(
      `"${row.region}",${row.volume},"${row.onTimeRate.toFixed(1)}%","${row.avgTransitDays.toFixed(1)}","${row.exceptions}","${row.share.toFixed(1)}%"`,
    )
  })
  lines.push('')

  // Exceptions section
  lines.push('Open Exceptions')
  lines.push('Region,Type,Severity,Age (Days),Status,Lane')
  exceptions.value.forEach((exc) => {
    lines.push(
      `"${exc.region}","${exc.type}","${exc.severity}","${exc.ageDays}","${exc.status}","${exc.lane}"`,
    )
  })

  // Generate CSV and download
  const csv = lines.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  const fileName = `FastForward-Dashboard-${selectedRegion.value.replace(/\s+/g, '-')}-${selectedPeriod.value}.csv`
  link.setAttribute('href', url)
  link.setAttribute('download', fileName)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="header-title">
          <h1>FastForward Ops</h1>
          <p>Executive Dashboard</p>
        </div>
        <div class="filters">
          <div class="filter-group">
            <CustomSelect
              v-model="selectedRegion"
              :options="regionOptions_computed"
              label="Region"
              id="region-select"
            />
          </div>
          <div class="filter-group">
            <CustomSelect
              v-model="selectedPeriod"
              :options="periodOptions"
              label="Period"
              id="period-select"
            />
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="main-content">
      <!-- Page heading -->
      <div class="page-header">
        <div>
          <h2>Operations Overview</h2>
          <p class="subtitle">
            {{ selectedRegion }} &middot; {{ periodLabel }}
          </p>
        </div>
        <div class="header-actions">
          <button class="export-csv-button" @click="exportCSV">Export CSV</button>
          <div class="updated-badge">Updated {{ lastUpdated }}</div>
        </div>
      </div>

      <!-- KPI row -->
      <div class="kpi-grid">
        <MetricCard
          v-for="kpi in kpis"
          :key="kpi.key"
          :label="kpi.label"
          :value="kpi.value"
          :unit="kpi.unit"
          :icon="kpi.icon"
          :trend="kpi.trend"
          :sparkline-points="kpi.sparklinePoints"
        />
      </div>

      <!-- Regional + trend -->
      <div class="sections-grid">
        <RegionalPerformance :rows="regionalRows" />
        <VolumeTrendChart :points="trendPoints" :period-label="periodLabel" />
      </div>

      <!-- Exceptions -->
      <div class="full-width">
        <ExceptionsTable :rows="exceptions" />
      </div>

      <p class="footer-text">
        Prototype built for {{ data.meta.company }} &middot; figures are mock data for demonstration.
      </p>
    </main>
  </div>
</template>

<style lang="scss" scoped>
@use '@carbon/type' as type;

.dashboard {
  min-height: 100vh;
  background: #f4f4f4;
}

.header {
  background: #161616;
  color: white;
  border-bottom: 4px solid #0f62fe;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
}

.header-title h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.header-title p {
  @include type.type-style('label-01');
  margin: 4px 0 0 0;
  color: #a8a8a8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.filters {
  display: flex;
  gap: 16px;
  min-width: 400px;
}

.filter-group {
  flex: 1;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.page-header h2 {
  @include type.type-style('heading-03');
  margin: 0 0 8px 0;
  color: #161616;
}

.subtitle {
  @include type.type-style('body-compact-01');
  margin: 0;
  color: #525252;
}

.updated-badge {
  @include type.type-style('label-01');
  background: #e0e0e0;
  color: #161616;
  padding: 0 16px;
  border-radius: 0;
  white-space: nowrap;
  height: 40px;
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.export-csv-button {
  @include type.type-style('label-01');
  height: 40px;
  padding: 10px 16px;
  border: 1px solid #0f62fe;
  background: white;
  color: #0f62fe;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.export-csv-button:hover {
  background: #f4f4f4;
  border-color: #0f62fe;
}

.export-csv-button:focus {
  outline: 2px solid #0f62fe;
  outline-offset: -2px;
  border-color: #0f62fe;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.sections-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 1024px) {
  .sections-grid {
    grid-template-columns: 1fr;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .filters {
    width: 100%;
    flex-direction: column;
    min-width: auto;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    gap: 12px;
  }

  .updated-badge {
    align-self: flex-start;
  }
}

.full-width {
  margin-bottom: 24px;
}

.footer-text {
  @include type.type-style('label-01');
  text-align: center;
  color: #8d8d8d;
  margin: 24px 0 0 0;
}
</style>
