<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { TableColumnsType } from 'ant-design-vue'
import DepartmentTreeSelect from '../components/DepartmentTreeSelect.vue'
import type { TransitionHCRow } from '../mocks/transitionHCService'
import {
  fetchTransitionHcApprovalDetail,
  fetchTransitionHcApprovalFlowHistory,
  type TransitionHcFlowRecord
} from '../mocks/transitionHcApprovalApi'
import { handleApiError } from '../utils/error-handler'
import { useRouter } from 'vue-router'
import FlowReturnButton from '../components/FlowReturnButton.vue'

const loading = ref(false)
const selectedDept = ref<string>()
const detailId = ref('')
const approvalReason = ref('')
const transitionHCData = ref<TransitionHCRow[]>([])
const flowHistory = ref<TransitionHcFlowRecord[]>([])
const actionModalOpen = ref(false)
const actionType = ref<'reject' | 'approve'>('approve')
const actionOpinion = ref('')
const opinionError = ref('')
const router = useRouter()

const flowColumns: TableColumnsType<TransitionHcFlowRecord> = [
  { title: '操作人', dataIndex: 'operator', key: 'operator', width: 120 },
  { title: '流程节点', dataIndex: 'node', key: 'node', width: 160 },
  { title: '审批结果', dataIndex: 'result', key: 'result', width: 120 },
  { title: '审批意见', dataIndex: 'comment', key: 'comment' },
  { title: '操作时间', dataIndex: 'operatedAt', key: 'operatedAt', width: 180 }
]

const actionModalTitle = computed(() => actionType.value === 'reject' ? '审批驳回' : '审批通过')

const loadData = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('x_auth_token') || 'mock-token'
    const headers = { 'X-Auth-Token': token }
    const [detail, flow] = await Promise.all([
      fetchTransitionHcApprovalDetail({ headers }),
      fetchTransitionHcApprovalFlowHistory({ headers })
    ])
    detailId.value = detail.id
    selectedDept.value = detail.deptId
    approvalReason.value = detail.reason
    transitionHCData.value = detail.rows
    flowHistory.value = flow
  } catch (error) {
    handleApiError(error, '审批详情加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

const openActionModal = (type: 'reject' | 'approve') => {
  actionType.value = type
  actionOpinion.value = ''
  opinionError.value = ''
  actionModalOpen.value = true
}

const handleCancelAction = () => {
  actionModalOpen.value = false
  opinionError.value = ''
}

const handleOpinionChange = (value: string) => {
  actionOpinion.value = value
  if (value.trim()) {
    opinionError.value = ''
  }
}

const handleConfirmAction = () => {
  if (actionType.value === 'reject' && !actionOpinion.value.trim()) {
    opinionError.value = '审批意见不能为空'
    return
  }
  actionModalOpen.value = false
  opinionError.value = ''
}

const handleBack = () => {
  router.push('/approval-center')
}

const handleSwitchToMobile = () => {
  router.push('/transition-hc-approval-mobile')
}
</script>

<template>
  <main class="transition-hc-page">
    <header class="page-title-section">
      <h1 class="page-title">过渡期HC审批</h1>
      <span class="detail-id">单号：{{ detailId || '—' }}</span>
    </header>

    <section class="filter-section" aria-label="筛选区域">
      <form class="filter-form" @submit.prevent>
        <div class="filter-fields">
          <div class="field-item">
            <label class="field-label" for="dept-field">HC申请部门 <span class="required-star">*</span></label>
            <div id="dept-field" class="field-control-custom">
              <DepartmentTreeSelect v-model:value="selectedDept" disabled />
            </div>
          </div>
        </div>
      </form>
    </section>

    <section class="table-section" aria-label="过渡期HC详情">
      <h2 class="table-title">过渡期HC详情</h2>
      <div class="table-container">
        <table class="transition-hc-table">
          <thead>
            <tr>
              <th style="width: 60px">序号</th>
              <th style="width: 100px">HC类型</th>
              <th style="width: 160px">被替换人员</th>
              <th style="width: 120px">月薪</th>
              <th style="width: 140px">部门</th>
              <th style="width: 120px">项目标签</th>
              <th style="width: 140px">预计离职日期</th>
              <th style="width: 120px">族群类别</th>
              <th style="width: 120px">职级</th>
              <th style="width: 120px">社保地</th>
              <th style="width: 120px">工作地点</th>
              <th style="width: 140px">生效日期</th>
              <th style="width: 140px">失效日期</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in transitionHCData" :key="row.id">
              <td class="text-center">{{ index + 1 }}</td>
              <td><a-input :value="row.hcType" disabled /></td>
              <td><a-input :value="row.replacedPersonName || row.replacedPersonId" disabled /></td>
              <td><a-input :value="row.salaryDisplay" disabled /></td>
              <td><a-input :value="row.deptName" disabled /></td>
              <td><a-input :value="row.projectTag" disabled /></td>
              <td><a-input :value="row.resignDate" disabled /></td>
              <td><a-input :value="row.groupCategory" disabled /></td>
              <td><a-input :value="row.rank" disabled /></td>
              <td><a-input :value="row.socialLocation" disabled /></td>
              <td><a-input :value="row.workLocation" disabled /></td>
              <td><a-input :value="row.effectiveDate" disabled /></td>
              <td><a-input :value="row.expiryDate" disabled /></td>
            </tr>
            <tr v-if="transitionHCData.length === 0">
              <td colspan="13" class="empty-state">
                <a-empty description="暂无审批明细数据" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="reason-section" aria-label="申请原因说明">
      <h2 class="table-title">申请原因说明 <span class="required-star">*</span></h2>
      <a-textarea
        :value="approvalReason"
        placeholder="请简要描述新增原因"
        :auto-size="{ minRows: 4, maxRows: 8 }"
        readonly
        disabled
      />
    </section>

    <section class="flow-section" aria-label="流程概览">
      <h2 class="table-title">流程概览</h2>
      <a-table
        :columns="flowColumns"
        :data-source="flowHistory"
        :loading="loading"
        :pagination="false"
        row-key="operatedAt"
        :locale="{ emptyText: '暂无流程数据' }"
      />
    </section>

    <a-config-provider :auto-insert-space-in-button="false">
      <div class="approval-action-bar" aria-label="审批人操作按钮区域">
        <a-button class="action-btn-back" @click="handleBack">返回</a-button>
        <a-button danger type="primary" class="action-btn-reject" @click="openActionModal('reject')">驳回</a-button>
        <a-button type="primary" class="action-btn-approve" @click="openActionModal('approve')">通过</a-button>
      </div>
    </a-config-provider>

    <a-modal
      v-model:open="actionModalOpen"
      :title="actionModalTitle"
      centered
      @cancel="handleCancelAction"
    >
      <div class="modal-body">
        <a-textarea
          :value="actionOpinion"
          :auto-size="{ minRows: 4, maxRows: 6 }"
          placeholder="请输入审批意见"
          @update:value="handleOpinionChange"
        />
        <div v-if="opinionError" class="opinion-error">审批意见不能为空</div>
      </div>
      <template #footer>
        <a-button @click="handleCancelAction">取消</a-button>
        <a-button type="primary" @click="handleConfirmAction">确定</a-button>
      </template>
    </a-modal>
    <button class="floating-switch-btn" @click="handleSwitchToMobile">切换移动端</button>
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
  position: relative;
  padding-bottom: 88px;
}

.page-title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 32px;
}

.detail-id {
  font-size: 13px;
  color: #666;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.filter-section,
.reason-section,
.flow-section {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 12px 16px;
}

.filter-form {
  display: flex;
  align-items: center;
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
  gap: 8px;
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

.required-star {
  color: #ff4d4f;
}

.table-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #1f1f1f;
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
  background-color: #f5f7fa;
  color: #606266;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  padding: 12px 8px;
  min-width: 100px;
  border-bottom: 1px solid #ebeef5;
  border-right: 1px solid #ebeef5;
  white-space: nowrap;
}

.transition-hc-table td {
  border-bottom: 1px solid #ebeef5;
  border-right: 1px solid #ebeef5;
  padding: 8px;
  background: #fff;
}

.text-center {
  text-align: center;
}

.empty-state {
  text-align: center;
  padding: 36px 0;
}

.approval-action-bar {
  position: absolute;
  right: 16px;
  bottom: 16px;
  display: flex;
  gap: 12px;
  z-index: 100;
}

.action-btn-back,
.action-btn-reject,
.action-btn-approve {
  min-width: 96px;
  height: 38px;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.action-btn-back {
  background: #fff;
  border: 1px solid #d9d9d9;
  color: rgba(0, 0, 0, 0.85);
}

.action-btn-back:hover {
  color: #40a9ff;
  border-color: #40a9ff;
}

.action-btn-back:hover,
.action-btn-reject:hover,
.action-btn-approve:hover {
  transform: translateY(-1px);
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.opinion-error {
  color: #ff4d4f;
  font-size: 12px;
  line-height: 1.5;
}

.floating-switch-btn {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 120;
  width: 112px;
  height: 40px;
  border: none;
  border-radius: 20px;
  background: #0052d9;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(0, 82, 217, 0.26);
  cursor: pointer;
}

@media (max-width: 768px) {
  .field-control-custom {
    width: 240px;
  }

  .page-title-section {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .approval-action-bar {
    right: 16px;
    bottom: 16px;
  }

  .floating-switch-btn {
    right: 12px;
    top: auto;
    bottom: 88px;
    transform: none;
  }
}
</style>
