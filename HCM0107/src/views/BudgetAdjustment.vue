<template>
  <div class="budget-adjustment-page">
    <div class="page-header">
      <div class="header-left">
        <appstore-outlined class="header-icon" />
        <span class="page-title">工薪预算驾驶舱</span>
      </div>
      <div class="header-right">
        <span class="user-info">Hi, 孙运</span>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- Section 1: Adjustment Summary -->
      <AdjustmentSummaryTwoLayer :data="summaryRows" />

      <!-- Section 2: Before Application -->
      <div class="section-divider">
        <span class="section-label">申请前</span>
      </div>
      <BudgetDetailTable
        title="申请前 汇总"
        :data="detailDataBefore"
        :editable="false"
        @update:selected-ids="handleBeforeSelectedIdsChange"
      />

      <div class="action-buttons-row">
        <div class="left-actions">
          <a-button>
            <template #icon><download-outlined /></template>
            下载模板
          </a-button>
          <a-button>
            <template #icon><import-outlined /></template>
            项目标签导入
          </a-button>
        </div>
        <div class="right-actions">
          <CombinedActionButton
            :selected-employee-ids-count="selectedBeforeEmployeeIds.length"
            @open-subsidy-modal="handleOpenSubsidyModal"
          />
          <a-button>HC增减</a-button>
          <a-button @click="handleOpenDeptBudgetModal">部门级预算变更</a-button>
          <a-button>不 变</a-button>
        </div>
      </div>

      <!-- Section 3: After Application -->
      <div class="section-divider after-section">
        <span class="section-label">申请通过后</span>
      </div>
      <BudgetDetailTable
        title="申请通过后 汇总"
        :data="localDetailDataAfter"
        :editable="false"
        :is-after-application="true"
      />

      <!-- Action Footer -->
      <div class="page-footer">
        <a-button>返回</a-button>
        <a-dropdown placement="topRight">
          <a-button type="default" style="margin-right: 16px; margin-left: auto;">
            <template #icon><export-outlined /></template>
            导出报表
          </a-button>
          <template #overlay>
            <a-menu>
              <a-sub-menu title="导出现状">
                <a-menu-item key="current-dept" @click="handleExport('current', 'dept')">部门预算报表</a-menu-item>
                <a-menu-item key="current-proj" @click="handleExport('current', 'proj')">项目预算报表</a-menu-item>
                <a-menu-item key="current-hc" @click="handleExport('current', 'hc')">HC 预算报表</a-menu-item>
              </a-sub-menu>
              <a-sub-menu title="导出申请后">
                <a-menu-item key="draft-dept" @click="handleExport('draft', 'dept')">部门预算报表</a-menu-item>
                <a-menu-item key="draft-proj" @click="handleExport('draft', 'proj')">项目预算报表</a-menu-item>
                <a-menu-item key="draft-hc" @click="handleExport('draft', 'hc')">HC 预算报表</a-menu-item>
              </a-sub-menu>
            </a-menu>
          </template>
        </a-dropdown>
        <a-button type="primary" class="submit-btn">创建审批单</a-button>
      </div>
    </div>

    <!-- 过渡期HC 弹窗 -->
    <transition name="fade">
      <div
        v-if="transitionHCModalVisible"
        class="custom-modal-overlay"
        @click="handleCloseTransitionHCModal"
      >
        <div class="custom-modal-content" @click.stop>
          <div class="custom-modal-header">
            <span class="custom-modal-title">过渡期HC详情录入</span>
            <span
              class="custom-modal-close"
              @click="handleCloseTransitionHCModal"
              >×</span
            >
          </div>
          <div class="custom-modal-body modal-layout">
            <div class="table-actions-bar">
              <a-button type="primary" @click="handleAddRow">
                <template #icon><plus-outlined /></template>
                添加行信息
              </a-button>
            </div>
            <div class="table-container modal-form-area" ref="tableContainerRef">
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
                    <th class="sticky-col-right" style="width: 80px; text-align: center;">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in transitionHCData" :key="row.id" :id="`hc-row-${row.id}`" :class="{ 'highlight-row': row.isNew }">
                    <td class="text-center">{{ index + 1 }}</td>
                    <td>
                      <a-input v-model:value="row.hcType" disabled />
                    </td>
                    <td>
                      <a-select
                        v-model:value="row.replacedPersonId"
                        show-search
                        placeholder="搜索姓名/工号"
                        :filter-option="false"
                        :not-found-content="row.searchLoading ? undefined : null"
                        style="width: 100%"
                        @search="(val: string) => handleSearchPerson(val, row)"
                        @change="(val: string, option: any) => handlePersonChange(val, option, row)"
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
                      <a-skeleton-input v-if="row.fieldLoading" active size="small" />
                      <a-input v-else v-model:value="row.salaryDisplay" disabled placeholder="自动带出" />
                    </td>
                    <td>
                      <a-skeleton-input v-if="row.fieldLoading" active size="small" />
                      <a-input v-else v-model:value="row.deptName" disabled placeholder="自动带出" />
                    </td>
                    <td>
                      <a-skeleton-input v-if="row.fieldLoading" active size="small" />
                      <a-tooltip v-else :title="!row.replacedPersonId ? '请先选择被替换人员' : ''">
                        <div :class="{'disabled-wrapper': !row.replacedPersonId}">
                          <a-select v-model:value="row.projectTag" :disabled="!row.replacedPersonId" style="width: 100%" placeholder="选择项目">
                            <a-select-option value="项目A">项目A</a-select-option>
                            <a-select-option value="项目B">项目B</a-select-option>
                            <a-select-option value="项目C">项目C</a-select-option>
                            <a-select-option value="通用项目">通用项目</a-select-option>
                            <a-select-option value="核心项目">核心项目</a-select-option>
                          </a-select>
                        </div>
                      </a-tooltip>
                    </td>
                    <td>
                      <a-tooltip :title="!row.replacedPersonId ? '请先选择被替换人员' : ''">
                        <div :class="{'disabled-wrapper': !row.replacedPersonId}">
                          <a-date-picker
                            v-model:value="row.resignDate"
                            picker="month"
                            valueFormat="YYYY-MM"
                            :disabledDate="disabledResignDate"
                            :disabled="!row.replacedPersonId"
                            placeholder="选择月份"
                            style="width: 100%"
                          />
                        </div>
                      </a-tooltip>
                    </td>
                    <td>
                      <a-tooltip :title="!row.replacedPersonId ? '请先选择被替换人员' : ''">
                        <div :class="{'disabled-wrapper': !row.replacedPersonId}">
                          <a-select v-model:value="row.groupCategory" :disabled="!row.replacedPersonId" style="width: 100%" placeholder="选择族群">
                            <a-select-option value="研发">研发</a-select-option>
                            <a-select-option value="运营">运营</a-select-option>
                            <a-select-option value="策划">策划</a-select-option>
                            <a-select-option value="测试">测试</a-select-option>
                            <a-select-option value="其他">其他</a-select-option>
                          </a-select>
                        </div>
                      </a-tooltip>
                    </td>
                    <td>
                      <a-skeleton-input v-if="row.fieldLoading" active size="small" />
                      <a-tooltip v-else :title="!row.replacedPersonId ? '请先选择被替换人员' : ''">
                        <div :class="{'disabled-wrapper': !row.replacedPersonId}">
                          <a-select v-model:value="row.rank" :disabled="!row.replacedPersonId" style="width: 100%" placeholder="选择职级">
                            <a-select-option value="P1">P1</a-select-option>
                            <a-select-option value="P2">P2</a-select-option>
                            <a-select-option value="P3">P3</a-select-option>
                            <a-select-option value="P4">P4</a-select-option>
                            <a-select-option value="P5">P5</a-select-option>
                            <a-select-option value="P6">P6</a-select-option>
                            <a-select-option value="P7">P7</a-select-option>
                            <a-select-option value="P8">P8</a-select-option>
                          </a-select>
                        </div>
                      </a-tooltip>
                    </td>
                    <td>
                      <a-skeleton-input v-if="row.fieldLoading" active size="small" />
                      <a-tooltip v-else :title="!row.replacedPersonId ? '请先选择被替换人员' : ''">
                        <div :class="{'disabled-wrapper': !row.replacedPersonId}">
                          <a-select v-model:value="row.socialLocation" :disabled="!row.replacedPersonId" style="width: 100%" placeholder="社保地">
                            <a-select-option value="北京">北京</a-select-option>
                            <a-select-option value="上海">上海</a-select-option>
                            <a-select-option value="广州">广州</a-select-option>
                            <a-select-option value="深圳">深圳</a-select-option>
                            <a-select-option value="杭州">杭州</a-select-option>
                            <a-select-option value="成都">成都</a-select-option>
                          </a-select>
                        </div>
                      </a-tooltip>
                    </td>
                    <td>
                      <a-skeleton-input v-if="row.fieldLoading" active size="small" />
                      <a-tooltip v-else :title="!row.replacedPersonId ? '请先选择被替换人员' : ''">
                        <div :class="{'disabled-wrapper': !row.replacedPersonId}">
                          <a-select v-model:value="row.workLocation" :disabled="!row.replacedPersonId" style="width: 100%" placeholder="工作地">
                            <a-select-option value="北京">北京</a-select-option>
                            <a-select-option value="上海">上海</a-select-option>
                            <a-select-option value="广州">广州</a-select-option>
                            <a-select-option value="深圳">深圳</a-select-option>
                            <a-select-option value="杭州">杭州</a-select-option>
                            <a-select-option value="成都">成都</a-select-option>
                          </a-select>
                        </div>
                      </a-tooltip>
                    </td>
                    <td>
                      <a-tooltip :title="!row.replacedPersonId ? '请先选择被替换人员' : ''">
                        <div :class="{'disabled-wrapper': !row.replacedPersonId}">
                          <a-select v-model:value="row.effectiveDate" :disabled="!row.replacedPersonId" style="width: 100%" placeholder="生效月份">
                            <a-select-option v-for="m in 12" :key="m" :value="`2026-${m.toString().padStart(2, '0')}`">
                              2026年{{ m }}月
                            </a-select-option>
                          </a-select>
                        </div>
                      </a-tooltip>
                    </td>
                    <td>
                      <a-tooltip :title="!row.replacedPersonId ? '请先选择被替换人员' : ''">
                        <div :class="{'disabled-wrapper': !row.replacedPersonId}">
                          <a-select 
                            v-model:value="row.expiryDate" 
                            :disabled="!row.replacedPersonId" 
                            style="width: 100%" 
                            placeholder="失效时间"
                          >
                            <a-select-option value="2026-03">2026年3月</a-select-option>
                            <a-select-option value="2026-06">2026年6月</a-select-option>
                            <a-select-option value="2026-09">2026年9月</a-select-option>
                            <a-select-option value="2026-12">2026年12月</a-select-option>
                          </a-select>
                        </div>
                      </a-tooltip>
                    </td>
                    <td class="sticky-col-right text-center">
                      <a-popconfirm title="确定删除该行吗？" @confirm="handleDeleteRow(index)">
                        <a-button type="link" danger size="small">删除</a-button>
                      </a-popconfirm>
                    </td>
                  </tr>
                  <tr v-if="transitionHCData.length === 0">
                    <td colspan="13" class="empty-state">
                      <a-empty description="暂无过渡期人员，请点击上方按钮添加" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="modal-footer modal-action-area">
              <a-button @click="handleCloseTransitionHCModal">返回</a-button>
              <a-button type="primary" @click="handleConfirmTransitionHC">确定</a-button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div
        v-if="deptBudgetModalVisible"
        class="custom-modal-overlay"
        @click="handleCloseDeptBudgetModal"
      >
        <div class="custom-modal-content dept-budget-modal-content" @click.stop>
          <div class="custom-modal-header">
            <span class="custom-modal-title">部门级预算详情</span>
            <span
              class="custom-modal-close"
              @click="handleCloseDeptBudgetModal"
              >×</span
            >
          </div>
          <div class="custom-modal-body modal-layout">
            <div class="dept-budget-container modal-form-area">
              <table class="transition-hc-table dept-budget-table">
                <thead>
                  <tr>
                    <th rowspan="2" style="width: 240px">部门</th>
                    <th colspan="3">加班费</th>
                    <th colspan="3">离职补偿金</th>
                  </tr>
                  <tr>
                    <th style="width: 120px" class="num-col-th">申请前(元)</th>
                    <th style="width: 160px" class="num-col-th">申请后(元)</th>
                    <th style="width: 120px" class="num-col-th">变化(元)</th>
                    <th style="width: 120px" class="num-col-th">申请前(元)</th>
                    <th style="width: 160px" class="num-col-th">申请后(元)</th>
                    <th style="width: 120px" class="num-col-th">变化(元)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="summary-total-row">
                    <td>部门合计</td>
                    <td class="text-right pre-cell">{{ formatYuanDisplay(totalBudgetRow.overtime.preAmountYuan) }}</td>
                    <td class="text-right">{{ formatYuanDisplay(totalBudgetRow.overtime.postAmountYuan) }}</td>
                    <td class="text-right">
                      <span :class="['diff-money', getDiffClass(totalBudgetRow.overtime.postAmountYuan - totalBudgetRow.overtime.preAmountYuan)]">
                        {{ formatDiffYuan(totalBudgetRow.overtime.postAmountYuan - totalBudgetRow.overtime.preAmountYuan) }}
                      </span>
                    </td>
                    <td class="text-right pre-cell">{{ formatYuanDisplay(totalBudgetRow.severance.preAmountYuan) }}</td>
                    <td class="text-right">{{ formatYuanDisplay(totalBudgetRow.severance.postAmountYuan) }}</td>
                    <td class="text-right">
                      <span :class="['diff-money', getDiffClass(totalBudgetRow.severance.postAmountYuan - totalBudgetRow.severance.preAmountYuan)]">
                        {{ formatDiffYuan(totalBudgetRow.severance.postAmountYuan - totalBudgetRow.severance.preAmountYuan) }}
                      </span>
                    </td>
                  </tr>
                  <tr v-for="row in visibleDeptBudgetRows" :key="row.id">
                    <td>
                      <div class="dept-name-cell" :style="{ paddingLeft: `${row.level * 18}px` }">
                        <button
                          v-if="row.children && row.children.length > 0"
                          type="button"
                          class="tree-toggle"
                          @click="toggleDeptRow(row.id)"
                        >
                          {{ expandedDeptIds.has(row.id) ? '▾' : '▸' }}
                        </button>
                        <span v-else class="tree-placeholder"></span>
                        <span :class="{ 'root-name': row.level === 0 }">{{ row.deptName }}</span>
                      </div>
                    </td>
                    <td class="text-right pre-cell">{{ formatYuanDisplay(row.overtime.preAmountYuan) }}</td>
                    <td class="text-right">
                      <a-input-number
                        v-model:value="row.overtime.postAmountYuan"
                        size="small"
                        :controls="false"
                        :min="0"
                        :formatter="formatYuanInput"
                        :parser="parseYuanInput"
                        style="width: 100%"
                        class="text-right-input"
                      />
                    </td>
                    <td class="text-right">
                      <span :class="['diff-money', getDiffClass(row.overtime.postAmountYuan - row.overtime.preAmountYuan)]">
                        {{ formatDiffYuan(row.overtime.postAmountYuan - row.overtime.preAmountYuan) }}
                      </span>
                    </td>
                    <td class="text-right pre-cell">{{ formatYuanDisplay(row.severance.preAmountYuan) }}</td>
                    <td class="text-right">
                      <a-input-number
                        v-model:value="row.severance.postAmountYuan"
                        size="small"
                        :controls="false"
                        :min="0"
                        :formatter="formatYuanInput"
                        :parser="parseYuanInput"
                        style="width: 100%"
                        class="text-right-input"
                      />
                    </td>
                    <td class="text-right">
                      <span :class="['diff-money', getDiffClass(row.severance.postAmountYuan - row.severance.preAmountYuan)]">
                        {{ formatDiffYuan(row.severance.postAmountYuan - row.severance.preAmountYuan) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="modal-footer modal-action-area">
              <a-button @click="handleCloseDeptBudgetModal">返回</a-button>
              <a-button type="primary" @click="handleConfirmDeptBudget">确定</a-button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <SubsidyEditModal
        v-if="subsidyModalVisible"
        v-model:open="subsidyModalVisible"
        :rows="subsidyModalRows"
        @save="handleSubsidySave"
      />
    </transition>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from "vue";
import {
  AppstoreOutlined,
  DownloadOutlined,
  ExportOutlined,
  ImportOutlined,
  PlusOutlined
} from "@ant-design/icons-vue";
import dayjs, { Dayjs } from "dayjs";
import AdjustmentSummaryTwoLayer from "../components/budget/AdjustmentSummaryTwoLayer.vue";
import BudgetDetailTable from "../components/budget/BudgetDetailTable.vue";
import CombinedActionButton from "../components/CombinedActionButton.vue";
import SubsidyEditModal, { type SubsidyEditRow } from "../components/SubsidyEditModal.vue";
import {
  summaryData,
  detailDataBefore,
  detailDataAfter,
  searchStaff,
  StaffInfo,
  BudgetItem,
  AdjustmentSummaryItem
} from "../mocks/budgetData";

import { message } from 'ant-design-vue';

const handleExport = (version: string, type: string) => {
  const versionText = version === 'current' ? '现状' : '申请后'
  const typeText = type === 'dept' ? '部门' : type === 'proj' ? '项目' : 'HC'
  message.loading(`正在生成 [${versionText}]${typeText}预算报表...`, 2)
  setTimeout(() => {
    message.success(`[${versionText}]${typeText}预算报表 导出成功`)
  }, 2000)
}

interface TransitionHCRow {
  id: string;
  isNew?: boolean;
  hcType: string;
  replacedPersonId?: string;
  deptName?: string;
  projectTag?: string;
  resignDate?: string;
  groupCategory?: string;
  rank?: string;
  socialLocation?: string;
  workLocation?: string;
  effectiveDate?: string;
  expiryDate?: string;
  reason?: string;
  notes?: string;
  salaryDisplay?: string;
  
  // UI states
  searchLoading?: boolean;
  personOptions?: StaffInfo[];
  searchTimer?: ReturnType<typeof setTimeout>;
  fieldLoading?: boolean;
  expiryError?: string;
}

// 过渡期HC 弹窗相关状态
const transitionHCModalVisible = ref(false);
const transitionHCData = ref<TransitionHCRow[]>([]);
const tableContainerRef = ref<HTMLElement | null>(null);
const localDetailDataAfter = ref<BudgetItem[]>(detailDataAfter);
const summaryRows = ref<AdjustmentSummaryItem[]>(JSON.parse(JSON.stringify(summaryData)));
const selectedBeforeEmployeeIds = ref<string[]>([])
const subsidyModalVisible = ref(false)
const subsidyModalRows = ref<SubsidyEditRow[]>([])

const handleBeforeSelectedIdsChange = (ids: string[]) => {
  selectedBeforeEmployeeIds.value = ids
}

const ensureSubsidyMonths = (item: BudgetItem) => {
  if (!item.months) item.months = {} as any
  for (let m = 1; m <= 12; m++) {
    if (!item.months[m]) item.months[m] = { salary: 0, subsidy: 0 }
    if (typeof item.months[m].subsidy !== 'number') item.months[m].subsidy = 0
  }
}

const findPersonById = (items: BudgetItem[], targetId: string): BudgetItem | null => {
  for (const item of items) {
    if (item.id === targetId && item.type === 'person') return item
    if (item.children?.length) {
      const found = findPersonById(item.children, targetId)
      if (found) return found
    }
  }
  return null
}

const buildSubsidyModalRows = (): SubsidyEditRow[] => {
  const rows: SubsidyEditRow[] = []
  for (const id of selectedBeforeEmployeeIds.value) {
    const person = findPersonById(detailDataBefore, id)
    if (!person || person.type !== 'person') continue
    ensureSubsidyMonths(person)
    const months: Record<number, number> = {}
    for (let m = 1; m <= 12; m++) {
      const value = Number(person.months[m].subsidy || 0)
      months[m] = Number(value.toFixed(1))
    }
    rows.push({
      id: person.id,
      name: person.name,
      months
    })
  }
  return rows
}

const applySubsidyToDataTree = (items: BudgetItem[], id: string, months: Record<number, number>) => {
  for (const item of items) {
    if (item.id === id && item.type === 'person') {
      ensureSubsidyMonths(item)
      for (let m = 1; m <= 12; m++) {
        item.months[m].subsidy = Number((months[m] || 0).toFixed(1))
      }
      return true
    }
    if (item.children?.length && applySubsidyToDataTree(item.children, id, months)) {
      return true
    }
  }
  return false
}

const handleOpenSubsidyModal = () => {
  if (!selectedBeforeEmployeeIds.value.length) {
    message.warning('请先选择员工')
    return
  }
  subsidyModalRows.value = buildSubsidyModalRows()
  if (!subsidyModalRows.value.length) {
    message.warning('请先选择员工')
    return
  }
  subsidyModalVisible.value = true
}

const handleSubsidySave = (rows: SubsidyEditRow[]) => {
  for (const row of rows) {
    applySubsidyToDataTree(detailDataBefore, row.id, row.months)
    applySubsidyToDataTree(localDetailDataAfter.value, row.id, row.months)
  }
  subsidyModalRows.value = rows
  message.success('外派补贴已保存')
}

// --- 部门级预算弹窗相关状态 ---
const deptBudgetModalVisible = ref(false);

interface DeptBudgetValue {
  preAmountYuan: number
  postAmountYuan: number
}

interface DeptBudgetTreeRow {
  id: string
  deptName: string
  level: number
  overtime: DeptBudgetValue
  severance: DeptBudgetValue
  children?: DeptBudgetTreeRow[]
}

const toYuan = (wan: number) => Math.round((wan || 0) * 10000)
const toWan = (yuan: number) => Number((yuan / 10000).toFixed(1))
const cloneTreeRows = (rows: DeptBudgetTreeRow[]): DeptBudgetTreeRow[] => {
  return rows.map(row => ({
    ...row,
    overtime: { ...row.overtime },
    severance: { ...row.severance },
    children: row.children ? cloneTreeRows(row.children) : undefined
  }))
}

const buildDeptBudgetRowsFromSummary = (): DeptBudgetTreeRow[] => {
  const root = summaryRows.value[0]
  if (!root) return []
  const toTree = (node: AdjustmentSummaryItem, level: number): DeptBudgetTreeRow => ({
    id: node.id,
    deptName: node.deptName,
    level,
    overtime: {
      preAmountYuan: toYuan(node.pre.deptBudget.overtime),
      postAmountYuan: toYuan(node.post.deptBudget.overtime)
    },
    severance: {
      preAmountYuan: toYuan(node.pre.deptBudget.severance),
      postAmountYuan: toYuan(node.post.deptBudget.severance)
    },
    children: node.children?.map(child => toTree(child, level + 1))
  })
  return [toTree(root, 0)]
}

const deptBudgetRows = ref<DeptBudgetTreeRow[]>(buildDeptBudgetRowsFromSummary())
const draftDeptBudgetRows = ref<DeptBudgetTreeRow[]>([])
const expandedDeptIds = ref<Set<string>>(new Set(['ROOT']))

const flattenVisibleRows = (rows: DeptBudgetTreeRow[]): DeptBudgetTreeRow[] => {
  const out: DeptBudgetTreeRow[] = []
  const walk = (row: DeptBudgetTreeRow) => {
    out.push(row)
    if (row.children && row.children.length > 0 && expandedDeptIds.value.has(row.id)) {
      row.children.forEach(walk)
    }
  }
  rows.forEach(walk)
  return out
}

const visibleDeptBudgetRows = computed(() => flattenVisibleRows(draftDeptBudgetRows.value))

const totalBudgetRow = computed(() => {
  const allRows: DeptBudgetTreeRow[] = []
  const walk = (row: DeptBudgetTreeRow) => {
    allRows.push(row)
    row.children?.forEach(walk)
  }
  deptBudgetRows.value.forEach(walk)
  return {
    overtime: {
      preAmountYuan: allRows.reduce((sum, row) => sum + row.overtime.preAmountYuan, 0),
      postAmountYuan: allRows.reduce((sum, row) => sum + row.overtime.postAmountYuan, 0)
    },
    severance: {
      preAmountYuan: allRows.reduce((sum, row) => sum + row.severance.preAmountYuan, 0),
      postAmountYuan: allRows.reduce((sum, row) => sum + row.severance.postAmountYuan, 0)
    }
  }
})

const formatYuanDisplay = (value: number) => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '0'
  return numeric.toLocaleString('zh-CN', { maximumFractionDigits: 0 })
}

const formatYuanInput = (value: string | number | undefined) => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '0'
  return numeric.toLocaleString('zh-CN', { maximumFractionDigits: 0 })
}

const parseYuanInput = (value: string | undefined) => {
  if (!value) return 0
  const parsed = Number(value.replace(/,/g, '').replace(/[^\d.-]/g, ''))
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  return parsed
}

const formatDiffYuan = (diffYuan: number) => {
  if (diffYuan === 0) return '0'
  const sign = diffYuan > 0 ? '+' : '-'
  return `${sign}${Math.abs(diffYuan).toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`
}

const getDiffClass = (diffYuan: number) => {
  if (diffYuan > 0) return 'text-increase'
  if (diffYuan < 0) return 'text-decrease'
  return 'text-neutral'
}

const syncDeptBudgetSummaryRows = () => {
  const budgetMap = new Map<string, DeptBudgetTreeRow>()
  const walkRows = (rows: DeptBudgetTreeRow[]) => {
    for (const row of rows) {
      budgetMap.set(row.id, row)
      if (row.children) walkRows(row.children)
    }
  }
  walkRows(deptBudgetRows.value)

  const sumSubTree = (row: DeptBudgetTreeRow, field: 'overtime' | 'severance', key: 'preAmountYuan' | 'postAmountYuan'): number => {
    let total = row[field][key]
    if (row.children && row.children.length > 0) {
      for (const child of row.children) {
        total += sumSubTree(child, field, key)
      }
    }
    return total
  }

  const walk = (node: AdjustmentSummaryItem) => {
    const rowBudget = budgetMap.get(node.id)
    if (rowBudget) {
      node.pre.deptBudget.overtime = toWan(rowBudget.overtime.preAmountYuan)
      node.post.deptBudget.overtime = toWan(rowBudget.overtime.postAmountYuan)
      node.pre.deptBudget.severance = toWan(rowBudget.severance.preAmountYuan)
      node.post.deptBudget.severance = toWan(rowBudget.severance.postAmountYuan)
      if (node.children && node.children.length > 0) {
        const rootPreOver = sumSubTree(rowBudget, 'overtime', 'preAmountYuan')
        const rootPostOver = sumSubTree(rowBudget, 'overtime', 'postAmountYuan')
        const rootPreSev = sumSubTree(rowBudget, 'severance', 'preAmountYuan')
        const rootPostSev = sumSubTree(rowBudget, 'severance', 'postAmountYuan')
        node.pre.deptBudget.overtime = toWan(rootPreOver)
        node.post.deptBudget.overtime = toWan(rootPostOver)
        node.pre.deptBudget.severance = toWan(rootPreSev)
        node.post.deptBudget.severance = toWan(rootPostSev)
      }
    }
    node.children?.forEach(walk)
    node.diff.deptBudget.overtime = Number((node.post.deptBudget.overtime - node.pre.deptBudget.overtime).toFixed(1))
    node.diff.deptBudget.severance = Number((node.post.deptBudget.severance - node.pre.deptBudget.severance).toFixed(1))
    node.post.deptBudget.signOn = node.pre.deptBudget.signOn
    node.diff.deptBudget.signOn = 0
  }

  summaryRows.value.forEach(walk)
}

const handleOpenDeptBudgetModal = () => {
  draftDeptBudgetRows.value = cloneTreeRows(deptBudgetRows.value)
  const rootId = draftDeptBudgetRows.value[0]?.id
  expandedDeptIds.value = new Set(rootId ? [rootId] : [])
  deptBudgetModalVisible.value = true
}

const toggleDeptRow = (rowId: string) => {
  const next = new Set(expandedDeptIds.value)
  if (next.has(rowId)) {
    next.delete(rowId)
  } else {
    next.add(rowId)
  }
  expandedDeptIds.value = next
}

const handleCloseDeptBudgetModal = () => {
  deptBudgetModalVisible.value = false
}

const handleConfirmDeptBudget = () => {
  const validate = (rows: DeptBudgetTreeRow[]): boolean => {
    for (const row of rows) {
      if (!Number.isFinite(row.overtime.postAmountYuan) || row.overtime.postAmountYuan < 0) {
        message.error(`请输入有效金额：${row.deptName}-加班费`)
        return false
      }
      if (!Number.isFinite(row.severance.postAmountYuan) || row.severance.postAmountYuan < 0) {
        message.error(`请输入有效金额：${row.deptName}-离职补偿金`)
        return false
      }
      if (row.children && !validate(row.children)) {
        return false
      }
    }
    return true
  }
  if (!validate(draftDeptBudgetRows.value)) return
  deptBudgetRows.value = cloneTreeRows(draftDeptBudgetRows.value)
  syncDeptBudgetSummaryRows()
  deptBudgetModalVisible.value = false
  message.success('部门级预算已保存并同步')
}

let nextRowId = 1;

/**
 * @author AI Assistant
 * @date 2026-03-03
 * @description 关闭过渡期HC录入弹窗并清空数据
 */
const handleCloseTransitionHCModal = () => {
  transitionHCModalVisible.value = false;
  transitionHCData.value = [];
  nextRowId = 1;
};

const handleAddRow = () => {
  const newRow: TransitionHCRow = {
    id: `row_${nextRowId++}`,
    isNew: true,
    hcType: '正编',
    personOptions: [],
    effectiveDate: dayjs().format('YYYY-MM'),
    expiryDate: '6'
  };
  transitionHCData.value.push(newRow);
  
  nextTick(() => {
    setTimeout(() => {
      const el = document.getElementById(`hc-row-${newRow.id}`);
      if (el && tableContainerRef.value) {
        el.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
      setTimeout(() => {
        newRow.isNew = false;
      }, 1000);
    }, 50);
  });
};

const handleSearchPerson = (keyword: string, row: TransitionHCRow) => {
  if (row.searchTimer) clearTimeout(row.searchTimer);
  row.searchTimer = setTimeout(async () => {
    row.searchLoading = true;
    try {
      const results = await searchStaff(keyword);
      row.personOptions = results;
    } finally {
      row.searchLoading = false;
    }
  }, 300);
};

const handlePersonChange = (val: string, _option: any, row: TransitionHCRow) => {
  const person = row.personOptions?.find(p => p.empId === val);
  if (person) {
    row.fieldLoading = true;
    setTimeout(() => {
      row.deptName = person.deptName;
      row.projectTag = person.projectTag;
      row.rank = person.rank;
      row.socialLocation = person.socialLocation;
      row.workLocation = person.workLocation;
      row.groupCategory = person.deptName.includes('研发') ? '研发' : '运营';
      if (person.salaryBase !== undefined) {
        row.salaryDisplay = Math.round(person.salaryBase * 10000).toLocaleString('zh-CN', { maximumFractionDigits: 0 });
      } else {
        row.salaryDisplay = '-';
      }
      row.fieldLoading = false;
    }, 300); 
  }
};

const disabledResignDate = (current: Dayjs) => {
  return current && current < dayjs().startOf('year');
};

const handleDeleteRow = (index: number) => {
  transitionHCData.value.splice(index, 1);
  if (transitionHCData.value.length === 0) {
    nextRowId = 1;
  }
};

const handleConfirmTransitionHC = () => {
  if (transitionHCData.value.length === 0) {
    message.warning('尚未添加任何过渡期人员');
    return;
  }

  // 1. 简要校验
  for (const row of transitionHCData.value) {
    if (!row.replacedPersonId) {
      message.error('请确认所有行均已选择「被替换人员」');
      return;
    }
    if (!row.effectiveDate || !row.expiryDate) {
      message.error('请输入完整的生效和失效日期');
      return;
    }
  }

  // 根据人名回溯基础薪资
  const searchPersonSalary = (items: BudgetItem[], targetName: string): number => {
    let salary = 0;
    for (const item of items) {
      if (item.type === 'person' && item.name === targetName) {
        return item.months[1]?.salary || 0;
      }
      if (item.children) {
        const found = searchPersonSalary(item.children, targetName);
        if (found > 0) return found;
      }
    }
    return salary;
  };

  for (const row of transitionHCData.value) {
    const personName = row.personOptions?.find((p: any) => p.empId === row.replacedPersonId)?.name;
    if (!personName) continue;

    const baseSalary = searchPersonSalary(detailDataBefore, personName) || searchPersonSalary(detailDataAfter, personName) || 0;

    const effMonth = parseInt(row.effectiveDate!.split('-')[1], 10);
    const expMonth = parseInt(row.expiryDate!.split('-')[1], 10);
    const newMonths: any = {};
    
    for (let i = 1; i <= 12; i++) {
       if (i >= effMonth && i <= expMonth) {
         newMonths[i] = { salary: baseSalary, project: row.projectTag || '通用项目' };
       } else {
         newMonths[i] = { salary: '-' };
       }
    }

    const newRowId = `trans_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newHC: BudgetItem = {
      id: newRowId,
      name: '过渡期HC',
      type: 'person',
      tag: 'REG',
      tagName: '正编',
      months: newMonths,
      totalYear: baseSalary * (expMonth - effMonth + 1)
    };

    // 找到对应的部门并 push 进去
    const injectIntoDept = (items: BudgetItem[], deptName: string) => {
      for (const item of items) {
        if (item.type === 'dept' && item.name === deptName) {
           if (!item.children) item.children = [];
           // Remove existing transiton HC if we only want to append, or maybe we just push
           item.children.push(newHC);
           return true;
        }
        if (item.children) {
           if (injectIntoDept(item.children, deptName)) return true;
        }
      }
      return false;
    };
    
    injectIntoDept(localDetailDataAfter.value, row.deptName || '');
  }

  message.success('已应用过渡期HC数据至申请通过后');
  handleCloseTransitionHCModal();
};
</script>

<style scoped>
.budget-adjustment-page {
  background: #f0f2f5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-header {
  height: 48px;
  background: #001529; /* Dark header like screenshot */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  color: #fff;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 16px;
}

.page-title {
  font-size: 16px;
  font-weight: 500;
}

.content-wrapper {
  padding: 16px 24px;
  flex: 1;
}

.section-divider {
  margin: 16px 0 8px;
  display: flex;
  align-items: center;
}

.section-label {
  font-size: 14px;
  font-weight: 500;
  color: #000;
  margin-right: 8px;
}

.after-section .section-label {
  color: #1890ff; /* Highlight for "After" section */
}

.action-buttons-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0;
  padding: 0 8px;
}

.left-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.right-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-divider {
  width: 1px;
  height: 16px;
  background-color: #d9d9d9;
  margin: 0 8px; /* Extra spacing to separate the groups visually */
}

.page-footer {
  background: #fff;
  padding: 12px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #f0f0f0;
  position: sticky;
  bottom: 0;
  z-index: 100;
}

.submit-btn {
  background: #1890ff;
}

/* 过渡期HC 按钮样式 */
.transition-hc-btn {
  height: 32px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.88);
  border-color: #d9d9d9;
}

/* 弹窗遮罩及布局 */
.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-modal-content {
  width: 90vw;
  min-width: 960px;
  height: 640px;
  background: #fff;
  border-radius: 8px;
  margin: 24px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.custom-modal-header {
  height: 56px;
  padding: 0 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.custom-modal-title {
  font-size: 16px;
  font-weight: 500;
  color: #000;
}

.custom-modal-close {
  font-size: 20px;
  cursor: pointer;
  color: #999;
}

.custom-modal-close:hover {
  color: #333;
}

.custom-modal-body {
  padding: 24px;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 弹窗表格样式 */
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

.transition-hc-table th:last-child {
  border-right: none;
}

.action-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.add-icon-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 2px;
  border: 1px dashed #1890ff;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
}

.add-icon-placeholder:hover {
  background: #bae0ff;
}

/* 行高亮动画 */
.highlight-row {
  animation: bgHighlight 1s ease-out;
}

@keyframes bgHighlight {
  0% {
    background-color: #e6f7ff;
  }
  100% {
    background-color: transparent;
  }
}

/* 弹窗淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 冻结操作列 */
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

/* 禁用容器包裹样式 */
.disabled-wrapper {
  display: inline-block;
  width: 100%;
  cursor: not-allowed;
}
.disabled-wrapper > * {
  pointer-events: none;
}

/* 部门级预算弹窗样式 */
.dept-budget-container {
  width: 100%;
  overflow-x: auto;
  padding-bottom: 8px;
}

.dept-budget-modal-content {
  width: fit-content;
  min-width: 0;
  max-width: calc(100vw - 120px);
  height: auto;
  max-height: 80vh;
}

.dept-budget-modal-content .custom-modal-body {
  padding: 16px 20px 68px;
}

.dept-budget-table {
  width: auto;
  min-width: 1040px;
}

.dept-budget-table thead th {
  position: static;
  padding: 10px 8px;
}

.dept-budget-table thead th.num-col-th {
  text-align: right;
  padding-right: 10px;
}

.dept-budget-table tbody tr {
  height: 42px;
}

.dept-budget-table tbody td {
  height: 42px;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  vertical-align: middle;
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}

/* 1. 输入框高度调整为 1.5 倍 (假设原高度24px -> 36px) */
.dept-budget-table .ant-input-number {
  top: auto;
  transform: none;
  margin-top: 0;
  margin-bottom: 0;
  display: inline-block;
  vertical-align: middle;
  height: 30px;
  line-height: 30px;
  width: 100% !important;
}

/* 聚焦时左对齐，失焦时右对齐 */
.text-right-input .ant-input-number-input {
  text-align: right;
}
.text-right-input.ant-input-number-focused .ant-input-number-input {
  text-align: left !important;
}

/* 2. 所有数字内容右对齐 */
.dept-budget-table tbody td:nth-child(n+2) {
  text-align: right !important;
  padding-right: 8px !important;
}

/* 3. 预算增加值样式调整 */
.diff-text {
  margin-top: 4px;
  font-size: 12px; /* 减小字号 (default 14px -> 12px) */
  font-weight: normal; /* 取消加粗 */
  display: block;
  text-align: right; /* Ensure diff text aligns right */
}

.text-increase {
  color: #F44336; /* 红色增加 */
}

.text-decrease {
  color: #00C853; /* 绿色减少 */
}

.text-neutral {
  color: #8c8c8c;
}

.pre-cell {
  color: #8c8c8c;
}

.diff-money {
  font-weight: 500;
}

.summary-total-row td {
  background: #f5f7fa;
  font-weight: 600;
}

.dept-name-cell {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
}

.tree-toggle {
  width: 18px;
  height: 18px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  background: #fff;
  color: #555;
  font-size: 12px;
  line-height: 16px;
  padding: 0;
  cursor: pointer;
}

.tree-placeholder {
  width: 18px;
  display: inline-block;
}

.root-name {
  font-weight: 600;
}

/* 5. 底部按钮调整 */
.dept-budget-modal-content .modal-footer {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  gap: 16px;
  align-items: flex-end;
  border-top: none; /* Remove border if positioned absolutely */
  padding: 0;
  background: transparent;
}

.dept-budget-modal-content .modal-footer .ant-btn {
  height: 44px; /* 移动端点击区域要求 */
  min-width: 88px;
}

/* 针对弹窗内容布局调整以适应按钮 */
.dept-budget-modal-content .custom-modal-body {
  position: relative;
}
</style>
