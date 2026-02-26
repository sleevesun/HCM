
<template>
  <div class="budget-adjustment-page">
    <div class="page-header">
      <div class="header-left">
        <appstore-outlined class="header-icon" />
        <span class="page-title">工薪预算驾驶舱</span>
      </div>
      <div class="header-right">
        <span class="user-info">Hi, 孙运</span>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- Section 1: Adjustment Summary -->
      <AdjustmentSummaryTable :data="summaryData" />

      <!-- Section 2: Before Application -->
      <div class="section-divider">
        <span class="section-label">申请前</span>
      </div>
      <BudgetDetailTable 
        title="申请前 汇总" 
        :data="detailDataBefore" 
        :editable="false"
      />

      <div class="action-buttons-row">
        <div class="left-actions">
          <a-button>
            <template #icon><download-outlined /></template>
            下载模板
          </a-button>
          <a-button>
            <template #icon><import-outlined /></template>
            项目标签导入
          </a-button>
        </div>
        <div class="right-actions">
          <CombinedActionButton />
          <a-button>HC增减</a-button>
          <a-button>不 变</a-button>
        </div>
      </div>

      <!-- Section 3: After Application -->
      <div class="section-divider after-section">
        <span class="section-label">申请通过后</span>
      </div>
      <BudgetDetailTable 
        title="申请通过后 汇总" 
        :data="detailDataAfter" 
        :editable="true"
      />
      
      <!-- Action Footer -->
      <div class="page-footer">
        <a-button>返回</a-button>
        <a-button type="primary" class="submit-btn">创建审批单</a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AppstoreOutlined, DownloadOutlined, ImportOutlined } from '@ant-design/icons-vue';
import AdjustmentSummaryTable from '../components/budget/AdjustmentSummaryTable.vue';
import BudgetDetailTable from '../components/budget/BudgetDetailTable.vue';
import CombinedActionButton from '../components/CombinedActionButton.vue';
import { summaryData, detailDataBefore, detailDataAfter } from '../mocks/budgetData';
</script>

<style scoped>
.budget-adjustment-page {
  background: #f0f2f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-header {
  height: 48px;
  background: #001529; /* Dark header like screenshot */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  color: #fff;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 16px;
}

.page-title {
  font-size: 16px;
  font-weight: 500;
}

.content-wrapper {
  padding: 16px 24px;
  flex: 1;
}

.section-divider {
  margin: 16px 0 8px;
  display: flex;
  align-items: center;
}

.section-label {
  font-size: 14px;
  font-weight: 500;
  color: #000;
  margin-right: 8px;
}

.after-section .section-label {
  color: #1890ff; /* Highlight for "After" section */
}

.action-buttons-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0;
  padding: 0 8px;
}

.left-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.right-actions {
  display: flex;
  gap: 12px;
}

.page-footer {
  background: #fff;
  padding: 12px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #f0f0f0;
  position: sticky;
  bottom: 0;
  z-index: 100;
}

.submit-btn {
  background: #1890ff;
}
</style>
