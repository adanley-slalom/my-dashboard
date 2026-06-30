<script setup lang="ts">
import type { RegionalRow } from '@/lib/metrics'

defineProps<{
  rows: RegionalRow[]
}>()

function onTimeColor(rate: number): string {
  if (rate >= 90) return '#24a148'
  if (rate >= 88) return '#f1c21b'
  return '#da1e28'
}
</script>

<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">Regional Performance</h3>
      <p class="card-subtitle">Volume share and on-time rate by region</p>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Region</th>
            <th class="text-right">Volume</th>
            <th>Share</th>
            <th class="text-right">On-Time</th>
            <th class="text-right">Avg Transit</th>
            <th class="text-right">Exceptions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.region">
            <td class="font-bold">{{ row.region }}</td>
            <td class="text-right">{{ row.volume.toLocaleString('en-US') }}</td>
            <td>
              <div class="share-bar-container">
                <div class="share-bar" :style="{ width: row.share + '%' }" />
                <span class="share-label">{{ row.share.toFixed(0) }}%</span>
              </div>
            </td>
            <td class="text-right">
              <span class="badge" :style="{ backgroundColor: onTimeColor(row.onTimeRate) }">
                {{ row.onTimeRate.toFixed(1) }}%
              </span>
            </td>
            <td class="text-right">{{ row.avgTransitDays.toFixed(1) }}d</td>
            <td class="text-right">{{ row.exceptions }}</td>
          </tr>
        </tbody>
      </table>
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

.table-container {
  overflow-x: auto;
}

.data-table {
  @include type.type-style('body-compact-01');
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #f4f4f4;
  border-bottom: 2px solid #8d8d8d;
}

.data-table th {
  @include type.type-style('label-01');
  padding: 12px 16px;
  text-align: left;
  color: #161616;
  text-transform: uppercase;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  color: #525252;
}

.data-table tbody tr:hover {
  background: #f4f4f4;
}

.text-right {
  text-align: right;
}

.font-bold {
  font-weight: 600;
  color: #161616;
}

.share-bar-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.share-bar {
  height: 8px;
  background: linear-gradient(90deg, #0f62fe 0%, #0043ce 100%);
  border-radius: 2px;
  min-width: 20px;
}

.share-label {
  @include type.type-style('label-01');
  min-width: 40px;
  text-align: right;
  color: #525252;
}

.badge {
  @include type.type-style('label-01');
  display: inline-block;
  padding: 2px 12px;
  border-radius: 0;
  color: white;
}
</style>
