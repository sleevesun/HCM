<template>
  <div class="department-card" :class="{ 'card-risk': isRisk }">
    <!-- 卡片头部 -->
    <div class="card-header">
      <div class="header-left">
        <h3 class="dept-name">{{ department.name }}</h3>
        <a-badge :status="statusBadge.status" :text="statusBadge.text" style="margin-left: 12px;"/>
      </div>
      <div class="header-right">
        <a-dropdown>
          <a-button type="text" size="small">
            <template #icon><more-outlined /></template>
          </a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item @click="$emit('budgetAdjustment', department)">预算调整</a-menu-item>
              <a-menu-item @click="$emit('openComparison', department)">预实比对</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>

    <!-- 快速概览仪表盘 -->
    <div class="quick-dashboard">
      <div class="kpi-item">
        <span class="kpi-label">26年HC</span>
        <span class="kpi-value">{{ summary.hc26Cur }}</span>
        <span class="kpi-change" :class="getChangeClass(summary.hc26Change)">
          {{ summary.hc26Change > 0 ? '+' : '' }}{{ summary.hc26Change }}%
        </span>
      </div>
      <div class="kpi-item">
        <span class="kpi-label">26年成本</span>
        <span class="kpi-value">{{ formatMoney(summary.cost26Total) }}</span>
        <a-progress
          :percent="parseFloat(summary.cost26Usage)"
          :stroke-color="getProgressColor(summary.cost26Usage)"
          size="small"
        />
      </div>
      <div class="kpi-item">
        <span class="kpi-label">27年HC</span>
        <span class="kpi-value">{{ summary.hc27Plan }}</span>
        <span class="kpi-change">计划</span>
      </div>
    </div>

    <!-- 2026年数据区 -->
    <div class="year-section">
      <div class="year-header" @click="toggleYear('2026')">
        <span class="year-title">2026年数据</span>
        <span class="year-toggle">{{ yearsExpanded['2026'] ? '▼' : '▶' }}</span>
      </div>
      <div v-show="yearsExpanded['2026']" class="year-content">
        <!-- HC卡片组 -->
        <div class="card-group">
          <h4 class="group-title">HC详情</h4>
          <div class="card-grid">
            <EmployeeTypeCard
              v-for="(type, index) in employeeTypes"
              :key="index"
              :type="type"
              :current="department.values.h26_cur[index]"
              :target="department.values.h26_tgt[index]"
            />
          </div>
        </div>

        <!-- 成本卡片组 -->
        <div class="card-group">
          <h4 class="group-title">成本详情</h4>
          <div class="cost-cards">
            <CostCard
              title="累计已发生"
              :value="department.values.cost_acc"
              unit="万"
              color="#00B42A"
            />
            <CostCard
              title="全年预算"
              :value="department.values.cost_year"
              unit="万"
              color="#165DFF"
            />
            <CostCard
              title="剩余预算"
              :value="department.values.cost_year - department.values.cost_acc"
              unit="万"
              color="#FF7D00"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 2027年数据区 -->
    <div class="year-section">
      <div class="year-header" @click="toggleYear('2027')">
        <span class="year-title">2027年数据</span>
        <span class="year-toggle">{{ yearsExpanded['2027'] ? '▼' : '▶' }}</span>
      </div>
      <div v-show="yearsExpanded['2027']" class="year-content">
        <div class="card-group">
          <h4 class="group-title">HC详情</h4>
          <div class="card-grid">
            <EmployeeTypeCard
              v-for="(type, index) in employeeTypes"
              :key="index"
              :type="type"
              :current="department.values.h27_plan[index]"
              :target="department.values.h27_plan[index]"
            />
          </div>
        </div>

        <div class="card-group">
          <h4 class="group-title">成本详情</h4>
          <div class="cost-cards">
            <CostCard
              title="全年预算"
              :value="department.values.cost_year * 1.05"
              unit="万"
              color="#165DFF"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MoreOutlined } from '@ant-design/icons-vue'
import EmployeeTypeCard from './EmployeeTypeCard.vue'
import CostCard from './CostCard.vue'

const props = defineProps<{
  department: any
}>()

const formatMoney = (num: number) => {
  if (num === undefined || num === null) return '0.0'
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

const employeeTypes = [
  { name: '正编', icon: '👤', color: '#165DFF' },
  { name: '实习', icon: '🎓', color: '#00B42A' },
  { name: '劳务派遣', icon: '🔄', color: '#FF7D00' },
  { name: '人力外包', icon: '📦', color: '#722ED1' },
  { name: '兼职', icon: '⏱️', color: '#86909C' }
]

const yearsExpanded = ref<Record<string, boolean>>({
  '2026': false,
  '2027': false
})

const summary = computed(() => {
  const hc26Cur = props.department.values.h26_cur.reduce((a: number, b: number) => a + b, 0)
  const hc26Tgt = props.department.values.h26_tgt.reduce((a: number, b: number) => a + b, 0)
  
  let hc26Change = '0.0'
  if (hc26Cur > 0) {
    hc26Change = (((hc26Tgt - hc26Cur) / hc26Cur) * 100).toFixed(1)
  }
  
  const hc27Plan = props.department.values.h27_plan.reduce((a: number, b: number) => a + b, 0)

  let cost26Usage = '0.0'
  if (props.department.values.cost_year > 0) {
    cost26Usage = ((props.department.values.cost_acc / props.department.values.cost_year) * 100).toFixed(1)
  }
  
  const cost26Total = props.department.values.cost_year

  return {
    hc26Cur,
    hc27Plan,
    cost26Total,
    hc26Change,
    cost26Usage
  }
})

const isRisk = computed(() => {
  return parseFloat(summary.value.cost26Usage) > 100
})

const statusBadge = computed(() => {
  const usage = parseFloat(summary.value.cost26Usage)
  if (usage > 110) return { status: 'error', text: '风险' }
  if (usage > 100) return { status: 'warning', text: '预警' }
  return { status: 'success', text: '正常' }
})

const toggleYear = (year: string) => {
  yearsExpanded.value[year] = !yearsExpanded.value[year]
}

const getChangeClass = (change: string) => {
  if (parseFloat(change) === 0) return 'text-none'
  return parseFloat(change) > 0 ? 'text-up' : 'text-down'
}

const getProgressColor = (percent: string) => {
  const p = parseFloat(percent)
  if (p > 100) return '#F53F3F'
  if (p > 90) return '#FF7D00'
  return '#00B42A'
}
</script>

<style scoped>
.department-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.department-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.department-card.card-risk {
  border-left: 4px solid #F53F3F;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #F2F3F5;
}

.header-left {
  display: flex;
  align-items: center;
}

.dept-name {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1D2129;
}

.quick-dashboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #F5F7FA 0%, #FAFBFC 100%);
  border-radius: 6px;
}

.kpi-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kpi-label {
  font-size: 12px;
  color: #86909C;
}

.kpi-value {
  font-size: 24px;
  font-weight: 700;
  color: #1D2129;
}

.kpi-change {
  font-size: 12px;
  font-weight: 600;
}

.kpi-change.text-up {
  color: #F53F3F;
}

.kpi-change.text-down {
  color: #00B42A;
}

.kpi-change.text-none {
  color: #86909c;
}

.year-section {
  margin-top: 16px;
  border: 1px solid #E5E6EB;
  border-radius: 6px;
  overflow: hidden;
}

.year-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #F7F8FA;
  cursor: pointer;
  transition: background 0.2s;
}

.year-header:hover {
  background: #F2F3F5;
}

.year-title {
  font-weight: 600;
  color: #1D2129;
}

.year-content {
  padding: 16px;
}

.card-group {
  margin-bottom: 20px;
}

.card-group:last-child {
  margin-bottom: 0;
}

.group-title {
  font-size: 14px;
  font-weight: 600;
  color: #4E5969;
  margin: 0 0 12px 0;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.cost-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

@media (max-width: 768px) {
  .quick-dashboard {
    grid-template-columns: 1fr;
  }

  .card-grid,
  .cost-cards {
    grid-template-columns: 1fr;
  }
}
</style>
