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
      <AdjustmentSummaryTable :data="summaryData" />

      <!-- Section 2: Before Application -->
      <div class="section-divider">
        <span class="section-label">申请前</span>
      </div>
      <BudgetDetailTable
        title="申请前 汇总"
        :data="detailDataBefore"
        :editable="false"
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
          <CombinedActionButton />
          <a-button>HC增减</a-button>
          <a-dropdown>
            <a-button>其他类型预算申请 <down-outlined /></a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item key="transition">
                  <span class="transition-hc-btn" @click="handleOpenTransitionHCModal">过渡期HC</span>
                </a-menu-item>
                <a-menu-item key="department">
                  <span @click="handleOpenDeptBudgetModal">部门级预算</span>
                </a-menu-item>
                <a-menu-item key="subsidy">
                  <span>外派补贴</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
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
          <div class="custom-modal-body">
            <div class="table-actions-bar" style="margin-bottom: 12px; display: flex; justify-content: flex-end;">
              <a-button type="primary" @click="handleAddRow">
                <template #icon><plus-outlined /></template>
                添加行信息
              </a-button>
            </div>
            <div class="table-container" ref="tableContainerRef">
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
            
            <div class="modal-footer" style="padding: 16px; text-align: right; border-top: 1px solid #f0f0f0;">
              <a-button @click="handleCloseTransitionHCModal" style="margin-right: 8px;">返回</a-button>
              <a-button type="primary" @click="handleConfirmTransitionHC">确定</a-button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <a-modal
      v-model:open="deptBudgetModalVisible"
      title="部门级预算详情"
      width="90vw"
      style="top: 20px;"
      @cancel="handleCloseDeptBudgetModal"
      @ok="handleCloseDeptBudgetModal"
      okText="确定"
      cancelText="返回"
      :destroyOnClose="true"
    >
      <div class="dept-budget-container">
        <table class="transition-hc-table dept-budget-table">
          <thead>
            <tr>
              <th style="width: 120px">费用类型</th>
              <th style="width: 80px">调整状态</th>
              <th v-for="m in 12" :key="m" style="width: 80px">{{ m }}月</th>
              <th style="width: 100px">全年合计</th>
            </tr>
          </thead>
          <tbody>
            <!-- 加班费 -->
            <tr>
              <td rowspan="2" class="text-center" style="font-weight: 500; background: #fafafa">加班费</td>
              <td class="text-center" style="color: #8c8c8c">申请前</td>
              <td v-for="m in 12" :key="`pre-over-${m}`" class="text-center" style="color: #8c8c8c">
                {{ formatMoney(deptBudgetData.overtime.pre[m]) }}
              </td>
              <td class="text-center" style="font-weight: bold; color: #8c8c8c">
                {{ formatMoney(deptBudgetData.overtime.preTotal) }}
              </td>
            </tr>
            <tr>
              <td class="text-center" style="color: #1890ff; font-weight: 500;">申请后</td>
              <td v-for="m in 12" :key="`post-over-${m}`" class="text-center">
                <a-input-number
                  v-model:value="deptBudgetData.overtime.post[m]"
                  size="small"
                  :controls="false"
                  style="width: 100%"
                />
              </td>
              <td class="text-center" style="font-weight: bold;">
                {{ formatMoney(deptBudgetData.overtime.postTotal) }}
                <div v-if="deptBudgetData.overtime.diff !== 0" :class="['diff-text', deptBudgetData.overtime.diff > 0 ? 'text-increase' : 'text-decrease']">
                  {{ deptBudgetData.overtime.diff > 0 ? '+' : '' }}{{ formatMoney(deptBudgetData.overtime.diff) }}
                </div>
              </td>
            </tr>

            <!-- 离职补偿金 -->
            <tr>
              <td rowspan="2" class="text-center" style="font-weight: 500; background: #fafafa">离职补偿金</td>
              <td class="text-center" style="color: #8c8c8c">申请前</td>
              <td v-for="m in 12" :key="`pre-sev-${m}`" class="text-center" style="color: #8c8c8c">
                {{ formatMoney(deptBudgetData.severance.pre[m]) }}
              </td>
              <td class="text-center" style="font-weight: bold; color: #8c8c8c">
                {{ formatMoney(deptBudgetData.severance.preTotal) }}
              </td>
            </tr>
            <tr>
              <td class="text-center" style="color: #1890ff; font-weight: 500;">申请后</td>
              <td v-for="m in 12" :key="`post-sev-${m}`" class="text-center">
                <a-input-number
                  v-model:value="deptBudgetData.severance.post[m]"
                  size="small"
                  :controls="false"
                  style="width: 100%"
                />
              </td>
              <td class="text-center" style="font-weight: bold;">
                {{ formatMoney(deptBudgetData.severance.postTotal) }}
                <div v-if="deptBudgetData.severance.diff !== 0" :class="['diff-text', deptBudgetData.severance.diff > 0 ? 'text-increase' : 'text-decrease']">
                  {{ deptBudgetData.severance.diff > 0 ? '+' : '' }}{{ formatMoney(deptBudgetData.severance.diff) }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </a-modal>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from "vue";
import {
  AppstoreOutlined,
  DownloadOutlined,
  ImportOutlined,
  PlusOutlined,
  DownOutlined
} from "@ant-design/icons-vue";
import dayjs, { Dayjs } from "dayjs";
import AdjustmentSummaryTable from "../components/budget/AdjustmentSummaryTable.vue";
import BudgetDetailTable from "../components/budget/BudgetDetailTable.vue";
import CombinedActionButton from "../components/CombinedActionButton.vue";
import {
  summaryData,
  detailDataBefore,
  detailDataAfter,
  searchStaff,
  StaffInfo,
  BudgetItem
} from "../mocks/budgetData";

import { message } from 'ant-design-vue';

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

// --- 部门级预算弹窗相关状态 ---
const deptBudgetModalVisible = ref(false);

interface MonthlyData {
  [key: number]: number;
}

interface BudgetCategory {
  pre: MonthlyData;
  post: MonthlyData;
  preTotal: number;
  postTotal: number;
  diff: number;
}

// 帮助函数，生成长度12的0
const genEmptyMonths = (): MonthlyData => {
  const m: MonthlyData = {};
  for(let i=1; i<=12; i++) m[i] = 0;
  return m;
};

// 预设一些申请前的原始基线数据
const mockPreOvertime = genEmptyMonths();
mockPreOvertime[1] = 5000;
mockPreOvertime[2] = 4000;

const mockPreSeverance = genEmptyMonths();
mockPreSeverance[6] = 20000;

const deptBudgetData = reactive<{
  overtime: BudgetCategory;
  severance: BudgetCategory;
}>({
  overtime: {
    pre: { ...mockPreOvertime },
    post: { ...mockPreOvertime }, // Initial state matches pre
    get preTotal() { return Object.values(this.pre).reduce((sum, v) => sum + (v || 0), 0); },
    get postTotal() { return Object.values(this.post).reduce((sum, v) => sum + (v || 0), 0); },
    get diff() { return this.postTotal - this.preTotal; }
  },
  severance: {
    pre: { ...mockPreSeverance },
    post: { ...mockPreSeverance },
    get preTotal() { return Object.values(this.pre).reduce((sum, v) => sum + (v || 0), 0); },
    get postTotal() { return Object.values(this.post).reduce((sum, v) => sum + (v || 0), 0); },
    get diff() { return this.postTotal - this.preTotal; }
  }
});

const handleOpenDeptBudgetModal = () => {
  deptBudgetModalVisible.value = true;
};

const handleCloseDeptBudgetModal = () => {
  deptBudgetModalVisible.value = false;
};

const formatMoney = (val: number | string | undefined | null) => {
  if (val === undefined || val === null || val === '') return '-';
  const num = Number(val);
  if (isNaN(num)) return '-';
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
};

let nextRowId = 1;

/**
 * @author AI Assistant
 * @date 2026-03-03
 * @description 打开过渡期HC录入弹窗
 */
const handleOpenTransitionHCModal = () => {
  transitionHCModalVisible.value = true;
};

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
  padding-bottom: 8px; /* 为可能出现的滚动条预留空间 */
}
</style>
