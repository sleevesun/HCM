<script setup lang="ts">
import { getChangeClass } from '../../../utils/budgetApprovalMobile'
import type {
  BudgetScenarioThreeGroup,
  BudgetScenarioThreeSummaryMetric,
  BudgetScenarioThreeAccordionItem
} from '../../../types/budgetApprovalMobile'

defineProps<{
  overviewMetrics: BudgetScenarioThreeSummaryMetric[]
  groups: BudgetScenarioThreeGroup[]
  activeKey: string | null
}>()

const emit = defineEmits<{
  (event: 'toggle', key: string): void
}>()

const isItemDisabled = (item: BudgetScenarioThreeAccordionItem) => {
  return item.summaryMetrics.every(m => {
    const val = parseFloat(m.change.replace(/,/g, ''))
    return val === 0
  })
}

const handleToggle = (item: BudgetScenarioThreeAccordionItem) => {
  if (isItemDisabled(item)) return
  emit('toggle', item.key)
}
</script>

<template>
  <div class="scenario-three">
    <section class="overview-card">
      <h3 class="overview-title">部门整体</h3>
      <div v-for="metric in overviewMetrics" :key="metric.label" class="overview-row">
        <span class="overview-label">{{ metric.label }}</span>
        <span class="overview-value">
          {{ metric.after }}
          <span class="overview-change" :class="getChangeClass(metric.changeType)">({{ metric.change }})</span>
        </span>
      </div>
    </section>

    <section v-for="group in groups" :key="group.key" class="group-card">
      <h3 class="group-title">{{ group.title }}</h3>
      <div v-for="item in group.items" :key="item.key" class="accordion-item">
        <button 
          class="accordion-header" 
          type="button" 
          :disabled="isItemDisabled(item)"
          @click="handleToggle(item)"
        >
          <span class="header-title">{{ item.title }}</span>
          <div class="header-summary">
            <div v-for="summary in item.summaryMetrics" :key="summary.label" class="summary-line">
              <span class="summary-label">申请后{{ summary.label }}</span>
              <div class="summary-right">
                <span class="summary-val">{{ summary.after }}</span>
                <span class="summary-change" :class="getChangeClass(summary.changeType)">({{ summary.change }})</span>
              </div>
            </div>
          </div>
          <span v-if="!isItemDisabled(item)" class="header-arrow" :class="{ expanded: activeKey === item.key }">⌄</span>
          <span v-else class="header-arrow placeholder"></span>
        </button>
        <div class="accordion-panel" :class="{ expanded: activeKey === item.key }">
          <div v-for="metric in item.panelMetrics" :key="metric.label" class="panel-row">
            <div class="metric-label">{{ metric.label }}</div>
            <div class="metric-values">
              <div class="metric-line">
                <span class="line-name">申请前</span>
                <span class="line-value">{{ metric.before }}</span>
              </div>
              <div class="metric-line">
                <span class="line-name strong">申请后</span>
                <span class="line-value strong">{{ metric.after }}</span>
              </div>
              <div class="metric-line">
                <span class="line-name">变化</span>
                <span class="line-value strong" :class="getChangeClass(metric.changeType)">{{ metric.change }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.scenario-three {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.overview-card,
.group-card {
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.overview-title,
.group-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
}

.overview-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.overview-row:last-child {
  border-bottom: 0;
}

.overview-label {
  font-size: 13px;
  color: #4b5563;
}

.overview-value {
  font-size: 13px;
  color: #111827;
  font-weight: 500;
  text-align: right;
}

.overview-change {
  margin-left: 4px;
}

.accordion-item {
  border: 1px solid #f3f4f6;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
}

.accordion-item:last-child {
  margin-bottom: 0;
}

.accordion-header {
  width: 100%;
  border: 0;
  background: #fff;
  display: grid;
  grid-template-columns: 88px 1fr 20px;
  align-items: center;
  gap: 8px;
  padding: 10px;
  text-align: left;
  touch-action: manipulation;
}

.accordion-header:active:not(:disabled) {
  background: #f9fafb;
}

.header-title {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
}

.header-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #4b5563;
}

.summary-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
}

.summary-right {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.summary-val {
  color: #111827;
}

.header-arrow {
  justify-self: end;
  color: #6b7280;
  transition: transform 0.2s ease;
}

.header-arrow.expanded {
  transform: rotate(180deg);
}

.header-arrow.placeholder {
  display: inline-block;
  width: 1em;
}

.accordion-panel {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.25s ease;
}

.accordion-panel.expanded {
  max-height: 520px;
}

.panel-row {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 10px;
  padding: 10px;
  border-top: 1px solid #f3f4f6;
}

.metric-label {
  font-size: 13px;
  color: #374151;
  font-weight: 700;
  align-self: center;
}

.metric-values {
  border-left: 1px solid #e5e7eb;
  padding-left: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-line {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
}

.line-name {
  color: #6b7280;
}

.line-name.strong,
.line-value.strong {
  color: #111827;
  font-weight: 600;
}

.line-value {
  color: #4b5563;
}

.text-red {
  color: #ef4444;
}

.text-green {
  color: #22c55e;
}

.text-gray-400 {
  color: #9ca3af;
}
</style>
