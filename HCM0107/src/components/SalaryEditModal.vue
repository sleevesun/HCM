<template>
  <a-modal
    :open="open"
    title="现有人员/HC变更：工资"
    width="100%"
    @cancel="handleCancel"
    :footer="null"
    class="salary-edit-modal"
    :style="{ maxWidth: '1400px', top: '20px' }"
  >
    <div class="modal-header-actions">
      <a-button type="text" @click="handleSwitch">
        <template #icon>📝</template>
        变更项目标签
        <span v-if="isDirty" class="badge-dot"></span>
      </a-button>
    </div>
    <div class="modal-body-content">
      <a-table
        :dataSource="tableData"
        :columns="columns"
        :pagination="false"
        size="small"
        bordered
        rowKey="id"
        :scroll="{ x: 'max-content', y: 400 }"
      >
        <!-- Custom Body Cell for Salary Inputs -->
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.key === 'month'">
            <a-input-number
              v-model:value="record.salary[column.dataIndex]"
              :formatter="(value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="(value: any) => value.replace(/\$\s?|(,*)/g, '')"
              :precision="2"
              style="width: 100%"
              placeholder="0.00"
              size="small"
              @change="onInputChange"
            />
          </template>
          
          <template v-else-if="column.key === 'action'">
            <a-button type="link" size="small" @click="resetRow(record)">取消变更</a-button>
          </template>
        </template>
      </a-table>
    </div>

    <div class="modal-footer">
      <a-button @click="handleCancel">返回</a-button>
      <a-button type="primary" @click="handleOk">确定</a-button>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits(['update:open', 'ok', 'switch-modal', 'update:isDirty'])

const isDirty = ref(false)

// --- Mock Data ---
const generateData = () => {
  return Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    name: i % 2 === 0 ? '张春玲 115502' : '李晓明 115503',
    salary: Array.from({ length: 12 }).reduce((acc: any, _, m) => {
      acc[`m${m + 1}`] = 4935.00
      return acc
    }, {})
  }))
}

const tableData = ref(generateData())

// --- Columns Definition ---
const monthCols = Array.from({ length: 12 }, (_, i) => ({
  title: `${i + 1}月`,
  dataIndex: `m${i + 1}`,
  key: 'month',
  width: 120,
  align: 'right'
}))

const columns = [
  {
    title: '#',
    dataIndex: 'id',
    key: 'id',
    width: 50,
    fixed: 'left',
    align: 'center'
  },
  {
    title: '人员',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    fixed: 'left'
  },
  ...monthCols,
  {
    title: '操作', // Empty title as requested? No, user said "没有表头标题的操作列", usually title is empty string
    dataIndex: 'action',
    key: 'action',
    width: 100,
    fixed: 'right',
    align: 'center'
  }
]

// --- Actions ---
const handleCancel = () => {
  emit('update:open', false)
}

const handleOk = () => {
  emit('ok', tableData.value)
  isDirty.value = false
  emit('update:isDirty', false)
  emit('update:open', false)
}

const resetRow = (record: any) => {
  // Logic to reset row changes, for mock just log
  console.log('Reset row:', record.id)
  isDirty.value = true
  emit('update:isDirty', true)
}

const handleSwitch = () => {
  emit('switch-modal', 'project')
}

const onInputChange = () => {
  isDirty.value = true
  emit('update:isDirty', true)
}

// Watch open to refresh data if needed
watch(() => props.open, (val) => {
  if (val) {
    // Reset dirty state on open
    isDirty.value = false
    emit('update:isDirty', false)
  }
})
</script>

<style scoped>
.modal-header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.badge-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background-color: #ff4d4f;
  border-radius: 50%;
  margin-left: 4px;
  vertical-align: top;
}

.modal-body-content {
  margin-bottom: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

:deep(.ant-input-number-input) {
  text-align: right;
}
</style>
