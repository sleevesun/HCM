<template>
  <a-modal
    :open="open"
    title="预算变更记录"
    width="1000px"
    @update:open="$emit('update:open', $event)"
    :footer="null"
    centered
  >
    <div class="log-container">
      <div class="filter-bar">
        <div class="filter-left">
          <a-space>
            <a-select
              v-model:value="filterType"
              placeholder="所有业务类型"
              style="width: 180px"
              allow-clear
            >
              <a-select-option value="TRANSFER">带HC调动</a-select-option>
              <a-select-option value="APPROVAL">预算审批</a-select-option>
              <a-select-option value="DEPT_MOVE">部门调整</a-select-option>
            </a-select>
          </a-space>
        </div>
        <div class="filter-right">
          <a-button @click="handleExport">
            <template #icon><DownloadOutlined /></template>
            导出记录
          </a-button>
        </div>
      </div>

      <a-table
        :columns="columns"
        :data-source="filteredLogs"
        :pagination="{ pageSize: 10 }"
        row-key="id"
        size="middle"
        bordered
      >
        <template #expandColumnTitle>
          <span>明细</span>
        </template>
        <template #expandedRowRender="{ record }">
          <div class="detail-table-wrapper">
            <div class="detail-header">
              <span class="detail-title">变更明细</span>
            </div>
            <table class="detail-table">
              <thead>
                <tr>
                  <th>财务科目名称</th>
                  <th>项目标签</th>
                  <th class="text-right">变动金额 (元)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="detail in record.details" :key="detail.accountId + detail.projectTag">
                  <td>{{ detail.accountName }}</td>
                  <td>
                    <a-tag color="cyan">{{ detail.projectTag }}</a-tag>
                  </td>
                  <td :class="['text-right', getAmountClass(detail.amount)]">
                    {{ formatAmount(detail.amount) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'hcChange'">
            <span :class="getHCClass(text)">
              {{ text === '-' ? '-' : (text > 0 ? '+' + text : text) }}
            </span>
          </template>
          <template v-else-if="column.dataIndex === 'totalBudgetChange'">
            <span :class="getAmountClass(text)">
              {{ formatAmount(text) }}
            </span>
          </template>
          <template v-else-if="column.dataIndex === 'type'">
            <a-tag :color="getTypeColor(record)">{{ text }}</a-tag>
          </template>
        </template>
      </a-table>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSalaryBudgetStore } from '../../stores/salaryBudget'
import { DownloadOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

defineProps<{
  open: boolean
}>()

const emit = defineEmits(['update:open'])

const store = useSalaryBudgetStore()
const filterType = ref<string | undefined>(undefined)

const columns = [
  { title: '发生时间', dataIndex: 'timestamp', key: 'timestamp', width: 180 },
  { title: '变更类型', dataIndex: 'type', key: 'type', width: 150 },
  { title: '涉及部门', dataIndex: 'deptName', key: 'deptName' },
  { title: '类别', dataIndex: 'category', key: 'category', width: 100 },
  { title: 'HC变动', dataIndex: 'hcChange', key: 'hcChange', width: 90, align: 'right' },
  { title: '总额变动(元)', dataIndex: 'totalBudgetChange', key: 'totalBudgetChange', width: 130, align: 'right' },
]

const filteredLogs = computed(() => {
  return store.changeLogs
    .filter(log => {
      const matchesType = !filterType.value || 
        (filterType.value === 'TRANSFER' && log.bizType.startsWith('TRANSFER')) ||
        log.bizType === filterType.value
      
      return matchesType
    })
    .sort((a, b) => {
      // PRD v4.2: 所有数据按照发生时间降序
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
})

const handleExport = () => {
  // PRD v4.2: 完善导出模拟提示
  const modal = ref();
  modal.value = message.loading('正在准备导出报表...', 0);
  
  setTimeout(() => {
    modal.value(); // close loading
    message.success('导出成功！已生成标准预算变更报表 (XLSX 格式)');
    
    // 模拟导出预览信息
    console.log('--- 导出报表结构预览 ---');
    console.log('Sheet 1 (汇总页): [发生时间, 变更类型, 涉及部门, 类别, HC 变动, 总额变动]');
    console.log('Sheet 2 (明细页): [发生时间, 变更类型, 涉及部门, 财务科目名称, 项目标签, 明细变动金额]');
  }, 1000);
}

const getHCClass = (val: any) => {
  if (val === '-') return ''
  return val > 0 ? 'text-increase' : (val < 0 ? 'text-decrease' : '')
}

const getAmountClass = (val: number) => {
  return val > 0 ? 'text-increase' : (val < 0 ? 'text-decrease' : '')
}

const formatAmount = (val: number) => {
  const sign = val > 0 ? '+' : ''
  return sign + val.toLocaleString()
}

const getTypeColor = (record: any) => {
  const bizType = record.bizType
  if (bizType.startsWith('TRANSFER')) return 'orange'
  if (bizType === 'APPROVAL') return 'blue'
  if (bizType === 'DEPT_MOVE') return 'purple'
  if (bizType === 'SUPPLEMENT') return 'default'
  return 'default'
}
</script>

<style scoped>
.log-container {
  padding: 8px 0;
}

.filter-bar {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text-increase {
  color: #f5222d;
  font-weight: 500;
}

.text-decrease {
  color: #52c41a;
  font-weight: 500;
}

.detail-table-wrapper {
  padding: 12px 24px;
  background: #fbfbfb;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
}

.detail-header {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-title {
  font-weight: 600;
  font-size: 14px;
  color: #1d2129;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
}

.detail-table th {
  text-align: left;
  padding: 8px;
  background: #f2f3f5;
  font-size: 12px;
  color: #4e5969;
  border-bottom: 1px solid #e5e6eb;
}

.detail-table td {
  padding: 8px;
  font-size: 13px;
  border-bottom: 1px solid #f0f0f0;
}

.text-right {
  text-align: right !important;
}

:deep(.ant-table-expanded-row > .ant-table-cell) {
  background: #fdfdfd;
}
</style>
