<template>
  <div class="adjustment-summary-two-layer">
    <!-- Top Section: Micro Cards (Control Hub) -->
    <div class="overview-cards-container">
      <div class="overview-cards">
        <template v-for="item in summaryCategories" :key="item.key">
          <div
            class="micro-card"
            :class="{ active: activeCategory === item.key }"
            @click="activeCategory = item.key"
          >
            <div class="card-header">
              <span class="category-title" :class="{ 'normal-weight': item.key === 'deptBudget' }">{{ item.label }}</span>
              <span class="alert-icon" :class="getAlertClass(item.alertStatus)">
                <!-- 异动预警图标 -->
                <template v-if="item.alertStatus > 0">
                  <span class="icon-arrow up">↑</span>
                </template>
                <template v-else-if="item.alertStatus < 0">
                  <span class="icon-arrow down">↓</span>
                </template>
                <template v-else>
                  <span class="icon-flat">-</span>
                </template>
              </span>
            </div>
            <div class="card-body">
              <div v-if="item.key !== 'deptBudget'" class="metric-line">
                <span class="metric-name">HC：</span>
                <span class="metric-val">{{ formatValue(item.postHc, false) }}</span>
              </div>
              <div v-else class="metric-line placeholder-line">
                <!-- 部门级预算无 HC，用透明占位保持高度一致 -->
                &nbsp;
              </div>
              <div class="metric-line">
                <span class="metric-name">预算：</span>
                <span class="metric-val">{{ formatValue(item.postBudget, true) }}万</span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Bottom Section: Detail Table (Data Canvas) -->
    <div class="details-section">
      <div class="table-header">
        <span class="table-title">{{ currentCategoryLabel }}明细数据</span>
        <div class="table-legend">
          <span class="legend-item"><span class="dot red"></span>增加</span>
          <span class="legend-item"><span class="dot green"></span>减少</span>
          <span class="legend-item"><span class="dot gray"></span>无变化</span>
        </div>
      </div>
      
      <transition name="fade" mode="out-in">
        <div :key="activeCategory" class="table-wrapper">
          <a-table
            :data-source="data"
            :pagination="false"
            bordered
            size="small"
            class="complex-details-table"
            row-key="id"
            :defaultExpandAllRows="true"
            :scroll="{ x: 'max-content', y: 320 }"
          >
            <a-table-column title="下级部门组织" data-index="deptName" :width="180" fixed="left" class="dept-col">
              <template #default="{ text }">
                <strong>{{ text }}</strong>
              </template>
            </a-table-column>

            <!-- 动态列：根据场景显示不同指标 -->
            <template v-if="currentScene === 'A' || currentScene === 'B'">
              <!-- HC配置 -->
              <a-table-column-group title="HC 配置" align="center">
                <a-table-column title="申请前" align="right" :width="80" class="col-pre" :customHeaderCell="() => ({ class: 'col-pre' })" data-index="hc-pre">
                  <template #default="{ record }"><span class="val-pre">{{ formatValue(getMetricValue(record, 'pre', 'hc'), false) }}</span></template>
                </a-table-column>
                <a-table-column title="申请后" align="right" :width="80" class="col-post" :customHeaderCell="() => ({ class: 'col-post' })" data-index="hc-post">
                  <template #default="{ record }"><span class="val-post">{{ formatValue(getMetricValue(record, 'post', 'hc'), false) }}</span></template>
                </a-table-column>
                <a-table-column title="变化" align="right" :width="80" class="col-diff" :customHeaderCell="() => ({ class: 'col-diff' })" data-index="hc-diff">
                  <template #default="{ record }">
                    <span :class="getChangeClass(getMetricValue(record, 'diff', 'hc'))">
                      {{ formatDiff(getMetricValue(record, 'diff', 'hc'), false) }}
                    </span>
                  </template>
                </a-table-column>
              </a-table-column-group>

              <a-table-column-group title="月度工薪预算 (万)" align="center">
                <a-table-column title="申请前" align="right" :width="100" class="col-pre" :customHeaderCell="() => ({ class: 'col-pre' })" data-index="month-pre">
                  <template #default="{ record }"><span class="val-pre">{{ formatValue(getMetricValue(record, 'pre', 'monthSalary'), true) }}</span></template>
                </a-table-column>
                <a-table-column title="申请后" align="right" :width="100" class="col-post" :customHeaderCell="() => ({ class: 'col-post' })" data-index="month-post">
                  <template #default="{ record }"><span class="val-post">{{ formatValue(getMetricValue(record, 'post', 'monthSalary'), true) }}</span></template>
                </a-table-column>
                <a-table-column title="变化" align="right" :width="100" class="col-diff" :customHeaderCell="() => ({ class: 'col-diff' })" data-index="month-diff">
                  <template #default="{ record }">
                    <span :class="getChangeClass(getMetricValue(record, 'diff', 'monthSalary'))">
                      {{ formatDiff(getMetricValue(record, 'diff', 'monthSalary'), true) }}
                    </span>
                  </template>
                </a-table-column>
              </a-table-column-group>

              <!-- 年度工薪 -->
              <a-table-column-group title="年度工薪预算 (万)" align="center">
                <a-table-column title="申请前" align="right" :width="120" class="col-pre" :customHeaderCell="() => ({ class: 'col-pre' })" data-index="year-pre">
                  <template #default="{ record }"><span class="val-pre">{{ formatValue(getMetricValue(record, 'pre', 'yearSalary'), true) }}</span></template>
                </a-table-column>
                <a-table-column title="申请后" align="right" :width="120" class="col-post" :customHeaderCell="() => ({ class: 'col-post' })" data-index="year-post">
                  <template #default="{ record }"><span class="val-post">{{ formatValue(getMetricValue(record, 'post', 'yearSalary'), true) }}</span></template>
                </a-table-column>
                <a-table-column title="变化" align="right" :width="120" class="col-diff" :customHeaderCell="() => ({ class: 'col-diff' })" data-index="year-diff">
                  <template #default="{ record }">
                    <span :class="getChangeClass(getMetricValue(record, 'diff', 'yearSalary'))">
                      {{ formatDiff(getMetricValue(record, 'diff', 'yearSalary'), true) }}
                    </span>
                  </template>
                </a-table-column>
              </a-table-column-group>
            </template>

            <template v-else-if="currentScene === 'C'">
              <!-- 离职补偿金 -->
              <a-table-column-group title="离职补偿金 (万)" align="center">
                <a-table-column title="申请前" align="right" :width="100" class="col-pre" :customHeaderCell="() => ({ class: 'col-pre' })" data-index="sev-pre">
                  <template #default="{ record }"><span class="val-pre">{{ formatValue(getMetricValue(record, 'pre', 'severance'), true) }}</span></template>
                </a-table-column>
                <a-table-column title="申请后" align="right" :width="100" class="col-post" :customHeaderCell="() => ({ class: 'col-post' })" data-index="sev-post">
                  <template #default="{ record }"><span class="val-post">{{ formatValue(getMetricValue(record, 'post', 'severance'), true) }}</span></template>
                </a-table-column>
                <a-table-column title="变化" align="right" :width="100" class="col-diff" :customHeaderCell="() => ({ class: 'col-diff' })" data-index="sev-diff">
                  <template #default="{ record }">
                    <span :class="getChangeClass(getMetricValue(record, 'diff', 'severance'))">
                      {{ formatDiff(getMetricValue(record, 'diff', 'severance'), true) }}
                    </span>
                  </template>
                </a-table-column>
              </a-table-column-group>

              <!-- 加班费 -->
              <a-table-column-group title="加班费 (万)" align="center">
                <a-table-column title="申请前" align="right" :width="100" class="col-pre" :customHeaderCell="() => ({ class: 'col-pre' })" data-index="over-pre">
                  <template #default="{ record }"><span class="val-pre">{{ formatValue(getMetricValue(record, 'pre', 'overtime'), true) }}</span></template>
                </a-table-column>
                <a-table-column title="申请后" align="right" :width="100" class="col-post" :customHeaderCell="() => ({ class: 'col-post' })" data-index="over-post">
                  <template #default="{ record }"><span class="val-post">{{ formatValue(getMetricValue(record, 'post', 'overtime'), true) }}</span></template>
                </a-table-column>
                <a-table-column title="变化" align="right" :width="100" class="col-diff" :customHeaderCell="() => ({ class: 'col-diff' })" data-index="over-diff">
                  <template #default="{ record }">
                    <span :class="getChangeClass(getMetricValue(record, 'diff', 'overtime'))">
                      {{ formatDiff(getMetricValue(record, 'diff', 'overtime'), true) }}
                    </span>
                  </template>
                </a-table-column>
              </a-table-column-group>
              
              <!-- 签约金 -->
              <a-table-column-group title="签约金 (万)" align="center">
                <a-table-column title="申请前" align="right" :width="100" class="col-pre" :customHeaderCell="() => ({ class: 'col-pre' })" data-index="sign-pre">
                  <template #default="{ record }"><span class="val-pre">{{ formatValue(getMetricValue(record, 'pre', 'signOn'), true) }}</span></template>
                </a-table-column>
                <a-table-column title="申请后" align="right" :width="100" class="col-post" :customHeaderCell="() => ({ class: 'col-post' })" data-index="sign-post">
                  <template #default="{ record }"><span class="val-post">{{ formatValue(getMetricValue(record, 'post', 'signOn'), true) }}</span></template>
                </a-table-column>
                <a-table-column title="变化" align="right" :width="100" class="col-diff" :customHeaderCell="() => ({ class: 'col-diff' })" data-index="sign-diff">
                  <template #default="{ record }">
                    <span :class="getChangeClass(getMetricValue(record, 'diff', 'signOn'))">
                      {{ formatDiff(getMetricValue(record, 'diff', 'signOn'), true) }}
                    </span>
                  </template>
                </a-table-column>
              </a-table-column-group>
            </template>

          </a-table>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { AdjustmentSummaryItem } from '../../mocks/budgetData'

const props = defineProps<{
  data: AdjustmentSummaryItem[]
}>()

type CategoryKey = 'overall' | 'reg' | 'outsource' | 'intern' | 'dispatch' | 'partTime' | 'deptBudget'

const activeCategory = ref<CategoryKey>('overall')

// 场景判断：A (整体/正编), B (外包/实习/派遣/兼职), C (部门级预算)
const currentScene = computed(() => {
  if (['overall', 'reg'].includes(activeCategory.value)) return 'A'
  if (['outsource', 'intern', 'dispatch', 'partTime'].includes(activeCategory.value)) return 'B'
  return 'C'
})

const currentCategoryLabel = computed(() => {
  const cat = summaryCategories.value.find(c => c.key === activeCategory.value)
  return cat ? cat.label : ''
})

// Helper to sum up values from data array
const sumMetric = (extractor: (item: AdjustmentSummaryItem) => number) => {
  return props.data.reduce((sum, item) => sum + extractor(item), 0)
}

const summaryCategories = computed(() => {
  const overallPostHc = sumMetric(item => item.post.hc.reg + item.post.hc.intern + item.post.hc.outsource + item.post.hc.dispatch + item.post.hc.partTime)
  const overallPostBudget = sumMetric(item => item.post.salary.year)
  const overallDiffBudget = sumMetric(item => item.diff.salary.year)

  const regPostHc = sumMetric(item => item.post.hc.reg)
  const regPostBudget = sumMetric(item => item.post.salaryBreakdown.reg)
  const regDiffBudget = sumMetric(item => item.diff.salaryBreakdown.reg)

  const outsourcePostHc = sumMetric(item => item.post.hc.outsource)
  const outsourcePostBudget = sumMetric(item => item.post.salaryBreakdown.outsource)
  const outsourceDiffBudget = sumMetric(item => item.diff.salaryBreakdown.outsource)

  const internPostHc = sumMetric(item => item.post.hc.intern)
  const internPostBudget = sumMetric(item => item.post.salaryBreakdown.intern)
  const internDiffBudget = sumMetric(item => item.diff.salaryBreakdown.intern)

  const dispatchPostHc = sumMetric(item => item.post.hc.dispatch)
  const dispatchPostBudget = sumMetric(item => item.post.salaryBreakdown.dispatch)
  const dispatchDiffBudget = sumMetric(item => item.diff.salaryBreakdown.dispatch)

  const partTimePostHc = sumMetric(item => item.post.hc.partTime)
  const partTimePostBudget = sumMetric(item => item.post.salaryBreakdown.partTime)
  const partTimeDiffBudget = sumMetric(item => item.diff.salaryBreakdown.partTime)

  const deptBudgetPost = sumMetric(item => item.post.deptBudget.severance + item.post.deptBudget.overtime + item.post.deptBudget.signOn)
  const deptBudgetDiff = sumMetric(item => item.diff.deptBudget.severance + item.diff.deptBudget.overtime + item.diff.deptBudget.signOn)

  return [
    { key: 'overall', label: '部门整体', postHc: overallPostHc, postBudget: overallPostBudget, alertStatus: overallDiffBudget },
    { key: 'reg', label: '正编', postHc: regPostHc, postBudget: regPostBudget, alertStatus: regDiffBudget },
    { key: 'outsource', label: '人力外包', postHc: outsourcePostHc, postBudget: outsourcePostBudget, alertStatus: outsourceDiffBudget },
    { key: 'intern', label: '实习', postHc: internPostHc, postBudget: internPostBudget, alertStatus: internDiffBudget },
    { key: 'dispatch', label: '劳务派遣', postHc: dispatchPostHc, postBudget: dispatchPostBudget, alertStatus: dispatchDiffBudget },
    { key: 'partTime', label: '兼职', postHc: partTimePostHc, postBudget: partTimePostBudget, alertStatus: partTimeDiffBudget },
    { key: 'deptBudget', label: '部门级预算', postHc: 0, postBudget: deptBudgetPost, alertStatus: deptBudgetDiff }
  ] as const
})

const getMetricValue = (record: AdjustmentSummaryItem, stage: 'pre' | 'post' | 'diff', metricType: 'hc' | 'monthSalary' | 'yearSalary' | 'severance' | 'overtime' | 'signOn') => {
  const c = activeCategory.value
  
  if (metricType === 'hc') {
    if (c === 'overall') return record[stage].hc.reg + record[stage].hc.intern + record[stage].hc.outsource + record[stage].hc.dispatch + record[stage].hc.partTime
    if (c === 'reg') return record[stage].hc.reg
    if (c === 'intern') return record[stage].hc.intern
    if (c === 'outsource') return record[stage].hc.outsource
    if (c === 'dispatch') return record[stage].hc.dispatch
    if (c === 'partTime') return record[stage].hc.partTime
    return 0
  }
  
  if (metricType === 'monthSalary') {
    if (c === 'overall') return record[stage].salary.month
    if (c === 'reg') return record[stage].monthSalaryBreakdown.reg
    // B场景不显示月薪，这里可作为后备逻辑
    if (c === 'intern') return record[stage].monthSalaryBreakdown.intern
    if (c === 'outsource') return record[stage].monthSalaryBreakdown.outsource
    if (c === 'dispatch') return record[stage].monthSalaryBreakdown.dispatch
    if (c === 'partTime') return record[stage].monthSalaryBreakdown.partTime
    return 0
  }

  if (metricType === 'yearSalary') {
    if (c === 'overall') return record[stage].salary.year
    if (c === 'reg') return record[stage].salaryBreakdown.reg
    if (c === 'intern') return record[stage].salaryBreakdown.intern
    if (c === 'outsource') return record[stage].salaryBreakdown.outsource
    if (c === 'dispatch') return record[stage].salaryBreakdown.dispatch
    if (c === 'partTime') return record[stage].salaryBreakdown.partTime
    return 0
  }

  if (metricType === 'severance') return record[stage].deptBudget.severance
  if (metricType === 'overtime') return record[stage].deptBudget.overtime
  if (metricType === 'signOn') return record[stage].deptBudget.signOn

  return 0
}

const formatValue = (val: number | undefined, isMoney: boolean) => {
  if (val === undefined) return '0'
  if (isMoney) {
    return val.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  }
  return val.toLocaleString('zh-CN', { maximumFractionDigits: 0 })
}

const formatDiff = (val: number | undefined, isMoney: boolean) => {
  if (val === undefined || val === 0) return '0'
  const formatted = formatValue(Math.abs(val), isMoney)
  if (val > 0) return `+${formatted}`
  if (val < 0) return `-${formatted}`
  return formatted
}

const getChangeClass = (val: number | undefined) => {
  if (val === undefined || val === 0) return 'text-gray'
  if (val > 0) return 'text-red'
  if (val < 0) return 'text-green'
  return 'text-gray'
}

const getAlertClass = (val: number) => {
  if (val > 0) return 'alert-red'
  if (val < 0) return 'alert-green'
  return 'alert-gray'
}

onMounted(() => {
  if (summaryCategories.value.length > 0 && !summaryCategories.value.find(c => c.key === activeCategory.value)) {
    activeCategory.value = summaryCategories.value[0].key as CategoryKey
  }
})
</script>

<style scoped>
.adjustment-summary-two-layer {
  background: #fff;
  padding: 12px 16px;
  margin-bottom: 16px;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
}

/* === Top Section: Micro Cards === */
.overview-cards-container {
  width: 100%;
  overflow-x: auto;
  padding-bottom: 12px;
  margin-bottom: 8px;
  /* 隐藏原生滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}
.overview-cards-container::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.overview-cards {
  display: flex;
  gap: 12px;
  flex-wrap: nowrap;
}

.micro-card {
  flex: 0 0 auto;
  width: 140px;
  height: 64px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 8px 12px;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.micro-card:hover {
  border-color: #91caff;
}

.micro-card.active {
  background-color: #e6f7ff;
  border-color: #1890ff;
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.category-title.normal-weight {
  font-weight: 400;
}

.alert-icon {
  font-size: 12px;
  font-weight: bold;
}
.alert-red { color: #ff4d4f; }
.alert-green { color: #52c41a; }
.alert-gray { color: #bfbfbf; }

.card-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metric-line {
  font-size: 12px;
  line-height: 1.2;
}

.placeholder-line {
  visibility: hidden;
}

.metric-name {
  color: #8c8c8c;
}

.metric-val {
  font-weight: 600;
  color: #000;
}

/* === Bottom Section: Detail Table === */
.details-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
  min-height: 480px; /* Data canvas fixed/min height */
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.table-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  padding-left: 8px;
  border-left: 3px solid #1890ff;
}

.table-legend {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #666;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.dot.red { background-color: #ff4d4f; }
.dot.green { background-color: #52c41a; }
.dot.gray { background-color: #bfbfbf; }

/* Table Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.table-wrapper {
  flex: 1;
}

/* === Table Styles overriding Ant Design === */
:deep(.complex-details-table .ant-table-thead > tr > th) {
  padding: 8px;
  font-size: 12px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.complex-details-table .ant-table-thead > tr:first-child > th) {
  background: #f7f9fc;
  font-weight: 600;
}

:deep(.complex-details-table .ant-table-thead > tr:nth-child(2) > th) {
  border-top: 1px solid #f0f0f0;
}

/* 视觉降噪：三级表头样式 */
:deep(.complex-details-table .col-pre) {
  background-color: #fafafa !important;
  color: #8c8c8c;
  font-weight: normal;
}
:deep(.val-pre) {
  color: #8c8c8c;
}

:deep(.complex-details-table .col-post) {
  background-color: #fff !important;
  color: #000;
  font-weight: 600;
  box-shadow: -1px 0 2px rgba(0,0,0,0.02), 1px 0 2px rgba(0,0,0,0.02); /* 轻微阴影凸显 */
}
:deep(.val-post) {
  color: #000;
  font-weight: 600;
}

:deep(.complex-details-table .col-diff) {
  background-color: #fafafa !important;
  font-weight: 500;
}

:deep(.complex-details-table .dept-col) {
  border-right: 2px solid #f0f0f0 !important;
}

.text-red { color: #ff4d4f; }
.text-green { color: #52c41a; }
.text-gray { color: #bfbfbf; font-weight: normal; }
</style>
