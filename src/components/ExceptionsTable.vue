<script setup lang="ts">
import type { ExceptionRecord } from '@/lib/metrics'

defineProps<{
  rows: ExceptionRecord[]
}>()

const typeIcons: Record<string, string> = {
  Delayed: '⏱',
  Damaged: '📦',
  Lost: '🗺',
  'Customs Hold': '⚠',
  'Address Issue': '🏢',
}

function severityBgColor(severity: string): string {
  if (severity === 'High') return '#da1e28'
  if (severity === 'Medium') return '#f1c21b'
  return '#525252'
}
</script>

<template>
  <div class="card">
    <div class="card-header">
      <div class="header-flex">
        <div>
          <h3 class="card-title">Open Exceptions</h3>
          <p class="card-subtitle">Highest severity and oldest first</p>
        </div>
        <div class="badge-count">{{ rows.length }} open</div>
      </div>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Shipment</th>
            <th>Region</th>
            <th>Type</th>
            <th>Lane</th>
            <th>Severity</th>
            <th class="text-right">Age</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id" class="exception-row">
            <td class="font-bold">{{ row.id }}</td>
            <td>{{ row.region }}</td>
            <td>
              <div class="type-cell">
                <span>{{ typeIcons[row.type] ?? '⚠' }}</span>
                <span>{{ row.type }}</span>
              </div>
            </td>
            <td class="text-muted">{{ row.lane }}</td>
            <td>
              <span class="badge" :style="{ backgroundColor: severityBgColor(row.severity) }">
                {{ row.severity }}
              </span>
            </td>
            <td class="text-right">{{ row.ageDays }}d</td>
          </tr>
          <tr v-if="rows.length === 0">
            <td colspan="6" class="empty-state">No open exceptions for this filter.</td>
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

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.badge-count {
  background: #f1c21b;
  color: #161616;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
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

.exception-row:hover {
  background: #f4f4f4;
}

.text-right {
  text-align: right;
}

.text-muted {
  color: #8d8d8d;
  font-size: 12px;
}

.font-bold {
  font-weight: 600;
  color: #161616;
}

.type-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  @include type.type-style('label-01');
  display: inline-block;
  padding: 2px 12px;
  border-radius: 0;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 40px 16px;
  color: #8d8d8d;
  font-size: 13px;
}
</style>
