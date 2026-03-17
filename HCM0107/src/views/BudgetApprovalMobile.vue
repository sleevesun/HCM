<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NavBar as VanNavBar, showToast } from 'vant'
import BudgetBasicInfo from '../components/budget/mobile/BudgetBasicInfo.vue'
import BudgetMetricView from '../components/budget/mobile/BudgetMetricView.vue'
import BudgetPersonnelView from '../components/budget/mobile/BudgetPersonnelView.vue'
import BudgetScenarioThreeView from '../components/budget/mobile/BudgetScenarioThreeView.vue'
import { fetchBudgetApprovalMobileData, submitBudgetApprovalDecision } from '../services/budgetApprovalMobileService'
import type {
  BudgetApprovalMobileData,
  BudgetScenarioThreeAccordionItem,
  BudgetScenarioThreeGroup,
  BudgetScenarioThreeSummaryMetric
} from '../types/budgetApprovalMobile'

const router = useRouter()
const viewMode = ref<'metric' | 'personnel' | 'scenario-three'>('scenario-three')
const pageData = ref<BudgetApprovalMobileData | null>(null)
const activeAccordionKey = ref<string | null>(null)

const onClickLeft = () => {
  router.back()
}

const switchView = (mode: 'metric' | 'personnel' | 'scenario-three') => {
  viewMode.value = mode
}

const handleDecision = async (decision: 'approve' | 'reject') => {
  const result = await submitBudgetApprovalDecision(decision)
  showToast(result.decision === 'approve' ? '已通过' : '已拒绝')
}

const basicInfo = computed(() => pageData.value?.basicInfo)
const metricSections = computed(() => pageData.value?.metricSections || [])
const personnelSections = computed(() => pageData.value?.personnelSections || [])

const toNumber = (value: string) => Number(value.replace(/,/g, ''))

const toChangeType = (change: string): 'positive' | 'negative' | 'neutral' => {
  const value = Number(change.replace(/,/g, ''))
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'neutral'
}

const scenarioThreeOverviewMetrics = computed<BudgetScenarioThreeSummaryMetric[]>(() => {
  const hcSection = metricSections.value.find(section => section.title === 'HC变化')
  const annualSection = metricSections.value.find(section => section.title === '年度工薪预算变化（万）')
  if (!hcSection || !annualSection) return []
  const hcBefore = hcSection.details.reduce((sum, item) => sum + toNumber(item.before), 0)
  const hcAfter = hcSection.details.reduce((sum, item) => sum + toNumber(item.after), 0)
  const annualBefore = annualSection.details.reduce((sum, item) => sum + toNumber(item.before), 0)
  const annualAfter = annualSection.details.reduce((sum, item) => sum + toNumber(item.after), 0)
  const hcChange = hcAfter - hcBefore
  const annualChange = annualAfter - annualBefore
  return [
    {
      label: '申请后总HC',
      after: String(hcAfter),
      change: hcChange > 0 ? `+${hcChange}` : String(hcChange),
      changeType: hcChange > 0 ? 'positive' : hcChange < 0 ? 'negative' : 'neutral'
    },
    {
      label: '申请后总工薪预算(万)',
      after: annualAfter.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
      change: annualChange > 0 ? `+${annualChange.toFixed(1)}` : annualChange.toFixed(1),
      changeType: annualChange > 0 ? 'positive' : annualChange < 0 ? 'negative' : 'neutral'
    }
  ]
})

const scenarioThreeGroups = computed<BudgetScenarioThreeGroup[]>(() => {
  const personnelItems: BudgetScenarioThreeAccordionItem[] = personnelSections.value
    .filter(section => section.name !== '总计')
    .map(section => {
      const hcMetric = section.metrics.find(metric => metric.label === 'HC')
      const annualMetric = section.metrics.find(metric => metric.label === '年度工薪(万)')
      
      // Filter logic:
      // For '正编', exclude '离职补偿金(万)' and '加班费(万)'
      // For others, exclude '月度工薪(万)'
      const panelMetrics = section.metrics.filter(metric => {
        if (section.name === '正编') {
          return metric.label !== '离职补偿金(万)' && metric.label !== '加班费(万)'
        } else {
          return metric.label !== '月度工薪(万)'
        }
      })

      return {
        key: `personnel-${section.name}`,
        title: section.name,
        summaryMetrics: [
          hcMetric
            ? { label: 'HC', after: hcMetric.after, change: hcMetric.change, changeType: hcMetric.changeType }
            : { label: 'HC', after: '0', change: '0', changeType: 'neutral' as const },
          annualMetric
            ? { label: '年度工薪(万)', after: annualMetric.after, change: annualMetric.change, changeType: annualMetric.changeType }
            : { label: '年度工薪(万)', after: '0', change: '0', changeType: 'neutral' as const }
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
      <BudgetScenarioThreeView
        v-else
        :overview-metrics="scenarioThreeOverviewMetrics"
        :groups="scenarioThreeGroups"
        :active-key="activeAccordionKey"
        @toggle="handleToggleAccordion"
      />
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

@media (max-width: 375px) {
  .mobile-content {
    padding: 8px;
  }

  .view-btn {
    font-size: 11px;
  }
}
</style>
