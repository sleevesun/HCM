
<script setup lang="ts">
import { getChangeClass } from '../../../utils/budgetApprovalMobile'
import type { BudgetPersonnelSection } from '../../../types/budgetApprovalMobile'

defineProps<{
  personnelSections: BudgetPersonnelSection[]
}>()
</script>

<template>
  <div class="personnel-view">
    <div v-for="(group, index) in personnelSections" :key="index" class="card">
      <div class="card-header">
        <div class="indicator" :style="{ backgroundColor: group.color }"></div>
        <span class="group-name">{{ group.name }}</span>
      </div>
      
      <div class="card-content">
        <div v-for="(metric, mIndex) in group.metrics" :key="mIndex" class="metric-row" :class="{ 'border-bottom': mIndex < group.metrics.length - 1 }">
          <div class="metric-label">{{ metric.label }}</div>
          <div class="metric-details">
            <div class="detail-line">
              <span class="text-gray-500">申请前</span>
              <span class="text-gray-500">{{ metric.before }}</span>
            </div>
            <div class="detail-line">
              <span class="text-gray-800 font-medium">申请后</span>
              <span class="text-gray-800 font-medium">{{ metric.after }}</span>
            </div>
            <div class="detail-line">
              <span class="text-gray-600">变化</span>
              <span :class="getChangeClass(metric.changeType)" class="font-bold">{{ metric.change }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.personnel-view {
  animation: fadeIn 0.3s ease-in-out;
  padding: 0 12px;
}

.card {
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
  overflow: hidden;
}

.card-header {
  padding: 10px 16px;
  background-color: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
}

.indicator {
  width: 4px;
  height: 14px;
  border-radius: 9999px;
  margin-right: 8px;
}

.group-name {
  font-weight: 700;
  font-size: 14px;
  color: #374151;
}

.card-content {
  padding: 0 16px;
  padding-bottom: 4px;
}

.metric-row {
  display: flex;
  padding: 10px 0;
}

.border-bottom {
  border-bottom: 1px solid #f9fafb;
}

.metric-label {
  width: 96px;
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.metric-details {
  flex: 1;
  padding-left: 16px;
  border-left: 1px solid #f9fafb;
}

.detail-line {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 6px;
}

.detail-line:last-child {
  margin-bottom: 0;
}

.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.text-gray-800 { color: #1f2937; }
.font-medium { font-weight: 500; }
.font-bold { font-weight: 700; }
.text-red { color: #ef4444; }
.text-green { color: #22c55e; }
.text-gray-400 { color: #9ca3af; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
