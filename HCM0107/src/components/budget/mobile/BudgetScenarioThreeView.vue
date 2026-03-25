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
          <span class="overview-before">{{ metric.before }}</span>
          <span class="overview-arrow">→</span>
          <span class="overview-after" :class="getChangeClass(metric.changeType)">{{ metric.after }}</span>
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
          <div class="header-top">
            <span class="header-title">{{ item.title }}</span>
            <span v-if="isItemDisabled(item)" class="header-static-tag">无变化</span>
            <span v-else class="header-arrow" :class="{ expanded: activeKey === item.key }">⌄</span>
          </div>
          <div class="header-metrics">
            <div v-for="summary in item.summaryMetrics" :key="summary.label" class="summary-line">
              <span class="summary-label">{{ summary.label }}</span>
              <div v-if="isItemDisabled(item)" class="summary-right static">
                <span class="summary-val">{{ summary.after }}</span>
              </div>
              <div v-else class="summary-right">
                <span class="summary-before">{{ summary.before }}</span>
                <span class="summary-arrow">→</span>
                <span class="summary-after" :class="getChangeClass(summary.changeType)">{{ summary.after }}</span>
              </div>
            </div>
          </div>
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
                <span class="line-value change-value" :class="getChangeClass(metric.changeType)">{{ metric.change }}</span>
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
  text-align: right;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.overview-before {
  color: #4b5563;
}

.overview-arrow {
  color: #9ca3af;
}

.overview-after {
  font-weight: 700;
}

.accordion-header {
  width: 100%;
  border: 0;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  padding: 10px;
  text-align: left;
  touch-action: manipulation;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.accordion-header:active:not(:disabled) {
  background: #f9fafb;
}

.header-title {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
}

.header-metrics {
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  color: #4b5563;
}

.summary-right {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.summary-val {
  color: #111827;
  font-weight: 700;
}

.header-arrow {
  color: #6b7280;
  transition: transform 0.2s ease;
}

.header-arrow.expanded {
  transform: rotate(180deg);
}

.header-static-tag {
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
}

.summary-static-label {
  color: #9ca3af;
}

.summary-right.static {
  gap: 8px;
}

.summary-before {
  color: #4b5563;
}

.summary-arrow {
  color: #9ca3af;
}

.summary-after {
  font-weight: 700;
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

.change-value {
  font-weight: 600;
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
