
<template>
  <div class="adjustment-summary">
    <div class="summary-header">
      <span class="title">调整汇总</span>
    </div>
    <a-tabs v-model:activeKey="activeTab" class="summary-tabs" size="small">
      <a-tab-pane key="hc" tab="HC 明细" />
      <a-tab-pane key="month" tab="月度工薪预算" />
      <a-tab-pane key="year" tab="年度工薪预算" />
      <a-tab-pane key="dept" tab="部门级预算明细" />
    </a-tabs>

    <div class="summary-table-wrapper">
      <a-table
        :data-source="data"
        :pagination="false"
        bordered
        size="small"
        class="summary-table"
        row-key="id"
        :scroll="{ x: 'max-content' }"
        :row-class-name="rowClassName"
        :children-column-name="'children'"
        :defaultExpandAllRows="true"
      >
        <a-table-column title="申请部门" data-index="deptName" :width="220" fixed="left">
          <template #default="{ text }">
            <strong>{{ text }}</strong>
          </template>
        </a-table-column>

        <a-table-column-group
          v-for="group in stageGroups"
          :key="group.key"
          :title="group.title"
          :customHeaderCell="() => ({ class: headerClass(group.key) })"
        >
          <a-table-column
            v-for="metric in metrics"
            :key="`${group.key}-${metric.key}`"
            :title="metric.label"
            align="right"
            :width="metric.width"
            :customHeaderCell="() => ({ class: headerClass(group.key) })"
          >
            <template #default="{ record }">
              <span :class="valueClass(group.key, metric.key, record)">
                {{ displayValue(group.key, metric.key, record) }}
              </span>
            </template>
          </a-table-column>
        </a-table-column-group>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AdjustmentSummaryItem } from '../../mocks/budgetData'

defineProps<{
  data: AdjustmentSummaryItem[]
}>()

type TabKey = 'hc' | 'month' | 'year' | 'dept'
type StageKey = 'pre' | 'post' | 'diff'
type HcMetric = 'reg' | 'intern' | 'outsource' | 'other'
type DeptMetric = 'severance' | 'overtime'

const activeTab = ref<TabKey>('hc')

const stageGroups = [
  { key: 'pre' as StageKey, title: '申请前' },
  { key: 'post' as StageKey, title: '申请通过后' },
  { key: 'diff' as StageKey, title: '变化' }
]

const metrics = computed(() => {
  if (activeTab.value === 'dept') {
    return [
      { key: 'severance', label: '离职补偿金', width: 120 },
      { key: 'overtime', label: '加班费', width: 120 }
    ] as Array<{ key: DeptMetric; label: string; width: number }>
  }
  return [
    { key: 'reg', label: '正编', width: 90 },
    { key: 'intern', label: '实习', width: 90 },
    { key: 'outsource', label: '外包', width: 90 },
    { key: 'other', label: '其他', width: 90 }
  ] as Array<{ key: HcMetric; label: string; width: number }>
})

const toNumber = (value: unknown) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const getDeptBudgetGroup = (record: any, stage: StageKey) => {
  return (
    record?.[stage]?.deptBudget ||
    record?.[stage]?.departmentBudget ||
    {}
  )
}

const getValue = (record: any, stage: StageKey, metricKey: string) => {
  if (activeTab.value === 'hc') {
    const hc = record?.[stage]?.hc || {}
    if (metricKey === 'reg') return toNumber(hc.reg)
    if (metricKey === 'intern') return toNumber(hc.intern)
    if (metricKey === 'outsource') return toNumber(hc.outsource)
    return toNumber(hc.other)
  }

  if (activeTab.value === 'month' || activeTab.value === 'year') {
    const salary = record?.[stage]?.salary || {}
    const isMonth = activeTab.value === 'month'
    const byType = isMonth ? (salary.monthByType || salary.month_type || {}) : (salary.yearByType || salary.year_type || {})
    if (byType && byType[metricKey] !== undefined) return toNumber(byType[metricKey])
    const total = isMonth ? toNumber(salary.month) : toNumber(salary.year)
    return metricKey === 'other' ? total : 0
  }

  const deptBudget = getDeptBudgetGroup(record, stage)
  if (metricKey === 'severance') return toNumber(deptBudget.severance ?? deptBudget.compensation)
  return toNumber(deptBudget.overtime)
}

const formatNumber = (value: number) => {
  if (activeTab.value === 'hc') {
    return value.toLocaleString('zh-CN', { maximumFractionDigits: 0 })
  }
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

const displayValue = (stage: StageKey, metricKey: string, record: any) => {
  const value = getValue(record, stage, metricKey)
  if (stage === 'diff') {
    if (value > 0) return `+${formatNumber(value)}`
    if (value < 0) return `-${formatNumber(Math.abs(value))}`
  }
  return formatNumber(value)
}

const valueClass = (stage: StageKey, _metricKey: string, record: any) => {
  if (stage === 'diff') {
    const value = getValue(record, stage, _metricKey)
    if (value > 0) return 'text-red'
    if (value < 0) return 'text-green'
  }
  if (stage === 'pre') return 'value-pre'
  if (stage === 'post') return 'value-post'
  if (record?.children?.length) return 'value-parent'
  return ''
}

const headerClass = (stage: StageKey) => {
  if (stage === 'pre') return 'header-pre'
  if (stage === 'post') return 'header-post'
  return 'header-diff'
}

const rowClassName = (record: any) => {
  return record?.children?.length ? 'summary-parent-row' : 'summary-child-row'
}
</script>

<style scoped>
.adjustment-summary {
  background: #fff;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 4px;
}

.summary-header {
  margin-bottom: 8px;
}

.title {
  font-weight: 500;
  font-size: 14px;
  color: #000;
}

.summary-tabs {
  margin-bottom: 12px;
}

:deep(.summary-tabs .ant-tabs-nav) {
  margin-bottom: 10px;
}

.summary-table-wrapper {
  overflow-x: auto;
  overflow-y: hidden;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.summary-table-wrapper::-webkit-scrollbar {
  display: none;
}

:deep(.ant-table-thead > tr > th) {
  text-align: center;
  font-weight: 500;
  background-color: #fafafa !important;
  color: #000000d9;
  vertical-align: middle;
  border-right: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.header-post) {
  background-color: #f2f8ff !important;
  font-weight: 700;
}

:deep(.header-pre) {
  color: #8c8c8c;
}

:deep(.ant-table-tbody > tr > td) {
  text-align: right;
}

:deep(.ant-table-tbody > tr > td:first-child) {
  text-align: left;
}

:deep(.ant-table-cell-fix-left-last) {
  border-right: 2px solid #d9d9d9 !important;
  background: #fff !important;
}

:deep(.summary-parent-row > td) {
  background: #fafcff !important;
}

.value-pre {
  color: #8c8c8c;
}

.value-post {
  font-weight: 700;
}

.value-parent {
  font-weight: 600;
}

.text-red {
  color: #ff4d4f;
  font-weight: 600;
}

.text-green {
  color: #52c41a;
  font-weight: 600;
}
</style>
