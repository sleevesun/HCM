<template>
  <a-modal
    :open="open"
    title="现有人员/HC变更：项目标签"
    width="100%"
    @cancel="handleCancel"
    :footer="null"
    class="project-tag-edit-modal"
    :style="{ maxWidth: '1400px', top: '20px' }"
  >
    <div class="modal-header-actions">
      <a-button type="text" @click="handleSwitch">
        <template #icon>💰</template>
        变更工资
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
        <!-- Custom Body Cell for Project Tags Inputs -->
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.key === 'month'">
            <a-select
              v-model:value="record.tags[column.dataIndex]"
              mode="multiple"
              style="width: 100%"
              placeholder="选择标签"
              size="small"
              :options="tagOptions"
              allowClear
              :maxTagCount="1"
              @change="onSelectChange"
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
const tagOptions = ref([
  { label: '高优先级', value: 'high' },
  { label: '研发项目', value: 'dev' },
  { label: '市场推广', value: 'market' },
  { label: '内部优化', value: 'internal' },
  { label: '紧急修复', value: 'urgent' }
])

const generateData = () => {
  return Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    name: i % 2 === 0 ? '张春玲 115502' : '李晓明 115503',
    tags: Array.from({ length: 12 }).reduce((acc: any, _, m) => {
      // Mock initial tags for some cells
      acc[`m${m + 1}`] = m % 3 === 0 ? ['dev'] : []
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
  width: 150, // Slightly wider for tags
  align: 'center'
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
    title: '',
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
  // Reset logic
  Object.keys(record.tags).forEach(key => {
    record.tags[key] = []
  })
  isDirty.value = true
  emit('update:isDirty', true)
}

const handleSwitch = () => {
  emit('switch-modal', 'salary')
}

const onSelectChange = () => {
  isDirty.value = true
  emit('update:isDirty', true)
}

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
</style>
