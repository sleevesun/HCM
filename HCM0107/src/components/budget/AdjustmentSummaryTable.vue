
<template>
  <div class="adjustment-summary">
    <div class="summary-header">
      <span class="title">调整汇总</span>
    </div>
    <a-table
      :data-source="data"
      :pagination="false"
      bordered
      size="small"
      class="summary-table"
      row-key="id"
    >
      <a-table-column title="申请部门" data-index="deptName" :width="200" fixed="left">
        <template #default="{ text }">
          <strong>{{ text }}</strong>
        </template>
      </a-table-column>

      <a-table-column-group title="HC" :customHeaderCell="customHeaderHC">
        <a-table-column-group title="申请前" :customHeaderCell="customHeaderHC">
          <a-table-column title="正编" align="right" :width="60" :customHeaderCell="customHeaderHC" :customCell="customCellHC">
            <template #default="{ record }">{{ record.pre.hc.reg }}</template>
          </a-table-column>
          <a-table-column title="其他人员" align="right" :width="80" :customHeaderCell="customHeaderHC" :customCell="customCellHC">
            <template #default="{ record }">{{ record.pre.hc.other }}</template>
          </a-table-column>
        </a-table-column-group>

        <a-table-column-group title="申请通过后" :customHeaderCell="customHeaderHC">
          <a-table-column title="正编" align="right" :width="60" :customHeaderCell="customHeaderHC" :customCell="customCellHC">
            <template #default="{ record }">{{ record.post.hc.reg }}</template>
          </a-table-column>
          <a-table-column title="其他人员" align="right" :width="80" :customHeaderCell="customHeaderHC" :customCell="customCellHC">
            <template #default="{ record }">{{ record.post.hc.other }}</template>
          </a-table-column>
        </a-table-column-group>

        <a-table-column-group title="变化" :customHeaderCell="customHeaderHCEnd">
          <a-table-column title="正编" align="right" :width="60" :customHeaderCell="customHeaderHC" :customCell="customCellHC">
            <template #default="{ record }">
              <span :class="getDiffClass(record.diff.hc.reg)">
                {{ formatDiff(record.diff.hc.reg) }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="其他人员" align="right" :width="80" :customHeaderCell="customHeaderHCEnd" :customCell="customCellHCEnd">
            <template #default="{ record }">
              <span :class="getDiffClass(record.diff.hc.other)">
                {{ formatDiff(record.diff.hc.other) }}
              </span>
            </template>
          </a-table-column>
        </a-table-column-group>
      </a-table-column-group>

      <a-table-column-group title="月度工薪预算 (万)" :customHeaderCell="rowSpan2Month">
        <a-table-column-group title="-" :customHeaderCell="hiddenHeader">
          <a-table-column title="申请前" align="right" :width="100" :customHeaderCell="customHeaderMonth" :customCell="customCellMonth">
            <template #default="{ record }">{{ formatMoney(record.pre.salary.month) }}</template>
          </a-table-column>
          <a-table-column title="申请通过后" align="right" :width="100" :customHeaderCell="customHeaderMonth" :customCell="customCellMonth">
            <template #default="{ record }">{{ formatMoney(record.post.salary.month) }}</template>
          </a-table-column>
          <a-table-column title="变化" align="right" :width="100" :customHeaderCell="customHeaderMonthEnd" :customCell="customCellMonthEnd">
            <template #default="{ record }">
              <span :class="getDiffClass(record.diff.salary.month)">
                {{ formatDiff(record.diff.salary.month) }}
              </span>
            </template>
          </a-table-column>
        </a-table-column-group>
      </a-table-column-group>

      <a-table-column-group title="年度工薪预算 (万)" :customHeaderCell="rowSpan2Year">
        <a-table-column-group title="-" :customHeaderCell="hiddenHeader">
          <a-table-column title="申请前" align="right" :width="100" :customHeaderCell="customHeaderYear" :customCell="customCellYear">
            <template #default="{ record }">{{ formatMoney(record.pre.salary.year) }}</template>
          </a-table-column>
          <a-table-column title="申请通过后" align="right" :width="100" :customHeaderCell="customHeaderYear" :customCell="customCellYear">
            <template #default="{ record }">{{ formatMoney(record.post.salary.year) }}</template>
          </a-table-column>
          <a-table-column title="变化" align="right" :width="100" :customHeaderCell="customHeaderYearEnd" :customCell="customCellYearEnd">
            <template #default="{ record }">
              <span :class="getDiffClass(record.diff.salary.year)">
                {{ formatDiff(record.diff.salary.year) }}
              </span>
            </template>
          </a-table-column>
        </a-table-column-group>
      </a-table-column-group>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import type { AdjustmentSummaryItem } from '../../mocks/budgetData';

defineProps<{
  data: AdjustmentSummaryItem[];
}>();

const formatDiff = (val: number) => {
  if (val > 0) return `+${val}`;
  return val;
};

const getDiffClass = (val: number) => {
  if (val > 0) return 'text-red';
  if (val < 0) return 'text-green';
  return '';
};

const formatMoney = (val: number) => {
  return val.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

const rowSpan2Month = () => {
  return {
    rowSpan: 2,
    class: 'header-month'
  };
};

const rowSpan2Year = () => {
  return {
    rowSpan: 2,
    class: 'header-year'
  };
};

const hiddenHeader = () => {
  return {
    style: { display: 'none' }
  };
};

const customHeaderMonth = () => {
  return { class: 'header-month' }
}

const customHeaderYear = () => {
  return { class: 'header-year' }
}

const customHeaderHC = () => {
  return { class: 'header-hc' }
}

const customCellMonth = () => {
  return { class: 'cell-month' }
}

const customCellYear = () => {
  return { class: 'cell-year' }
}

const customCellHC = () => {
  return { class: 'cell-hc' }
}

const customHeaderHCEnd = () => {
  return { class: 'header-hc section-end' }
}

const customCellHCEnd = () => {
  return { class: 'cell-hc section-end' }
}

const customHeaderMonthEnd = () => {
  return { class: 'header-month section-end' }
}

const customCellMonthEnd = () => {
  return { class: 'cell-month section-end' }
}

const customHeaderYearEnd = () => {
  return { class: 'header-year section-end' }
}

const customCellYearEnd = () => {
  return { class: 'cell-year section-end' }
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
  margin-bottom: 12px;
}
.title {
  font-weight: 500;
  font-size: 14px;
  color: #000;
}
.text-red {
  color: #ff4d4f;
  font-weight: 500;
}
.text-green {
  color: #52c41a;
  font-weight: 500;
}

:deep(.ant-table-thead > tr > th) {
  text-align: center;
  font-weight: 500;
  transition: background 0.3s;
  /* Ensure all headers have the same base background */
  background-color: #fafafa !important;
  color: #000000d9;
  vertical-align: middle;
}

/* Override previous colored backgrounds to uniform gray */
:deep(.header-hc),
:deep(.header-month),
:deep(.header-year) {
  background-color: #fafafa !important;
  color: #000000d9;
}

/* Reset cell backgrounds to white */
:deep(.cell-month),
:deep(.cell-year),
:deep(.cell-hc) {
  background-color: #fff !important;
}

/* Borders */
:deep(.ant-table-thead > tr > th) {
  border-right: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

/* Section End Borders - Keep the thick borders for separation */
:deep(.section-end) {
  border-right: 2px solid #d9d9d9 !important;
}

:deep(.ant-table-cell-fix-left-last) {
  border-right: 2px solid #d9d9d9 !important;
}
</style>
