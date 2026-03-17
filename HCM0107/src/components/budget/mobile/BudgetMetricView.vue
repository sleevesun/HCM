
<script setup lang="ts">
import { getChangeClass } from '../../../utils/budgetApprovalMobile'
import type { BudgetMetricSection } from '../../../types/budgetApprovalMobile'

defineProps<{
  metricSections: BudgetMetricSection[]
}>()
</script>

<template>
  <div class="metric-view">
    <div class="card">
      <div class="card-header">
        预算变化详情
      </div>

      <div v-for="(group, groupIndex) in metricSections" :key="groupIndex" class="metric-group">
        <div class="group-title" :class="{'text-purple': group.title.includes('部门级')}">{{ group.title }}</div>
        <div class="group-content">
          <div class="data-row border-bottom">
            <div class="row-header">申请前</div>
            <div class="row-content">
              <div v-for="(detail, dIndex) in group.details" :key="'before-'+dIndex" class="data-item">
                <span>{{ detail.label }}</span>
                <span>{{ detail.before }}</span>
              </div>
            </div>
          </div>
          <div class="data-row border-bottom">
            <div class="row-header highlight">通过后</div>
            <div class="row-content">
              <div v-for="(detail, dIndex) in group.details" :key="'after-'+dIndex" class="data-item highlight">
                <span>{{ detail.label }}</span>
                <span>{{ detail.after }}</span>
              </div>
            </div>
          </div>
          <div class="data-row">
            <div class="row-header highlight">变化</div>
            <div class="row-content">
              <div v-for="(detail, dIndex) in group.details" :key="'change-'+dIndex" class="data-item">
                <span class="text-gray-600">{{ detail.label }}</span>
                <span :class="getChangeClass(detail.changeType)" class="font-bold">{{ detail.change }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.metric-view {
  animation: fadeIn 0.3s ease-in-out;
}

.card {
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  font-weight: bold;
  color: #1f2937;
}

.group-title {
  background-color: rgba(249, 250, 251, 0.8);
  padding: 8px 0;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  border-top: 1px solid #f3f4f6;
}

.text-purple {
  color: #7e22ce;
}

.group-content {
  padding: 0 16px;
}

.data-row {
  display: flex;
  padding: 10px 0;
}

.border-bottom {
  border-bottom: 1px solid #f9fafb;
}

.row-header {
  width: 80px;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #6b7280;
}

.row-header.highlight {
  color: #1f2937;
  font-weight: 500;
}

.row-content {
  flex: 1;
  padding-left: 16px;
}

.data-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 6px;
}

.data-item:last-child {
  margin-bottom: 0;
}

.data-item.highlight {
  color: #1f2937;
  font-weight: 500;
}

.text-gray-600 {
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

.font-bold {
  font-weight: 700;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
