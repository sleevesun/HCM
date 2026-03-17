
<template>
  <div class="budget-detail-table">
    <div class="detail-header">
      <div class="title-row">
        <div class="left-header">
          <span class="section-title">{{ title }}</span>
          <a-button 
            v-if="!isAfterApplication"
            type="link" 
            size="small" 
            class="select-all-btn"
            @click="toggleSelectAll"
          >
            {{ isAllSelected ? '取消全选' : '全选' }}
          </a-button>
        </div>
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
               <template v-if="!isAfterApplication">
                 <template v-if="record.name === '过渡期HC'">
                   <a-tooltip title="删除">
                     <delete-outlined class="action-icon delete-icon danger" @click="deleteRow(record.id)" />
                   </a-tooltip>
                 </template>
                 <template v-else>
                   <a-checkbox 
                     :checked="selectedIds.has(record.id)"
                     @change="(e: any) => toggleSelection(record.id, e.target.checked)"
                     class="row-checkbox"
                   />
                 </template>
               </template>
               <template v-else>
                 <a-tooltip title="修改">
                   <edit-outlined class="action-icon edit-icon" />
                 </a-tooltip>
                 <a-tooltip title="删除" v-if="record.name === 'NEW HC'">
                   <delete-outlined class="action-icon delete-icon danger" />
                 </a-tooltip>
               </template>
               <span class="emp-tag" :class="record.tag" style="margin-right: 8px; margin-left: 0; text-align: left;">{{ getDisplayTag(record) }}</span>
               <div style="flex: 1; text-align: right;">
                 <PersonnelPopover :name="record.name" :tag="getDisplayTag(record)" />
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
import { ref, computed } from 'vue';
import type { BudgetItem } from '../../mocks/budgetData';
import PersonnelPopover from './PersonnelPopover.vue';
import BudgetCell from './BudgetCell.vue';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';

const props = defineProps<{
  title: string;
  data: BudgetItem[];
  editable?: boolean;
  isAfterApplication?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:selected-ids', value: string[]): void
}>()

const searchText = ref('');
const selectedIds = ref(new Set<string>());

const emitSelectedIds = () => {
  emit('update:selected-ids', Array.from(selectedIds.value))
}

// Flatten data to get all person items
const allPersonIds = computed(() => {
  const ids: string[] = [];
  const traverse = (items: BudgetItem[]) => {
    items.forEach(item => {
      if (item.type === 'person' && item.name !== '过渡期HC') {
        ids.push(item.id);
      }
      if (item.children) {
        traverse(item.children);
      }
    });
  };
  traverse(props.data);
  return ids;
});

const isAllSelected = computed(() => {
  return allPersonIds.value.length > 0 && allPersonIds.value.every(id => selectedIds.value.has(id));
});

const toggleSelection = (id: string, checked: boolean) => {
  if (checked) {
    selectedIds.value.add(id);
  } else {
    selectedIds.value.delete(id);
  }
  emitSelectedIds()
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value.clear();
  } else {
    allPersonIds.value.forEach(id => selectedIds.value.add(id));
  }
  emitSelectedIds()
};

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

const getDisplayTag = (record: BudgetItem) => {
  if (record.name === '过渡期HC') return '过渡';
  return record.tagName || '-';
};

const deleteRow = (targetId: string) => {
  const removeInTree = (items: BudgetItem[]): boolean => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.id === targetId) {
        items.splice(i, 1);
        return true;
      }
      if (item.children && removeInTree(item.children)) {
        return true;
      }
    }
    return false;
  };
  removeInTree(props.data);
  selectedIds.value.delete(targetId);
  emitSelectedIds()
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

.left-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-all-btn {
  font-size: 12px;
  padding: 0;
  height: auto;
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

.row-checkbox {
  margin-right: 8px;
}

.action-icon {
  font-size: 14px;
  cursor: pointer;
  margin-right: 8px;
  color: #1890ff;
}

.action-icon.danger {
  color: #ff4d4f;
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
