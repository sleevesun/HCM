<template>
  <a-modal
    :open="open"
    title="现有人员/HC变更：外派补贴"
    width="100%"
    :footer="null"
    @cancel="handleCancel"
    class="subsidy-edit-modal"
    :style="{ maxWidth: '1500px', top: '20px' }"
  >
    <div class="modal-body-content">
      <a-table
        :data-source="localRows"
        :pagination="false"
        size="small"
        bordered
        row-key="id"
        :scroll="{ x: 'max-content', y: 460 }"
      >
        <a-table-column title="姓名" data-index="name" key="name" :width="180" fixed="left" />
        <a-table-column v-for="m in 12" :key="`m-${m}`" :title="`${m}月`" :width="100" align="right">
          <template #default="{ record }">
            <a-input-number
              v-model:value="record.months[m]"
              :min="0"
              :step="0.1"
              :precision="1"
              size="small"
              :controls="false"
              style="width: 100%"
              :formatter="formatNumberInput"
              :parser="parseNumberInput"
              @change="onInputChange"
            />
          </template>
        </a-table-column>
        <a-table-column title="全年合计" key="total" :width="130" align="right" fixed="right">
          <template #default="{ record }">
            <strong>{{ calcTotal(record.months) }}</strong>
          </template>
        </a-table-column>
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

export interface SubsidyEditRow {
  id: string
  name: string
  months: Record<number, number>
}

const props = defineProps<{
  open: boolean
  rows: SubsidyEditRow[]
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', rows: SubsidyEditRow[]): void
}>()

const localRows = ref<SubsidyEditRow[]>([])

const cloneRows = (rows: SubsidyEditRow[]) => {
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    months: { ...row.months }
  }))
}

const calcTotal = (months: Record<number, number>) => {
  return Object.values(months).reduce((sum, val) => sum + (Number(val) || 0), 0).toLocaleString('zh-CN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })
}

const formatNumberInput = (value: string | number | undefined) => {
  const num = Number(value)
  if (!Number.isFinite(num)) return '0.0'
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

const parseNumberInput = (value: string | undefined) => {
  if (!value) return 0
  const parsed = Number(value.replace(/,/g, '').replace(/[^\d.-]/g, ''))
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  return parsed
}

const onInputChange = () => {
  localRows.value = [...localRows.value]
}

const handleCancel = () => {
  emit('update:open', false)
}

const handleOk = () => {
  emit('save', cloneRows(localRows.value))
  emit('update:open', false)
}

watch(
  () => props.open,
  val => {
    if (val) {
      localRows.value = cloneRows(props.rows)
    }
  }
)
</script>

<style scoped>
.modal-body-content {
  margin-bottom: 16px;
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
