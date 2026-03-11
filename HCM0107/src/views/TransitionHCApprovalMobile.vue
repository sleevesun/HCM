<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { showFailToast } from 'vant'
import { useRouter } from 'vue-router'
import {
  Skeleton as VanSkeleton,
  Field as VanField
} from 'vant'
import {
  fetchTransitionHcApprovalDetail,
  fetchTransitionHcApprovalFlowHistory,
  type TransitionHcFlowRecord
} from '../mocks/transitionHcApprovalApi'
import type { TransitionHCRow } from '../mocks/transitionHCService'

type ActionType = 'approve' | 'reject'

interface CachedPayload {
  detailId: string
  deptName: string
  reason: string
  rows: TransitionHCRow[]
  flow: TransitionHcFlowRecord[]
}

const activeAction = ref<ActionType>('approve')
const opinion = ref('')
const loading = ref(true)
const detailId = ref('')
const deptName = ref('')
const reason = ref('')
const rows = ref<TransitionHCRow[]>([])
const flow = ref<TransitionHcFlowRecord[]>([])
const retryCount = ref(0)
const cacheKey = 'transition_hc_mobile_cache_v1'
const opinionCacheKey = 'transition_hc_mobile_opinion_v1'
const router = useRouter()

const applyCount = computed(() => String(Math.max(rows.value.length, 2)))

const applicantName = computed(() => {
  return flow.value[0]?.operator || 'XXXX'
})

const applyDateText = computed(() => {
  const raw = flow.value[0]?.operatedAt
  return raw ? formatDate(raw) : '2026-XX-XX'
})

const formatDate = (raw?: string) => {
  if (!raw) return '-'
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10)
  if (/^\d{4}-\d{2}$/.test(raw)) return `${raw}-01`
  return raw
}

const formatCurrency = (raw?: string) => {
  if (raw === undefined || raw === null || raw === '') return '-'
  const n = Number(raw)
  if (!Number.isFinite(n)) return '-'
  return n.toLocaleString('zh-CN')
}

const mobileRows = computed(() => {
  const normalized = rows.value.map((item, index) => ({
    id: item.id || `row-${index + 1}`,
    title: `过渡期HC ${index + 1}`,
    effectiveDate: formatDate(item.effectiveDate) || '-',
    expiryDate: formatDate(item.expiryDate) || '-',
    replacedPerson: item.replacedPersonName || '张子薇',
    resignDate: formatDate(item.resignDate) || '-',
    salary: item.salaryDisplay ? formatCurrency(item.salaryDisplay) : '25000',
    dept: item.deptName || '暂无'
  }))
  if (normalized.length < 2) {
    normalized.push({
      id: 'mock-2',
      title: '过渡期HC 2',
      effectiveDate: '2026-03-01',
      expiryDate: '2026-05-31',
      replacedPerson: '张伟',
      resignDate: '2026-04-30',
      salary: '31,000',
      dept: '运营部'
    })
  }
  return normalized
})

const cachePayload = computed<CachedPayload>(() => ({
  detailId: detailId.value,
  deptName: deptName.value,
  reason: reason.value,
  rows: rows.value,
  flow: flow.value
}))

const loadFromCache = () => {
  const raw = localStorage.getItem(cacheKey)
  if (!raw) return false
  const data = JSON.parse(raw) as CachedPayload
  detailId.value = data.detailId
  deptName.value = data.deptName
  reason.value = data.reason
  rows.value = data.rows
  flow.value = data.flow
  return true
}

const saveCache = () => {
  localStorage.setItem(cacheKey, JSON.stringify(cachePayload.value))
}

const withRetry = async <T,>(work: () => Promise<T>): Promise<T> => {
  let lastError: unknown
  for (let i = 1; i <= 3; i += 1) {
    try {
      retryCount.value = i
      return await work()
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

const loadData = async () => {
  loading.value = true
  const token = localStorage.getItem('x_auth_token') || 'mock-token'
  try {
    const [detail, flowList] = await withRetry(() =>
      Promise.all([
        fetchTransitionHcApprovalDetail({ headers: { 'X-Auth-Token': token }, device: 'mobile' }),
        fetchTransitionHcApprovalFlowHistory({ headers: { 'X-Auth-Token': token }, device: 'mobile' })
      ])
    )
    detailId.value = detail.id
    deptName.value = detail.deptPath || detail.deptName
    reason.value = detail.reason
    rows.value = detail.rows
    flow.value = flowList
    saveCache()
  } catch (error) {
    if (loadFromCache()) {
      showFailToast('网络异常，已展示离线缓存数据')
    } else {
      showFailToast('网络异常，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

const handleApprove = () => {
  activeAction.value = 'approve'
}

const handleReject = () => {
  if (!opinion.value.trim()) {
    showFailToast('请先输入审批意见再进行驳回操作')
    return
  }
  activeAction.value = 'reject'
}

const handleSwitchToDesktop = () => {
  router.push('/transition-hc-approval')
}

const hideKeyboardOnScroll = () => {
  const active = document.activeElement as HTMLElement | null
  if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
    active.blur()
  }
}

onMounted(async () => {
  opinion.value = localStorage.getItem(opinionCacheKey) || ''
  await loadData()
  await nextTick()
  window.addEventListener('scroll', hideKeyboardOnScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', hideKeyboardOnScroll)
})

watch(opinion, (value) => {
  localStorage.setItem(opinionCacheKey, value)
})
</script>

<template>
  <main class="mobile-page">
    <div class="mobile-main-title">过渡期HC审批</div>

    <header class="mobile-header">
      <div class="header-row"><span class="header-label">申请类型</span><span class="header-value">过渡期HC申请</span></div>
      <div class="header-row"><span class="header-label">申请数量</span><span class="header-value">{{ applyCount }}</span></div>
      <div class="header-row"><span class="header-label">申请部门</span><span class="header-value">{{ deptName || '星云工作室' }}</span></div>
      <div class="header-row"><span class="header-label">申请人</span><span class="header-value">{{ applicantName }}</span></div>
      <div class="header-row"><span class="header-label">申请日期</span><span class="header-value">{{ applyDateText }}</span></div>
    </header>

    <section v-if="loading" class="skeleton-list">
      <VanSkeleton title avatar :row="4" />
      <VanSkeleton title :row="5" />
    </section>

    <section v-else class="content-wrap">
      <div class="detail-card">
        <div class="section-mini-title">过渡期HC详情</div>
        <div v-for="item in mobileRows" :key="item.id" class="detail-group">
          <div class="transition-hc-title">{{ item.title }}</div>
          <div class="row-item"><span class="label">生效日期:</span><span class="value">{{ item.effectiveDate }}</span></div>
          <div class="row-item"><span class="label">失效日期:</span><span class="value">{{ item.expiryDate }}</span></div>
          <div class="row-item"><span class="label">被替换人:</span><span class="value">{{ item.replacedPerson }}</span></div>
          <div class="row-item"><span class="label">预计离职日期:</span><span class="value">{{ item.resignDate }}</span></div>
          <div class="row-item"><span class="label">月薪:</span><span class="value">{{ item.salary }}</span></div>
          <div class="row-item"><span class="label">直属部门:</span><span class="value">{{ item.dept }}</span></div>
        </div>
      </div>

      <div class="reason-card">
        <div class="section-mini-title">申请原因</div>
        <div class="reason-content">{{ reason || '-' }}</div>
      </div>

      <div class="flow-block">
        <div class="section-mini-title">审批记录</div>
        <div class="flow-list">
          <div v-for="(item, index) in flow" :key="`${item.node}-${index}`" class="flow-node">
            <div class="flow-node-body">
              <div class="flow-node-index">{{ index + 1 }}</div>
              <div class="flow-node-content">
                <div class="flow-line flow-head">
                  <span class="flow-title">审批人：{{ item.operator || '-' }}</span>
                  <span class="flow-result">{{ item.result || '-' }}</span>
                </div>
                <div class="flow-line flow-desc">审批节点：{{ item.node || '-' }}</div>
                <div class="flow-line flow-time">审批时间：{{ item.operatedAt || '-' }}</div>
                <div class="flow-line flow-opinion">审批意见：{{ item.comment || '-' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="submit-panel">
      <div class="panel-title">审批意见</div>
      <VanField
        v-model="opinion"
        type="textarea"
        rows="4"
        autosize
        maxlength="500"
        show-word-limit
        placeholder="请输入审批意见..."
      />
    </section>

    <section class="top-action-bar">
      <button class="top-action-btn danger" :class="{ active: activeAction === 'reject' }" @click="handleReject">驳回</button>
      <button class="top-action-btn" :class="{ active: activeAction === 'approve' }" @click="handleApprove">通过</button>
    </section>
    <button class="floating-switch-btn" @click="handleSwitchToDesktop">切换网页端</button>
  </main>
</template>

<style scoped>
.mobile-page {
  max-width: 414px;
  margin: 0 auto;
  padding: 12px 12px 132px;
  background: #f2f4f7;
  min-height: calc(100vh - 64px);
}

.mobile-main-title {
  font-size: 20px;
  font-weight: 700;
  line-height: 30px;
  color: #111827;
  text-align: center;
  margin-bottom: 10px;
}

.mobile-header {
  position: relative;
  background: #fff;
  border-radius: 14px;
  padding: 14px 14px 12px;
  box-shadow: 0 2px 10px rgba(22, 29, 45, 0.05);
}

.header-row {
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.header-label {
  font-size: 14px;
  line-height: 22px;
  color: #4b5563;
}

.header-value {
  font-size: 14px;
  line-height: 22px;
  color: #111827;
  font-weight: 700;
  text-align: right;
}

.top-action-bar {
  width: 100%;
  box-sizing: border-box;
  margin-top: 12px;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.top-action-btn {
  height: 32px;
  width: 96px;
  border-radius: 12px;
  border: 0;
  background: #0052d9;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
  box-shadow: 0 8px 20px rgba(0, 82, 217, 0.24);
  touch-action: manipulation;
}

.top-action-btn.danger {
  background: #dc2626;
  color: #fff;
  box-shadow: 0 8px 20px rgba(220, 38, 38, 0.24);
}

.top-action-btn.active {
  background: #0052d9;
  color: #fff;
  transform: translateY(-1px);
}

.floating-switch-btn {
  position: fixed;
  right: 12px;
  top: 52%;
  transform: translateY(-50%);
  z-index: 120;
  width: 104px;
  height: 36px;
  border: none;
  border-radius: 18px;
  background: #0052d9;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(0, 82, 217, 0.26);
}

.skeleton-list {
  margin-top: 12px;
  background: #fff;
  border-radius: 14px;
  padding: 12px;
  box-shadow: 0 2px 10px rgba(22, 29, 45, 0.05);
}

.content-wrap {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  background: #fff;
  width: 100%;
  box-sizing: border-box;
}

.reason-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  background: #fff;
  width: 100%;
  box-sizing: border-box;
}

.reason-content {
  font-size: 14px;
  line-height: 22px;
  color: #4b5563;
  word-break: break-word;
  white-space: pre-wrap;
}

.flow-block {
  border-radius: 10px;
  background: #fff;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

.section-mini-title {
  font-size: 14px;
  color: #333;
  font-weight: 700;
  margin: 0 0 12px 0;
  line-height: 22px;
}

.detail-group + .detail-group {
  border-top: 1px solid #e5e5e5;
  margin-top: 8px;
  padding-top: 8px;
}

.transition-hc-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f1f1f;
  margin: 8px 0;
  text-align: left;
}

.row-item {
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.label {
  width: 120px;
  min-width: 120px;
  flex-shrink: 0;
  font-size: 14px;
  line-height: 22px;
  color: #4b5563;
}

.value {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 22px;
  color: #111827;
  font-weight: 700;
  text-align: left;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.flow-list {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: none;
  box-shadow: none;
  border-radius: 10px;
  overflow: hidden;
  padding: 4px 0;
}

.flow-node {
  width: 100%;
}

.flow-node + .flow-node {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.flow-node-index {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background: none;
  color: #111827;
  font-size: 14px;
  font-weight: 400;
  line-height: 32px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.flow-node-body {
  width: 100%;
  box-sizing: border-box;
  background: #fff;
  padding: 10px 12px;
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 10px;
  align-items: center;
}

.flow-node-content {
  min-width: 0;
}

.flow-line {
  min-height: 28px;
  font-size: 14px;
  line-height: 22px;
}

.flow-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.flow-title {
  color: #111827;
  font-weight: 700;
}

.flow-result {
  color: #111827;
  font-weight: 400;
}

.flow-desc,
.flow-time,
.flow-opinion {
  color: #6b7280;
}

.submit-panel {
  position: relative;
  width: 100%;
  background: #fff;
  border-radius: 14px;
  padding: 10px 12px;
  margin-top: 12px;
  box-shadow: 0 2px 10px rgba(22, 29, 45, 0.05);
}

.panel-title {
  font-size: 14px;
  line-height: 22px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 6px;
}

:deep(.van-cell) {
  font-size: 14px;
  line-height: 22px;
  background: #fff;
}

.submit-panel :deep(.van-field + .van-field) {
  margin-top: 8px;
}

@media (max-width: 375px) {
  .mobile-page {
    padding-left: 8px;
    padding-right: 8px;
    padding-bottom: 24px;
  }

  .floating-switch-btn {
    right: 8px;
  }
}
</style>
