
<template>
  <div class="budget-detail-table">
    <div class="detail-header">
      <div class="title-row">
        <span class="section-title">{{ title }}</span>
        <div class="header-actions">
           <a-input-search
              v-model:value="searchText"
              placeholder="搜索姓名/工号/项目标签"
              style="width: 250px"
              size="small"
           />
        </div>
      </div>
    </div>
    
    <a-table
      :data-source="data"
      :pagination="false"
      bordered
      size="small"
      class="detail-table"
      row-key="id"
      :scroll="{ x: 'max-content', y: 500 }"
      :expandIconColumnIndex="0"
    >
      <a-table-column title="部门/HC" data-index="name" :width="220" fixed="left">
        <template #default="{ record }">
          <div class="name-cell">
            <template v-if="record.type === 'person'">
               <span class="emp-tag" :class="record.tag" style="margin-right: 8px; margin-left: 0; text-align: left;">{{ record.tagName }}</span>
               <div style="flex: 1; text-align: right;">
                 <PersonnelPopover :name="record.name" :tag="record.tagName" />
               </div>
            </template>
            <template v-else>
               <span class="group-name">{{ record.name }}</span>
            </template>
          </div>
        </template>
      </a-table-column>
      
      <a-table-column title="HC" :width="60" align="center" fixed="left">
         <template #default="{ record }">
            <span v-if="record.type !== 'person'">{{ record.hcCount || '-' }}</span>
            <span v-else>1</span>
         </template>
      </a-table-column>
      
      <a-table-column v-for="m in 12" :key="m" :title="`${m}月`" :width="140" align="right">
        <template #default="{ record }">
          <BudgetCell
            :salary="record.months?.[m]?.salary"
            :project="record.months?.[m]?.project"
            :is-group="record.type !== 'person'"
            :editable="editable && record.type === 'person'"
            @update:salary="(val) => updateSalary(record, m, val)"
            @update:project="(val) => updateProject(record, m, val)"
          />
        </template>
      </a-table-column>
      
      <a-table-column title="全年工资" :width="100" align="right" fixed="right">
         <template #default="{ record }">
            {{ formatMoney(record.totalYear) }}
         </template>
      </a-table-column>

      <a-table-column title="全年总工薪" :width="120" align="right" fixed="right">
         <template #default="{ record }">
             <strong>{{ formatMoney(record.totalSalary || record.totalYear * 1.4) }}</strong>
         </template>
      </a-table-column>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { BudgetItem } from '../../mocks/budgetData';
import PersonnelPopover from './PersonnelPopover.vue';
import BudgetCell from './BudgetCell.vue';

const props = defineProps<{
  title: string;
  data: BudgetItem[];
  editable?: boolean;
}>();

const searchText = ref('');

const formatMoney = (val: number) => {
  return val?.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) || '-';
};

const updateSalary = (record: BudgetItem, month: number, val: number) => {
  if (record.months && record.months[month]) {
    record.months[month].salary = val;
    // Trigger recalculation logic here if needed (e.g. update totals)
    // For now, we assume parent handles deep reactivity or we just mutate
  }
};

const updateProject = (record: BudgetItem, month: number, val: string) => {
  if (record.months && record.months[month]) {
    record.months[month].project = val;
  }
};
</script>

<style scoped>
.budget-detail-table {
  background: #fff;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.detail-header {
  margin-bottom: 12px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-weight: 500;
  font-size: 14px;
  color: #000;
}

.name-cell {
  display: flex;
  align-items: center;
}

.group-name {
  font-weight: 500;
}

.emp-tag {
  font-size: 12px;
  padding: 0 4px;
  border-radius: 4px;
  margin-left: 8px;
  height: 20px;
  line-height: 18px;
  display: inline-block;
  border: 1px solid transparent;
}

/* Tag Styles extracted from CSS */
.emp-tag.REG {
  border-color: #aed1ff;
  background: #ecf4ff;
  color: #6195f6;
}
.emp-tag.INT {
  border-color: #a7e0e1;
  background: #f3fbfb;
  color: #01a4a6;
}
.emp-tag.OUT {
  border-color: #722ed1;
  background: #f9f0ff;
  color: #722ed1;
}
.emp-tag.DIS {
  border-color: #01a4a6;
  background: #e6fffb;
  color: #5dc2c2;
}
.emp-tag.PTE {
  border-color: #d9d9d9;
  background: #f7f7f7;
  color: #5a5a5a;
}

.sub-label {
    color: #999;
    font-size: 12px;
}

:deep(.ant-table-thead > tr > th) {
  text-align: center;
  background: #fafafa;
  font-weight: 500;
}
</style>
