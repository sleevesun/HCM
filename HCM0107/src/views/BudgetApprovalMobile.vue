<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NavBar as VanNavBar, showToast, Field as VanField } from 'vant'
import BudgetBasicInfo from '../components/budget/mobile/BudgetBasicInfo.vue'
import BudgetMetricView from '../components/budget/mobile/BudgetMetricView.vue'
import BudgetPersonnelView from '../components/budget/mobile/BudgetPersonnelView.vue'
import BudgetScenarioThreeView from '../components/budget/mobile/BudgetScenarioThreeView.vue'
import { fetchBudgetApprovalMobileData, submitBudgetApprovalDecision } from '../services/budgetApprovalMobileService'
import type {
  BudgetApprovalMobileData,
  BudgetPersonnelSection,
  BudgetScenarioThreeAccordionItem,
  BudgetScenarioThreeGroup,
  BudgetScenarioThreeSummaryMetric
} from '../types/budgetApprovalMobile'

const router = useRouter()
const viewMode = ref<'metric' | 'personnel' | 'scenario-three'>('scenario-three')
const pageData = ref<BudgetApprovalMobileData | null>(null)
const activeAccordionKey = ref<string | null>(null)
const opinion = ref('')

const applyReason = '1. 新增2个产研团队HC，用于支持2026年核心项目开发。\n2. 相应增加年度工薪预算及配套部门级预算。'

const flowRecords = [
  { node: 'HRD', operator: '申请人', result: '发起申请', operatedAt: '2026-03-24 10:00', comment: '发起2026年HC与预算调整申请' },
  { node: 'C&B', operator: '曾天', result: '已同意', operatedAt: '2026-03-24 11:30', comment: '预算范围合理，同意' },
  { node: '二级部门负责人', operator: '张三', result: '已同意', operatedAt: '2026-03-24 14:00', comment: '同意' },
  { node: 'HRBP Head', operator: '刘伟', result: '已同意', operatedAt: '2026-03-24 16:00', comment: '符合业务规划，同意' },
  { node: '业务HR负责人', operator: '杨晓曦', result: '已同意', operatedAt: '2026-03-24 17:30', comment: '同意' },
  { node: '1.1级部门负责人', operator: '李四', result: '待审批', operatedAt: '-', comment: '-' },
  { node: '集团HR负责人&CEO审批', operator: '王五', result: '待审批', operatedAt: '-', comment: '-' },
  { node: '集团HR负责人&CEO审批', operator: '赵六', result: '待审批', operatedAt: '-', comment: '-' }
]

const onClickLeft = () => {
  router.back()
}

const switchView = (mode: 'metric' | 'personnel' | 'scenario-three') => {
  viewMode.value = mode
}

const handleDecision = async (decision: 'approve' | 'reject') => {
  if (decision === 'reject' && !opinion.value.trim()) {
    showToast('请先输入审批意见再进行驳回操作')
    return
  }
  const result = await submitBudgetApprovalDecision(decision)
  showToast(result.decision === 'approve' ? '已通过' : '已拒绝')
}

const basicInfo = computed(() => pageData.value?.basicInfo)
const metricSections = computed(() => pageData.value?.metricSections || [])
const personnelSections = computed<BudgetPersonnelSection[]>(() => {
  const source = pageData.value?.personnelSections || []
  if (!source.length) return []

  const totalSection = source.find(section => section.name === '总计')
  const regularSection = source.find(section => section.name === '正编')

  const budgetMetricLabels = new Set(['离职补偿金(万)', '加班费(万)'])
  const deptBudgetMetrics = regularSection?.metrics.filter(metric => budgetMetricLabels.has(metric.label)) || []

  const middleSections = source
    .filter(section => section.name !== '总计')
    .map(section => {
      if (section.name !== '正编') return section
      return {
        ...section,
        metrics: section.metrics.filter(metric => !budgetMetricLabels.has(metric.label))
      }
    })

  const result: BudgetPersonnelSection[] = []
  if (totalSection) result.push(totalSection)
  result.push(...middleSections)

  if (deptBudgetMetrics.length > 0) {
    result.push({
      name: '部门级预算',
      color: '#6b7280',
      metrics: deptBudgetMetrics
    })
  }

  return result
})

const toNumber = (value: string) => Number(value.replace(/,/g, ''))

const toChangeType = (change: string): 'positive' | 'negative' | 'neutral' => {
  const value = Number(change.replace(/,/g, ''))
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'neutral'
}

const scenarioThreeOverviewMetrics = computed<BudgetScenarioThreeSummaryMetric[]>(() => {
  const annualSection = metricSections.value.find(section => section.title === '年度工薪预算变化（万）')
  if (!annualSection) return []
  const annualBefore = annualSection.details.reduce((sum, item) => sum + toNumber(item.before), 0)
  const annualAfter = annualSection.details.reduce((sum, item) => sum + toNumber(item.after), 0)
  const annualChange = annualAfter - annualBefore
  return [
    {
      label: '总工薪预算(万)',
      before: annualBefore.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
      after: annualAfter.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
      change: annualChange > 0 ? `+${annualChange.toFixed(1)}` : annualChange.toFixed(1),
      changeType: annualChange > 0 ? 'positive' : annualChange < 0 ? 'negative' : 'neutral'
    }
  ]
})

const scenarioThreeGroups = computed<BudgetScenarioThreeGroup[]>(() => {
  const allowedPersonnelTypes = new Set(['正编', '人力外包', '实习'])
  const personnelItems: BudgetScenarioThreeAccordionItem[] = personnelSections.value
    .filter(section => section.name !== '总计')
    .filter(section => allowedPersonnelTypes.has(section.name))
    .map(section => {
      const hcMetric = section.metrics.find(metric => metric.label === 'HC')
      const annualMetric = section.metrics.find(metric => metric.label === '年度工薪(万)')
      
      const panelMetrics = section.metrics.filter(metric => {
        if (section.name === '正编') {
          return metric.label !== '离职补偿金(万)' && metric.label !== '加班费(万)'
        }
        return true
      })

      return {
        key: `personnel-${section.name}`,
        title: section.name,
        summaryMetrics: [
          hcMetric
            ? { label: 'HC', before: hcMetric.before, after: hcMetric.after, change: hcMetric.change, changeType: hcMetric.changeType }
            : { label: 'HC', before: '0', after: '0', change: '0', changeType: 'neutral' as const },
          annualMetric
            ? { label: '年度工薪(万)', before: annualMetric.before, after: annualMetric.after, change: annualMetric.change, changeType: annualMetric.changeType }
            : { label: '年度工薪(万)', before: '0', after: '0', change: '0', changeType: 'neutral' as const }
        ],
        panelMetrics: panelMetrics
      }
    })

  const deptSection = metricSections.value.find(section => section.title === '部门级预算变化（万）')
  
  const deptItems: BudgetScenarioThreeAccordionItem[] = deptSection
    ? deptSection.details.map((detail, index) => ({
      key: `dept-budget-${index}`,
      title: detail.label,
      summaryMetrics: [{
        label: '申请后预算(万)',
        before: detail.before,
        after: detail.after,
        change: detail.change,
        changeType: toChangeType(detail.change)
      }],
      panelMetrics: [{
        label: detail.label,
        before: detail.before,
        after: detail.after,
        change: detail.change,
        changeType: toChangeType(detail.change)
      }]
    }))
    : []

  return [
    {
      key: 'personnel-budget',
      title: '人员工薪预算变化',
      items: personnelItems
    },
    {
      key: 'department-budget',
      title: '部门级预算变化',
      items: deptItems
    }
  ]
})

const handleToggleAccordion = (key: string) => {
  activeAccordionKey.value = activeAccordionKey.value === key ? null : key
}

onMounted(async () => {
  pageData.value = await fetchBudgetApprovalMobileData()
})
</script>

<template>
  <div class="mobile-layout">
    <VanNavBar
      title="工薪预算审批"
      left-arrow
      fixed
      placeholder
      @click-left="onClickLeft"
    >
      <template #right>
        <span class="header-tag">详情页</span>
      </template>
    </VanNavBar>

    <main class="mobile-content">
      <BudgetBasicInfo v-if="basicInfo" :basic-info="basicInfo" />

      <div class="view-switch-wrap">
        <div class="view-switch">
          <button class="view-btn" :class="{ active: viewMode === 'metric' }" @click="switchView('metric')">
            方案一：按指标模块
          </button>
          <button class="view-btn" :class="{ active: viewMode === 'personnel' }" @click="switchView('personnel')">
            方案二：按人员类别
          </button>
          <button class="view-btn" :class="{ active: viewMode === 'scenario-three' }" @click="switchView('scenario-three')">
            方案三：渐进展开
          </button>
        </div>
      </div>

      <BudgetMetricView v-if="viewMode === 'metric'" :metric-sections="metricSections" />
      <BudgetPersonnelView v-else-if="viewMode === 'personnel'" :personnel-sections="personnelSections" />
      <template v-else>
        <BudgetScenarioThreeView
          :overview-metrics="scenarioThreeOverviewMetrics"
          :groups="scenarioThreeGroups"
          :active-key="activeAccordionKey"
          @toggle="handleToggleAccordion"
        />
        <div class="scenario-three-extra">
          <div class="extra-card">
            <div class="section-mini-title">申请说明</div>
            <div class="reason-content">{{ applyReason }}</div>
          </div>

          <div class="extra-card flow-block">
            <div class="section-mini-title">审批记录</div>
            <div class="flow-list">
              <div v-for="(item, index) in flowRecords" :key="index" class="flow-node">
                <div class="flow-node-body">
                  <div class="flow-node-index">{{ index + 1 }}</div>
                  <div class="flow-node-content">
                    <div class="flow-line flow-head">
                      <span class="flow-title">审批人：{{ item.operator }}</span>
                      <span class="flow-result" :class="{'pending': item.result === '待审批'}">{{ item.result }}</span>
                    </div>
                    <div class="flow-line flow-desc">审批节点：{{ item.node }}</div>
                    <div class="flow-line flow-time">审批时间：{{ item.operatedAt }}</div>
                    <div class="flow-line flow-opinion" v-if="item.comment !== '-'">审批意见：{{ item.comment }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="extra-card submit-panel">
            <div class="section-mini-title">审批意见</div>
            <VanField
              v-model="opinion"
              type="textarea"
              rows="4"
              autosize
              maxlength="500"
              placeholder="请输入审批意见..."
            />
          </div>
        </div>
      </template>
    </main>

    <div class="action-bar safe-bottom">
      <button class="action-btn reject" @click="handleDecision('reject')">拒绝</button>
      <button class="action-btn approve" @click="handleDecision('approve')">通过</button>
    </div>
  </div>
</template>

<style scoped>
.mobile-layout {
  max-width: 414px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #f3f4f6;
  padding-bottom: 84px;
}

.mobile-content {
  padding: 12px;
}

.header-tag {
  font-size: 12px;
  font-weight: 500;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 4px;
  padding: 2px 8px;
}

.view-switch-wrap {
  position: sticky;
  top: 46px;
  z-index: 10;
  background: #f3f4f6;
  padding: 8px 0;
}

.view-switch {
  display: flex;
  background: rgba(229, 231, 235, 0.8);
  border-radius: 8px;
  padding: 4px;
}

.view-btn {
  flex: 1;
  border: 0;
  background: transparent;
  border-radius: 6px;
  height: 32px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  touch-action: manipulation;
  white-space: nowrap;
}

.view-btn.active {
  background: #fff;
  color: #2563eb;
  font-weight: 700;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  max-width: 414px;
  margin: 0 auto;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  padding: 12px;
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  height: 40px;
  border: 0;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  touch-action: manipulation;
}

.action-btn.reject {
  background: #dc2626;
}

.action-btn.approve {
  background: #2563eb;
}

.safe-bottom {
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}

.scenario-three-extra {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.extra-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.section-mini-title {
  font-size: 14px;
  color: #333;
  font-weight: 700;
  margin: 0 0 12px 0;
  line-height: 22px;
}

.reason-content {
  font-size: 14px;
  line-height: 22px;
  color: #4b5563;
  white-space: pre-wrap;
  word-break: break-word;
}

.flow-list {
  display: flex;
  flex-direction: column;
}

.flow-node {
  width: 100%;
}

.flow-node + .flow-node {
  border-top: 1px solid #f3f4f6;
}

.flow-node-body {
  padding: 10px 0;
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 10px;
  align-items: center;
}

.flow-node-index {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background: #f3f4f6;
  color: #4b5563;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flow-node-content {
  min-width: 0;
}

.flow-line {
  min-height: 24px;
  font-size: 13px;
  line-height: 20px;
}

.flow-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flow-title {
  color: #111827;
  font-weight: 700;
}

.flow-result {
  color: #111827;
  font-weight: 400;
}

.flow-result.pending {
  color: #f59e0b;
}

.flow-desc,
.flow-time,
.flow-opinion {
  color: #6b7280;
}

.submit-panel {
  padding: 16px;
}

:deep(.van-cell) {
  padding: 0;
  font-size: 14px;
  line-height: 22px;
  background: transparent;
}

@media (max-width: 375px) {
  .mobile-content {
    padding: 8px;
  }

  .view-btn {
    font-size: 11px;
  }
}
</style>
