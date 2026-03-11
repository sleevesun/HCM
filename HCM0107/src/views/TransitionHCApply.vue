<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import { message } from 'ant-design-vue'
import DepartmentTreeSelect from '../components/DepartmentTreeSelect.vue'
import TransitionAddRowButton from '../components/TransitionAddRowButton.vue'
import TransitionHCStats from '../components/TransitionHCStats.vue'
import ApplicationReasonInput from '../components/ApplicationReasonInput.vue'
import FlowReturnButton from '../components/FlowReturnButton.vue'
import { searchStaff } from '../mocks/budgetData'
import {
  fetchDepartmentTransitionHcQuota,
  fetchValidTransitionHcCount,
  getCurrentUserDeptId
} from '../mocks/transitionHcQuotaApi'
import {
  createDefaultTransitionRow,
  loadTransitionDraft,
  syncTransitionRows,
  type TransitionHCRow,
  saveTransitionDraft,
  saveTransitionHistory,
  loadTransitionHistory,
  submitTransitionApplication
} from '../mocks/transitionHCService'

const selectedDept = ref<string | undefined>()
const selectedDeptMeta = ref<{ code: string; name: string; path: string } | null>(null)
const transitionHCData = ref<TransitionHCRow[]>([])
const editHistory = ref<string[]>([])
const tableContainerRef = ref<HTMLElement | null>(null)
const rowSelectRefs = ref<Record<string, any>>({})
const applicationReason = ref('')
const reasonError = ref('')
const statsLoading = ref(true)
const statsError = ref('')
const deptQuota = ref(0)
const validHistoryCount = ref(0)
const maxRows = 100
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null
const transitionHCCount = computed(() => transitionHCData.value.length)
const quota = computed(() => {
  const a = transitionHCCount.value
  const headcount = deptQuota.value || 0
  const x = Math.ceil(headcount * 0.025)
  const y = Math.floor(x * 0.3)
  const n = Math.max(0, x - y)
  
  let errorMsg = ''
  if (selectedDept.value) {
    if (n <= 0) {
      errorMsg = '当前部门无可申请的过渡期HC配额，无法提交申请。'
    } else if (a > n) {
      errorMsg = `申请数量已超过上限（最多可申请 ${n} 个），请调整后重新提交。`
    }
  }

  return {
    a,
    x,
    y,
    n,
    exceeded: !!errorMsg,
    errorMsg
  }
})

const setRowSelectRef = (id: string, el: any) => {
  if (el) {
    rowSelectRefs.value[id] = el
    return
  }
  delete rowSelectRefs.value[id]
}

const pushHistory = (text: string) => {
  const record = `${dayjs().format('YYYY-MM-DD HH:mm:ss')} ${text}`
  editHistory.value = [record, ...editHistory.value].slice(0, 200)
  saveTransitionHistory(editHistory.value)
}

const scheduleAutoSave = () => {
  if (autoSaveTimer) clearTimeout(autoSaveTimer)
  autoSaveTimer = setTimeout(async () => {
    saveTransitionDraft(transitionHCData.value)
    await syncTransitionRows(transitionHCData.value)
    pushHistory(`自动保存 ${transitionHCData.value.length} 行`)
  }, 600)
}

watch(transitionHCData, () => {
  scheduleAutoSave()
}, { deep: true })

watch(applicationReason, () => {
  reasonError.value = ''
})

const focusNewRow = async (id: string) => {
  await nextTick()
  setTimeout(() => {
    const rowEl = document.getElementById(`hc-row-${id}`)
    rowEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    rowSelectRefs.value[id]?.focus?.()
  }, 0)
}

const handleAddRow = async () => {
  if (transitionHCData.value.length >= maxRows) {
    message.warning(`最多可添加 ${maxRows} 行`)
    return
  }
  const row = createDefaultTransitionRow()
  transitionHCData.value.push(row)
  pushHistory(`新增行 ${row.id}`)
  await focusNewRow(row.id)
}

const handleDeleteRow = (index: number) => {
  const row = transitionHCData.value[index]
  transitionHCData.value.splice(index, 1)
  pushHistory(`删除行 ${row.id}`)
}

const handleSearchPerson = (keyword: string, row: TransitionHCRow) => {
  if (row.searchTimer) clearTimeout(row.searchTimer)
  row.searchTimer = setTimeout(async () => {
    row.searchLoading = true
    try {
      row.personOptions = await searchStaff(keyword)
    } finally {
      row.searchLoading = false
    }
  }, 250)
}

const getGroupCategory = (deptName: string) => {
  if (deptName.includes('研发')) return '研发'
  if (deptName.includes('测试')) return '测试'
  if (deptName.includes('策划')) return '策划'
  return '运营'
}

const handlePersonChange = (val: string, row: TransitionHCRow) => {
  const person = row.personOptions.find((item) => item.empId === val)
  if (!person) return
  const deptName = person.deptName ?? ''
  row.fieldLoading = true
  setTimeout(() => {
    row.deptName = deptName
    row.projectTag = person.projectTag ?? ''
    row.rank = person.rank ?? ''
    row.socialLocation = person.socialLocation ?? ''
    row.workLocation = person.workLocation ?? ''
    row.groupCategory = getGroupCategory(deptName)
    row.salaryDisplay = person.salaryBase !== undefined
      ? Math.round(person.salaryBase * 10000).toLocaleString('zh-CN', { maximumFractionDigits: 0 })
      : '-'
    row.fieldLoading = false
    pushHistory(`更新行 ${row.id} 被替换人员 ${person.name}`)
  }, 250)
}

const disabledResignDate = (current: Dayjs) => {
  return current && current < dayjs().startOf('year')
}

const validateRow = (row: TransitionHCRow) => {
  return !!(
    row.replacedPersonId &&
    row.resignDate &&
    row.effectiveDate &&
    row.expiryDate
  )
}

const validateReason = () => {
  const reason = applicationReason.value.trim()
  if (!reason) {
    reasonError.value = '请填写申请原因说明'
    return false
  }
  if (reason.length < 10) {
    reasonError.value = '申请原因说明不少于10个字符'
    return false
  }
  if (reason.length > 500) {
    reasonError.value = '申请原因说明不超过500个字符'
    return false
  }
  reasonError.value = ''
  return true
}

const handleSubmit = async () => {
  if (!selectedDept.value) {
    message.error('请选择HC申请部门')
    return
  }
  if (transitionHCData.value.length === 0) {
    message.warning('暂无过渡期人员，请点击上方按钮添加')
    return
  }
  if (quota.value.exceeded) {
    message.error(quota.value.errorMsg)
    return
  }
  if (!validateReason()) {
    message.error(reasonError.value)
    return
  }
  const invalidIndex = transitionHCData.value.findIndex((row) => !validateRow(row))
  if (invalidIndex !== -1) {
    message.error(`第 ${invalidIndex + 1} 行存在未填写必填项`)
    return
  }
  saveTransitionDraft(transitionHCData.value)
  await syncTransitionRows(transitionHCData.value)
  await submitTransitionApplication({
    deptId: selectedDept.value,
    deptName: selectedDeptMeta.value?.name,
    deptPath: selectedDeptMeta.value?.path,
    reason: applicationReason.value.trim(),
    rows: transitionHCData.value
  })
  pushHistory(`手动提交 ${transitionHCData.value.length} 行`)
  message.success('已提交过渡期HC数据')
}

const requestWithTimeout = async <T,>(promise: Promise<T>, timeoutMs = 150) => {
  let timer: ReturnType<typeof setTimeout> | null = null
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), timeoutMs)
  })
  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

const loadQuotaData = async () => {
  statsLoading.value = true
  statsError.value = ''
  const deptId = selectedDept.value || getCurrentUserDeptId()
  try {
    const [headcount, validCount] = await Promise.all([
      requestWithTimeout(fetchDepartmentTransitionHcQuota(deptId), 220),
      requestWithTimeout(fetchValidTransitionHcCount(deptId))
    ])
    deptQuota.value = headcount
    validHistoryCount.value = validCount
  } catch (error: any) {
    statsError.value = error?.message === 'timeout' ? '配额计算超时，请重试' : '配额数据加载失败，请重试'
  } finally {
    statsLoading.value = false
  }
}

const retryLoadQuota = () => {
  loadQuotaData()
}

const handleDeptChange = (_val: string | undefined, node: any) => {
  if (!node) {
    selectedDeptMeta.value = null
    return
  }
  selectedDeptMeta.value = {
    code: node.code || node.id || '',
    name: node.name || '',
    path: node.path || ''
  }
}

watch(selectedDept, () => {
  selectedDeptMeta.value = null
  loadQuotaData()
})

onMounted(() => {
  try {
    transitionHCData.value = loadTransitionDraft()
    editHistory.value = loadTransitionHistory()
  } catch {
    message.warning('草稿加载失败，已使用空数据')
  }
  loadQuotaData()
})
</script>

<template>
  <main class="transition-hc-page">
    <header class="page-title-section">
      <h1 class="page-title">过渡期HC申请</h1>
    </header>

    <section class="filter-section" aria-label="筛选区域">
      <form class="filter-form" @submit.prevent>
        <div class="filter-fields">
          <div class="field-item">
            <label class="field-label" for="dept-field">HC申请部门 <span class="required-star">*</span></label>
            <div id="dept-field" class="field-control-custom">
              <DepartmentTreeSelect v-model:value="selectedDept" @change="handleDeptChange" />
            </div>
            <TransitionHCStats
              :b="quota.x"
              :y="quota.y"
              :exceeded="quota.exceeded"
              :loading="statsLoading"
              :error="statsError"
              :visible="!!selectedDept"
              @retry="retryLoadQuota"
            />
          </div>
        </div>
      </form>
    </section>

    <section class="table-section" aria-label="过渡期HC详情">
      <div class="table-header-row">
        <h2 class="table-title">过渡期HC详情</h2>
        <div class="table-actions">
          <TransitionAddRowButton @add="handleAddRow" />
        </div>
      </div>
      <transition name="fade">
        <div v-if="selectedDept" class="quota-summary">
          <span class="quota-text">本次过渡期HC最多可申请 <span class="quota-num">{{ quota.n }}</span> 个</span>
          <span v-if="quota.exceeded" class="quota-error-hint">，{{ quota.errorMsg }}</span>
        </div>
      </transition>
      <div class="table-container" ref="tableContainerRef">
        <table class="transition-hc-table">
          <thead>
            <tr>
              <th style="width: 60px">序号</th>
              <th style="width: 100px">HC类型</th>
              <th style="width: 140px">生效日期 <span class="required-star">*</span></th>
              <th style="width: 140px">失效日期 <span class="required-star">*</span></th>
              <th style="width: 160px">被替换人员 <span class="required-star">*</span></th>
              <th style="width: 140px">预计离职日期 <span class="required-star">*</span></th>
              <th style="width: 120px">月薪</th>
              <th style="width: 140px">部门</th>
              <th class="sticky-col-right" style="width: 80px; text-align: center;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in transitionHCData"
              :key="row.id"
              :id="`hc-row-${row.id}`"
            >
              <td class="text-center">{{ index + 1 }}</td>
              <td><a-input v-model:value="row.hcType" disabled /></td>
              <td>
                <a-select v-model:value="row.effectiveDate" :disabled="!row.replacedPersonId" style="width: 100%" placeholder="生效月份">
                  <a-select-option v-for="m in 12" :key="m" :value="`2026-${m.toString().padStart(2, '0')}`">
                    2026年{{ m }}月
                  </a-select-option>
                </a-select>
              </td>
              <td>
                <a-select v-model:value="row.expiryDate" :disabled="!row.replacedPersonId" style="width: 100%" placeholder="失效月份">
                  <a-select-option value="2026-03">2026年3月</a-select-option>
                  <a-select-option value="2026-06">2026年6月</a-select-option>
                  <a-select-option value="2026-09">2026年9月</a-select-option>
                  <a-select-option value="2026-12">2026年12月</a-select-option>
                </a-select>
              </td>
              <td>
                <a-select
                  :ref="(el: any) => setRowSelectRef(row.id, el)"
                  v-model:value="row.replacedPersonId"
                  show-search
                  placeholder="搜索姓名/工号"
                  :filter-option="false"
                  :not-found-content="row.searchLoading ? undefined : null"
                  style="width: 100%"
                  @search="(val: string) => handleSearchPerson(val, row)"
                  @change="(val: string) => handlePersonChange(val, row)"
                >
                  <template v-if="row.searchLoading" #notFoundContent>
                    <a-spin size="small" />
                  </template>
                  <a-select-option v-for="person in row.personOptions" :key="person.empId" :value="person.empId">
                    {{ person.name }} ({{ person.empId }})
                  </a-select-option>
                </a-select>
              </td>
              <td>
                <a-date-picker
                  v-model:value="row.resignDate"
                  picker="month"
                  valueFormat="YYYY-MM"
                  :disabledDate="disabledResignDate"
                  :disabled="!row.replacedPersonId"
                  placeholder="选择月份"
                  style="width: 100%"
                />
              </td>
              <td>
                <a-skeleton-input v-if="row.fieldLoading" active size="small" />
                <a-input v-else v-model:value="row.salaryDisplay" disabled placeholder="自动带出" />
              </td>
              <td>
                <a-skeleton-input v-if="row.fieldLoading" active size="small" />
                <a-input v-else v-model:value="row.deptName" disabled placeholder="自动带出" />
              </td>
              <td class="sticky-col-right text-center">
                <a-popconfirm title="确定删除该行吗？" @confirm="handleDeleteRow(index)">
                  <a-button type="link" danger size="small">删除</a-button>
                </a-popconfirm>
              </td>
            </tr>
            <tr v-if="transitionHCData.length === 0">
              <td colspan="9" class="empty-state">
                <a-empty description="暂无过渡期人员，请点击上方按钮添加" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ApplicationReasonInput
        v-model="applicationReason"
        :error="reasonError"
        :min-length="10"
        :max-length="500"
      />
    </section>

    <footer class="footer-actions" aria-label="底部操作区域">
      <a-button @click="transitionHCData = []">重置</a-button>
      <a-button type="primary" :disabled="quota.exceeded" @click="handleSubmit">提交</a-button>
    </footer>
    <FlowReturnButton />
  </main>
</template>

<style scoped>
.transition-hc-page {
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #fff;
}

.page-title-section {
  display: flex;
  align-items: center;
  min-height: 32px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.filter-section {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 12px 16px;
}

.filter-form {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.filter-fields {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.field-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.field-label {
  width: 120px;
  text-align: right;
  font-weight: 500;
  color: #1f1f1f;
}

.field-control-custom {
  width: 320px;
}

.table-header-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 24px;
}

.table-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f1f1f;
}

.quota-summary {
  margin: 0 0 12px;
  padding: 6px 12px;
  font-size: 14px;
  color: #666;
  background: #f5f5f5;
  border-radius: 4px;
  line-height: 22px;
}

.quota-text {
  color: #666;
}

.quota-num {
  color: #1677ff;
  font-weight: 600;
  margin: 0 2px;
}

.table-actions {
  margin-left: auto;
}

.table-container {
  flex: 1;
  overflow-x: auto;
  overflow-y: auto;
  border: 1px solid #ebeef5;
}

.transition-hc-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.transition-hc-table th {
  position: sticky;
  top: 0;
  background-color: #f5f7fa;
  color: #606266;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  padding: 12px 8px;
  min-width: 100px;
  border-bottom: 1px solid #ebeef5;
  border-right: 1px solid #ebeef5;
  z-index: 1;
  white-space: nowrap;
}

.transition-hc-table td {
  border-bottom: 1px solid #ebeef5;
  border-right: 1px solid #ebeef5;
  padding: 8px;
  background: #fff;
}

.transition-hc-table tr:hover td {
  background: #fafcff;
}

.sticky-col-right {
  position: sticky !important;
  right: 0;
  z-index: 2;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.08);
}

.transition-hc-table th.sticky-col-right {
  background-color: #f5f7fa;
}

.transition-hc-table td.sticky-col-right {
  background-color: #fff;
}

.text-center {
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 24px 0;
  background: #fff;
}

.footer-actions {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
}

.quota-error-hint {
  color: #ff4d4f;
  font-size: 14px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.required-star {
  color: #ff4d4f;
}

@media (max-width: 992px) {
  .filter-form {
    flex-direction: column;
    align-items: flex-start;
  }

  .field-control-custom {
    width: 260px;
  }

}

@media (max-width: 768px) {
  .transition-hc-page {
    gap: 12px;
  }

  .field-item {
    flex-wrap: wrap;
  }

  .field-label {
    width: auto;
    text-align: left;
  }

  .field-control-custom {
    width: 100%;
  }
}
</style>
