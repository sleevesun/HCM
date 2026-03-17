
<script setup lang="ts">
import type { BudgetBasicInfo } from '../../../types/budgetApprovalMobile'

defineProps<{
  basicInfo: BudgetBasicInfo
}>()
</script>

<template>
  <div class="basic-info-card">
    <div class="info-row">
      <span class="label">申请类型</span>
      <span class="value">{{ basicInfo.type }}</span>
    </div>
    <div class="info-row">
      <span class="label">申请部门</span>
      <span class="value">{{ basicInfo.department }}</span>
    </div>
    <div class="info-row">
      <span class="label">申请人</span>
      <span class="value">{{ basicInfo.applicant }}</span>
    </div>
  </div>
</template>

<style scoped>
.basic-info-card {
  background-color: #fff;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  color: #6b7280;
  font-size: 14px;
  width: 96px;
}

.value {
  color: #1f2937;
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  text-align: right;
}
</style>
