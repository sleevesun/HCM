
<template>
  <div class="budget-cell-container" :class="{ 'is-group': isGroup }">
    <template v-if="!isGroup">
      <div v-if="editable" class="cell-edit-mode">
        <a-input-number
          v-model:value="localSalary"
          :min="0"
          :precision="1"
          size="small"
          class="salary-input"
          placeholder="工资"
        >
        </a-input-number>
      </div>
      <div v-else class="cell-view-mode">
        <div class="view-row salary-row">
          <span class="value">{{ formatMoney(salary) }}</span>
        </div>
      </div>
    </template>
    <template v-else>
      <span class="group-value">{{ formatMoney(salary) }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  salary: number;
  project?: string;
  isGroup?: boolean;
  editable?: boolean;
}>();

const emit = defineEmits(['update:salary', 'update:project']);

const localSalary = ref(props.salary);
const localProject = ref(props.project);

// const projectOptions = [
//   { value: '项目A', label: '项目A' },
//   { value: '项目B', label: '项目B' },
//   { value: '项目C', label: '项目C' },
// ];

watch(() => props.salary, (val) => {
  localSalary.value = val;
});

watch(localSalary, (val) => {
  emit('update:salary', val);
});

watch(localProject, (val) => {
  emit('update:project', val);
});

const formatMoney = (val: number) => {
  return val?.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) || '0.0';
};
</script>

<style scoped>
.budget-cell-container {
  padding: 2px;
}

.cell-edit-mode {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.salary-input {
  width: 100%;
  font-size: 12px;
}

.project-select {
  width: 100%;
  font-size: 12px;
}

.cell-view-mode {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.view-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.label {
  color: #8c8c8c;
  font-size: 10px;
  margin-right: 4px;
  transform: scale(0.9);
}

.value {
  font-weight: 500;
  color: #262626;
  font-size: 13px;
}

.tag-project {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #52c41a;
  font-size: 10px;
  padding: 0 4px;
  border-radius: 2px;
  transform: scale(0.9);
}

.is-group .group-value {
  font-weight: 700;
  font-size: 13px;
  color: #1f1f1f;
}
</style>
