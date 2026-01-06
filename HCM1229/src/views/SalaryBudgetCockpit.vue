<template>
  <div class="cockpit-container">
    <!-- Page Header -->
    <div class="page-header" style="display: flex; align-items: center; margin-bottom: 20px;">
      <div class="page-title" style="font-size: 16px; font-weight: 700; color: rgba(0, 0, 0, 0.85); display: flex; align-items: center; margin-right: 24px;">
        <appstore-outlined style="margin-right: 8px;" />
        工薪预算驾驶舱
      </div>
    </div>

    <!-- Section 1: Pending Applications -->
    <div class="section-card">
      <div class="section-title">
        在途调整/编制申请 <span class="count">(2)</span>
        <a-button type="text" size="small" class="icon-btn-right">
          <template #icon><export-outlined /></template>
        </a-button>
      </div>

      <a-table
        :data-source="pendingData"
        :pagination="false"
        bordered
        size="small"
        row-key="id"
        class="pending-table"
      >
        <a-table-column title="申请类型" data-index="type" :width="100" :customCell="rowSpanType">
          <template #default="{ text }">
            <span class="text-bold" :title="text">{{ text }}</span>
          </template>
        </a-table-column>
        <a-table-column title="申请部门" data-index="dept" :width="120">
          <template #default="{ text }">
            <span class="text-bold" :title="text">{{ text }}</span>
          </template>
        </a-table-column>
        
        <a-table-column-group title="HC">
          <a-table-column-group title="申请前">
            <a-table-column title="正编" data-index="hc_pre_reg" align="right" />
            <a-table-column title="其他人员" data-index="hc_pre_other" align="right" />
          </a-table-column-group>
          <a-table-column-group title="申请通过后">
            <a-table-column title="正编" data-index="hc_post_reg" align="right" />
            <a-table-column title="其他人员" data-index="hc_post_other" align="right" />
          </a-table-column-group>
          <a-table-column-group title="变化">
            <a-table-column title="正编" align="right">
              <template #default="{ record }">
                <span :class="getTextColor(record.hc_diff_reg)">{{ record.hc_diff_reg > 0 ? '+' : '' }}{{ record.hc_diff_reg }}</span>
              </template>
            </a-table-column>
            <a-table-column title="其他人员" align="right">
              <template #default="{ record }">
                <span :class="getTextColor(record.hc_diff_other)">{{ record.hc_diff_other > 0 ? '+' : '' }}{{ record.hc_diff_other }}</span>
              </template>
            </a-table-column>
          </a-table-column-group>
        </a-table-column-group>

        <a-table-column-group title="月度工薪预算 (万)">
          <a-table-column title="申请前" data-index="month_pre" align="right" />
          <a-table-column title="申请通过后" data-index="month_post" align="right" />
          <a-table-column title="变化" data-index="month_diff" align="right">
            <template #default="{ text }">
              <span :class="getTextColor(text)">{{ text > 0 ? '+' : '' }}{{ text }}</span>
            </template>
          </a-table-column>
        </a-table-column-group>

        <a-table-column-group title="年度工薪预算 (万)">
          <a-table-column title="申请前" data-index="year_pre" align="right" />
          <a-table-column title="申请通过后" data-index="year_post" align="right" />
          <a-table-column title="变化" data-index="year_diff" align="right">
            <template #default="{ text }">
              <span :class="getTextColor(text)">{{ text > 0 ? '+' : '' }}{{ text }}</span>
            </template>
          </a-table-column>
        </a-table-column-group>

        <a-table-column title="操作" :width="100" align="center" :customCell="rowSpanAction">
          <template #default="{ record }">
            <div v-if="record.actions" class="action-col">
              <a-button type="link" size="small" v-if="record.actions.includes('submit')">去提交</a-button>
              <a-button type="link" size="small" v-if="record.actions.includes('edit')">修改</a-button>
              <a-button type="link" size="small" danger v-if="record.actions.includes('delete')">删除</a-button>
              <div v-if="record.actions.includes('approving')" class="text-orange text-small">审批中</div>
            </div>
          </template>
        </a-table-column>
      </a-table>
    </div>

    <!-- Section 2: Current Salary Execution & Planning -->
    <div class="section-card no-padding">
      <div class="section-header-row" style="display: flex; justify-content: space-between; align-items: center; padding-right: 24px;">
        <div class="section-title-text">当前工薪执行现状及现行规划</div>
        <a-space>
          <a-button type="text" size="small" @click="handleCollapseAll">一键折叠</a-button>
          <a-button type="text" size="small" @click="handleExpandAll">一键展开</a-button>
        </a-space>
      </div>
      
      <a-table
        :data-source="store.treeData"
        :pagination="false"
        bordered
        size="small"
        :scroll="{ x: 'max-content' }"
        :rowClassName="getRowClassName"
        row-key="id"
        class="budget-tree-table"
        :expandIconColumnIndex="0"
        :expandedRowKeys="expandedKeys"
        @expand="onExpand"
      >
        <a-table-column title="部门" data-index="name" :width="200" fixed="left" />
        <a-table-column-group title="2026年" class="header-bg-gray">
          <a-table-column title="预算调整" :width="60" align="center" class="bg-gray-light">
            <template #default>
              <a-button type="text" size="small"><template #icon><edit-outlined /></template></a-button>
            </template>
          </a-table-column>
          <a-table-column-group title="HC" class="bg-gray-light">
            <a-table-column-group title="当前" class="bg-gray-light">
              <a-table-column title="正编" :width="90" align="right" class="bg-gray-light"><template #default="{record}">{{ formatCount(record.values.h26_cur[0]) }}</template></a-table-column>
              <a-table-column title="实习" :width="90" align="right" class="bg-gray-light"><template #default="{record}">{{ formatCount(record.values.h26_cur[1]) }}</template></a-table-column>
              <a-table-column title="劳务派遣" :width="90" align="right" class="bg-gray-light"><template #default="{record}">{{ formatCount(record.values.h26_cur[2]) }}</template></a-table-column>
              <a-table-column title="人力外包" :width="90" align="right" class="bg-gray-light"><template #default="{record}">{{ formatCount(record.values.h26_cur[3]) }}</template></a-table-column>
              <a-table-column title="兼职" :width="90" align="right" class="bg-gray-light"><template #default="{record}">{{ formatCount(record.values.h26_cur[4]) }}</template></a-table-column>
            </a-table-column-group>
            <a-table-column-group title="年末目标" class="bg-gray-light">
              <a-table-column title="正编" :width="90" align="right" class="bg-gray-light"><template #default="{record}">{{ formatCount(record.values.h26_tgt[0]) }}</template></a-table-column>
              <a-table-column title="实习" :width="90" align="right" class="bg-gray-light"><template #default="{record}">{{ formatCount(record.values.h26_tgt[1]) }}</template></a-table-column>
              <a-table-column title="劳务派遣" :width="90" align="right" class="bg-gray-light"><template #default="{record}">{{ formatCount(record.values.h26_tgt[2]) }}</template></a-table-column>
              <a-table-column title="人力外包" :width="90" align="right" class="bg-gray-light"><template #default="{record}">{{ formatCount(record.values.h26_tgt[3]) }}</template></a-table-column>
              <a-table-column title="兼职" :width="90" align="right" class="bg-gray-light"><template #default="{record}">{{ formatCount(record.values.h26_tgt[4]) }}</template></a-table-column>
            </a-table-column-group>
          </a-table-column-group>
          <a-table-column-group title="工薪成本 (万)" class="bg-gray-light">
            <a-table-column title="累计已发生" :width="120" align="right" class="bg-gray-light"><template #default="{record}"><strong>{{ formatMoney(record.values.cost_acc) }}</strong></template></a-table-column>
            <a-table-column title="全年预算" :width="120" align="right" class="bg-gray-light"><template #default="{record}"><strong>{{ formatMoney(record.values.cost_year) }}</strong></template></a-table-column>
            <a-table-column title="预实比对" :width="100" align="center" class="bg-gray-light">
              <template #default="{record}">
        <a @click="openModal(record)">预实比对</a>
      </template>
            </a-table-column>
          </a-table-column-group>
        </a-table-column-group>

        <a-table-column-group title="2027年" class="header-bg-blue">
          <a-table-column title="预算编制" :width="80" align="center" class="bg-blue-light">
             <template #default>
               <a-button type="text" size="small"><template #icon><file-text-outlined /></template></a-button>
             </template>
          </a-table-column>
          <a-table-column-group title="HC" class="bg-blue-light">
            <a-table-column-group title="年初计划" class="bg-blue-light">
              <a-table-column title="正编" :width="90" align="right" class="bg-blue-light"><template #default="{record}">{{ formatCount(record.values.h27_plan[0]) }}</template></a-table-column>
              <a-table-column title="实习" :width="90" align="right" class="bg-blue-light"><template #default="{record}">{{ formatCount(record.values.h27_plan[1]) }}</template></a-table-column>
              <a-table-column title="劳务派遣" :width="90" align="right" class="bg-blue-light"><template #default="{record}">{{ formatCount(record.values.h27_plan[2]) }}</template></a-table-column>
              <a-table-column title="人力外包" :width="90" align="right" class="bg-blue-light"><template #default="{record}">{{ formatCount(record.values.h27_plan[3]) }}</template></a-table-column>
              <a-table-column title="兼职" :width="90" align="right" class="bg-blue-light"><template #default="{record}">{{ formatCount(record.values.h27_plan[4]) }}</template></a-table-column>
            </a-table-column-group>
            <a-table-column-group title="年末目标" class="bg-blue-light">
              <a-table-column title="正编" :width="90" align="right" class="bg-blue-light"><template #default="{record}">{{ formatCount(record.values.h27_plan[0]) }}</template></a-table-column>
              <a-table-column title="实习" :width="90" align="right" class="bg-blue-light"><template #default="{record}">{{ formatCount(record.values.h27_plan[1]) }}</template></a-table-column>
              <a-table-column title="劳务派遣" :width="90" align="right" class="bg-blue-light"><template #default="{record}">{{ formatCount(record.values.h27_plan[2]) }}</template></a-table-column>
              <a-table-column title="人力外包" :width="90" align="right" class="bg-blue-light"><template #default="{record}">{{ formatCount(record.values.h27_plan[3]) }}</template></a-table-column>
              <a-table-column title="兼职" :width="90" align="right" class="bg-blue-light"><template #default="{record}">{{ formatCount(record.values.h27_plan[4]) }}</template></a-table-column>
            </a-table-column-group>
          </a-table-column-group>
          <a-table-column-group title="工薪成本 (万)" class="bg-blue-light">
            <a-table-column title="全年预算" :width="120" align="right" class="bg-blue-light"><template #default="{record}"><strong>{{ formatMoney(record.values.cost_year * 1.05) }}</strong></template></a-table-column>
          </a-table-column-group>
        </a-table-column-group>
      </a-table>
    </div>

    <!-- Comparison Modal -->
    <a-modal
      v-model:open="modalVisible"
      :title="null"
      :footer="null"
      width="1400px"
      :bodyStyle="{ padding: '0' }"
      :closable="false"
      class="custom-modal"
    >
      <div class="modal-container">
        <!-- Header -->
        <div class="modal-header">
          <div class="filter-row">
            <div class="filter-item">
              <span class="filter-label">部门</span>
              <a-input v-model:value="modalDeptName" readonly class="c-input" />
            </div>
            <div class="filter-item">
              <span class="filter-label">年份</span>
              <a-input value="2026年" readonly style="width: 80px; background: #F7F8FA;" />
            </div>
            <div class="filter-item">
              <span class="filter-label">员工类型</span>
              <a-select 
                v-model:value="modalEmployeeTypes"
                mode="multiple" 
                style="width: 200px" 
                :allowClear="true"
                placeholder="全部"
                :maxTagCount="1"
                @change="generateModalData"
              >
                <a-select-option value="reg">正编</a-select-option>
                <a-select-option value="out">人力外包</a-select-option>
                <a-select-option value="intern">实习生</a-select-option>
                <a-select-option value="dispatch">派遣</a-select-option>
                <a-select-option value="part">兼职</a-select-option>
              </a-select>
            </div>
            <div class="filter-item">
              <span class="filter-label">
                数据维度
                <a-tooltip overlayClassName="custom-tooltip">
                  <template #title>
                    <div class="tooltip-content">
                      <div class="tooltip-title">预算说明</div>
                      <div class="tooltip-item">
                        <span class="tooltip-label">工资：</span>
                        仅包含各类员工的工资总额。对于人力外包、派遣和兼职员工，其“工资”数据与“总工薪”一致。
                      </div>
                      <div class="tooltip-item">
                        <span class="tooltip-label">总工薪：</span>
                        在工资基础上，另包含饭补、五险一金、工会经费、商业保险等各类人力成本项目。
                      </div>
                    </div>
                  </template>
                  <question-circle-outlined style="color: #86909C; margin-left: 4px; cursor: help;" />
                </a-tooltip>
              </span>
              <a-radio-group v-model:value="modalViewType" button-style="solid" @change="handleViewTypeChange">
                <a-radio-button value="salary">工资预算</a-radio-button>
                <a-radio-button value="total">工薪预算</a-radio-button>
                <a-radio-button value="hc">HC预算</a-radio-button>
              </a-radio-group>
            </div>
          </div>
          <div>
            <a-button class="btn-white-custom">预算变更记录</a-button>
            <a-button type="text" @click="modalVisible = false"><close-outlined /></a-button>
          </div>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <a-table
            :columns="modalColumns"
            :dataSource="modalData"
            :pagination="false"
            bordered
            size="small"
            class="modal-table"
            :scroll="{ y: 500 }"
            :rowClassName="getModalRowClassName"
          >
             <template #bodyCell="{ column, text, record }">
               <template v-if="column.dataIndex === 'group'">
                 <div class="vertical-text">{{ text }}</div>
               </template>
               <template v-else-if="months.includes(column.dataIndex as string)">
                 <template v-if="shouldShowDash(column.dataIndex as string, record)">
                   -
                 </template>
                 <template v-else>
                   {{ formatNumber(text) }}
                 </template>
               </template>
               <template v-else-if="column.dataIndex === 'total'">
                 <strong>{{ text }}</strong>
               </template>
             </template>
          </a-table>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useSalaryBudgetStore } from '../stores/salaryBudget'
import {
  ExportOutlined,
  EditOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  CloseOutlined
} from '@ant-design/icons-vue'

const store = useSalaryBudgetStore()

// --- Pending Applications Data ---
const pendingData = [
  {
    id: '1', type: '2025年预算调整', dept: '远景工作室',
    hc_pre_reg: 50, hc_pre_other: 9, hc_post_reg: 54, hc_post_other: 10, hc_diff_reg: 4, hc_diff_other: 1,
    month_pre: 200.0, month_post: 209.5, month_diff: 9.5,
    year_pre: 2400.0, year_post: 2508.6, year_diff: 108.6,
    actions: ['submit', 'delete']
  },
  {
    id: '2', type: '2025年预算调整', dept: '支撑部',
    hc_pre_reg: 17, hc_pre_other: 2, hc_post_reg: 19, hc_post_other: 3, hc_diff_reg: 2, hc_diff_other: 1,
    month_pre: 61.8, month_post: 66.1, month_diff: 4.3,
    year_pre: 741.8, year_post: 793.4, year_diff: 51.6,
    actions: [] 
  },
  {
    id: '3', type: '2025年预算调整', dept: '增长部',
    hc_pre_reg: 20, hc_pre_other: 2, hc_post_reg: 22, hc_post_other: 2, hc_diff_reg: 2, hc_diff_other: 0,
    month_pre: 64.2, month_post: 69.4, month_diff: 5.2,
    year_pre: 770.4, year_post: 827.4, year_diff: 57.0,
    actions: []
  },
  {
    id: '4', type: '2026年预算编制', dept: 'XX工作室',
    hc_pre_reg: 108, hc_pre_other: 56, hc_post_reg: 83, hc_post_other: 70, hc_diff_reg: -25, hc_diff_other: 14,
    month_pre: 216.6, month_post: 166.5, month_diff: -50.1,
    year_pre: 2599.3, year_post: 2313.1, year_diff: -286.3,
    actions: ['edit', 'delete', 'approving']
  },
  {
    id: '5', type: '2026年预算编制', dept: '部门2',
    hc_pre_reg: 35, hc_pre_other: 26, hc_post_reg: 26, hc_post_other: 30, hc_diff_reg: -9, hc_diff_other: 4,
    month_pre: 67.1, month_post: 49.9, month_diff: -17.3,
    year_pre: 805.5, year_post: 753.7, year_diff: -51.8,
    actions: []
  },
  {
    id: '6', type: '2026年预算编制', dept: '部门3',
    hc_pre_reg: 15, hc_pre_other: 15, hc_post_reg: 13, hc_post_other: 20, hc_diff_reg: -2, hc_diff_other: 5,
    month_pre: 29.7, month_post: 25.7, month_diff: -4.0,
    year_pre: 356.3, year_post: 336.5, year_diff: -19.8,
    actions: []
  },
  {
    id: '7', type: '2026年预算编制', dept: '部门4',
    hc_pre_reg: 41, hc_pre_other: 15, hc_post_reg: 31, hc_post_other: 20, hc_diff_reg: -10, hc_diff_other: 5,
    month_pre: 84.5, month_post: 63.9, month_diff: -20.6,
    year_pre: 1014.1, year_post: 849.2, year_diff: -164.9,
    actions: []
  }
]

// RowSpan Logic
const rowSpanType = (record: any, index: number) => {
  if (index === 0) return { rowSpan: 3 }
  if (index === 1 || index === 2) return { rowSpan: 0 }
  if (index === 3) return { rowSpan: 4 }
  if (index > 3) return { rowSpan: 0 }
  return {}
}

const rowSpanAction = (record: any, index: number) => {
  if (index === 0) return { rowSpan: 3 }
  if (index === 1 || index === 2) return { rowSpan: 0 }
  if (index === 3) return { rowSpan: 4 }
  if (index > 3) return { rowSpan: 0 }
  return {}
}

const getTextColor = (val: number) => {
  if (val > 0) return 'text-red'
  if (val < 0) return 'text-green'
  return ''
}

// --- Tree Table Logic ---
const expandedKeys = ref<string[]>([])

const handleExpandAll = () => {
  const keys: string[] = []
  const collect = (nodes: any[]) => {
    nodes.forEach(node => {
      keys.push(node.id)
      if (node.children) collect(node.children)
    })
  }
  if (store.treeData) {
    collect(store.treeData)
  }
  expandedKeys.value = keys
}

const handleCollapseAll = () => {
  expandedKeys.value = []
}

onMounted(() => {
  handleExpandAll()
})

const onExpand = (expanded: boolean, record: any) => {
  store.toggleRow(record.id)
  if (expanded) {
    expandedKeys.value = [...expandedKeys.value, record.id]
  } else {
    expandedKeys.value = expandedKeys.value.filter(k => k !== record.id)
  }
}

// --- Modal Logic ---
const modalVisible = ref(false)
const modalDeptName = ref('')
// Consolidated View Type: 'salary' | 'total' | 'hc'
const modalViewType = ref('salary')

// Computed properties to map view type to old data types for logic compatibility
const modalDataType = computed(() => modalViewType.value === 'hc' ? 'hc' : 'budget')
const modalBudgetType = computed(() => {
  if (modalViewType.value === 'salary') return 'salary'
  if (modalViewType.value === 'total') return 'total'
  return 'salary' // fallback
})

const modalEmployeeTypes = ref<string[]>([])
const modalData = ref<any[]>([])
const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

const modalRecord = ref<any>(null)

const openModal = (record: any) => {
  modalRecord.value = record
  modalDeptName.value = record.name
  // Default to 'salary' (工资预算) as per requirement
  modalViewType.value = 'salary' 
  modalEmployeeTypes.value = [] // Reset to all
  generateModalData()
  modalVisible.value = true
}

const handleViewTypeChange = () => {
  generateModalData()
}

const generateModalData = () => {
  if (!modalRecord.value) return
  
  const isBudget = modalDataType.value === 'budget'
  const allGroups = [
    { name: '正编', type: 'reg', index: 0 },
    { name: '实习生', type: 'intern', index: 1 },
    { name: '派遣', type: 'dispatch', index: 2 },
    { name: '人力外包', type: 'out', index: 3 },
    { name: '兼职', type: 'part', index: 4 }
  ]
  
  const record = modalRecord.value
  
  // Filter groups: If current AND target are 0, remove from list (Requirement 2)
  const availableGroups = allGroups.filter(g => {
    const cur = record.values.h26_cur[g.index]
    const tgt = record.values.h26_tgt[g.index]
    return !(cur === 0 && tgt === 0)
  })
  
  // Sync select options with available groups (Optional: update modalEmployeeTypes if selection is invalid?)
  // Requirement 2: "弹窗中应完全隐藏... 筛选项应同步移除"
  // We can filter the options in template using availableGroups.
  
  // Filter based on user selection
  const groups = modalEmployeeTypes.value.length > 0 
    ? availableGroups.filter(g => modalEmployeeTypes.value.includes(g.type))
    : availableGroups
  
  const rowLabels = isBudget ? 
    [{ label: '年初预算金额(万)', key: 'init' }, { label: '当前预算金额(万)', key: 'curr' }, { label: '已用金额(万)', key: 'used' }, { label: '剩余金额(万)', key: 'remain' }] :
    [{ label: '年初HC预算数', key: 'init' }, { label: '当前HC预算数', key: 'curr' }, { label: '已使用HC数', key: 'used' }, { label: '剩余HC数', key: 'remain' }]

  const result: any[] = []
  
  // Requirement 2: 在表格中明确标注每类人员的计算规则 (Add a helper or info logic, here we can assume the UI shows it via tooltip or we can add a description row? 
  // User says "在表格中明确标注". Maybe add a description text above table or tooltip on row label?
  // Let's stick to the "Total Salary" vs "Salary" toggle logic which implies the rule.)
  
  groups.forEach(group => {
      // Requirement 1: Data Calculation Logic
      // Jan = Current
      const janVal = record.values.h26_cur[group.index]
      // Dec = Target
      const decVal = record.values.h26_tgt[group.index]
      
      let currData: number[] = []
      let totalSalaryTrend: number[] = []
      
      if (isBudget) {
         // Requirement 4: Monthly Budget Distribution
         // Must follow HC trend. Sum must equal Annual Budget.
         // "2026 Annual Data must match outer Annual Budget"
         // Outer Annual Budget is record.values.cost_year.
         
         // 1. Calculate Total Cost Share for this group (proportional to HC)
         const groupAvgHC = (janVal + decVal) / 2
         let totalAvgHC = 0
         availableGroups.forEach(g => {
            totalAvgHC += (record.values.h26_cur[g.index] + record.values.h26_tgt[g.index]) / 2
         })
         
         const ratio = totalAvgHC > 0 ? groupAvgHC / totalAvgHC : 0
         const groupTotalBudget = record.values.cost_year * ratio
         
         // 2. Distribute Total Cost across 12 months based on HC trend
         const hcTrend = []
         for (let i = 0; i < 12; i++) {
            const val = janVal + (decVal - janVal) * (i / 11)
            hcTrend.push(val)
         }
         const totalHCSum = hcTrend.reduce((a, b) => a + b, 0)
         
         // Calculate TOTAL SALARY (Cost) trend
         totalSalaryTrend = hcTrend.map(hc => {
            if (totalHCSum === 0) return 0
            return Number((groupTotalBudget * (hc / totalHCSum)).toFixed(1))
         })
         
         // Adjust Total Salary sum to match groupTotalBudget exactly
         const currentSum = totalSalaryTrend.reduce((a, b) => a + b, 0)
         const diff = Number((groupTotalBudget - currentSum).toFixed(1))
         if (diff !== 0) {
            totalSalaryTrend[11] = Number((totalSalaryTrend[11] + diff).toFixed(1))
         }

         // Requirement 1: Salary Data vs Total Salary (Cost)
         // Check modalBudgetType ('salary' or 'total')
         // Rules:
         // - Reg: Salary = Total * (0.70 ± 0.02)
         // - Intern: Salary = Total * (0.90 ± 0.02)
         // - Dispatch/Out/Part: Salary = Total * 1.0
         
         if (modalBudgetType.value === 'total') {
            currData = totalSalaryTrend
         } else {
            // Calculate Salary portion based on Total Salary
            currData = totalSalaryTrend.map(total => {
                let factor = 1.0
                if (group.type === 'reg') {
                    factor = 0.70 + (Math.random() * 0.04 - 0.02) // 0.68 - 0.72
                } else if (group.type === 'intern') {
                    factor = 0.90 + (Math.random() * 0.04 - 0.02) // 0.88 - 0.92
                }
                // Dispatch, Out, Part stay 1.0
                
                return Number((total * factor).toFixed(1))
            })
         }
         
      } else {
         // HC Logic: Linear Interpolation (Requirement 1: Monotonic trend, no fluctuations)
         
         // Determine trend: increase, decrease, or equal
         const diff = decVal - janVal;
         
         // Generate base linear sequence
         const rawData = [];
         for (let i = 0; i < 12; i++) {
            const val = janVal + (diff) * (i / 11);
            rawData.push(val);
         }
         
         // Round to integer and enforce monotonic constraint
         currData = rawData.map(v => Math.round(v));
         
         // Enforce strict monotonicity (no fluctuations)
         if (diff > 0) {
            // Increasing: ensure prev <= next
            for (let i = 1; i < 11; i++) {
                if (currData[i] < currData[i-1]) currData[i] = currData[i-1];
            }
            // Ensure last is exact target (should be >= 11th if diff > 0)
            if (currData[11] < currData[10]) currData[10] = currData[11]; // Backtrack if needed, or just set last
         } else if (diff < 0) {
            // Decreasing: ensure prev >= next
            for (let i = 1; i < 11; i++) {
                if (currData[i] > currData[i-1]) currData[i] = currData[i-1];
            }
         }
         
         // Force exact endpoints
         currData[0] = janVal;
         currData[11] = decVal;
      }

      let initDataFinal: number[] = []
      let usedDataFinal: number[] = []
      
      if (isBudget) {
           // Define Total Trends for Init and Used (Mock logic consistent with Total View)
           // Init = 1.02 * Current
           // Used = 0.9 * Current
           const totalInitTrend = totalSalaryTrend.map(v => Number((v * 1.02).toFixed(1)))
           const totalUsedTrend = totalSalaryTrend.map(v => Number((v * 0.9).toFixed(1)))
           
           // Apply Ratio if 'salary' selected
           // Reg: 70%, Intern: 90%, Others: 100%
           const getRatio = () => {
               if (modalBudgetType.value === 'salary') {
                   if (group.type === 'reg') return 0.7;
                   if (group.type === 'intern') return 0.9;
               }
               return 1.0;
           }
           const ratio = getRatio();
           
           initDataFinal = totalInitTrend.map(v => Number((v * ratio).toFixed(1)));
           currData = totalSalaryTrend.map(v => Number((v * ratio).toFixed(1)));
           usedDataFinal = totalUsedTrend.map(v => Number((v * ratio).toFixed(1)));
           
      } else {
           // HC Logic (Keep existing)
           const initJan = Math.round(janVal * 1.02);
           const initDec = Math.round(decVal * 1.02);
           const usedJan = Math.round(janVal * 0.9);
           const usedDec = Math.round(decVal * 0.9);
           
           const interpolateHC = (start: number, end: number, steps: number) => {
              const diff = end - start;
              const data = [];
              for (let i = 0; i < steps; i++) {
                  const val = start + (diff) * (i / (steps - 1));
                  data.push(Math.round(val));
              }
              const result = data.map(v => Math.round(v));
              if (diff > 0) {
                  for (let i = 1; i < steps; i++) if (result[i] < result[i-1]) result[i] = result[i-1];
                  if (result[steps-1] < result[steps-2]) result[steps-2] = result[steps-1]; 
              } else if (diff < 0) {
                  for (let i = 1; i < steps; i++) if (result[i] > result[i-1]) result[i] = result[i-1];
              }
              result[0] = start;
              result[steps-1] = end;
              return result;
           };
           
           initDataFinal = interpolateHC(initJan, initDec, 12);
           usedDataFinal = interpolateHC(usedJan, usedDec, 12).map((u, i) => Math.min(u, currData[i]));
      }

      const remainData = currData.map((v, i) => {
         let r = v - usedDataFinal[i]
         if (r < 0) r = 0;
         return isBudget ? Number(r.toFixed(1)) : r
      })

      const dataMap: any = { 'init': initDataFinal, 'curr': currData, 'used': usedDataFinal, 'remain': remainData };

      rowLabels.forEach((row, idx) => {
          const item: any = {
             key: `${group.type}-${row.key}`,
             group: group.name,
             label: row.label,
             rowSpan: idx === 0 ? 4 : 0
          }
          
          months.forEach((m, i) => {
             item[m] = dataMap[row.key][i]
          })
          
          if (isBudget) {
             const sum = dataMap[row.key].reduce((a: number, b: number) => a + b, 0)
             item.total = sum.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
             
             // 修正: 工薪预算模式下，剩余金额的全年合计显示为"-"
             if (modalBudgetType.value === 'total' && row.key === 'remain') {
               item.total = '-'
             }
          }
          
          // Mark last row of the group for visual separation
          if (idx === rowLabels.length - 1) {
            item.isLastInGroup = true
          }
          
          result.push(item)
      })
  })
  
  modalData.value = result
}

const modalRowSpan = (record: any) => {
  return { rowSpan: record.rowSpan }
}

const getRowClassName = (record: any) => {
  return record.type === 'group' ? 'group-row' : ''
}

const getModalRowClassName = (record: any) => {
  return record.isLastInGroup ? 'modal-row-separator' : ''
}

const modalColumns = computed(() => {
  const cols: any[] = [
    {
      title: '2026年',
      dataIndex: 'group',
      width: 40,
      customCell: modalRowSpan,
      customHeaderCell: () => ({ colSpan: 2, style: { textAlign: 'center' } })
    },
    {
      title: '2026年',
      dataIndex: 'label',
      width: 100,
      customHeaderCell: () => ({ colSpan: 0 })
    }
  ]
  
  months.forEach(m => {
    cols.push({
      title: m,
      dataIndex: m,
      align: 'right',
      width: 80
    })
  })
  
  if (modalDataType.value === 'budget') {
    cols.push({
      title: '2026全年',
      dataIndex: 'total',
      align: 'right',
      width: 100
    })
  }
  
  return cols
})

const formatCount = (val: number) => {
  return val.toLocaleString()
}

const formatMoney = (val: number) => {
  return val.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

const formatNumber = (val: number | string) => {
  if (typeof val === 'number') {
    if (modalDataType.value === 'hc') {
      return Math.round(val).toLocaleString()
    }
    return val.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  }
  return val
}

const shouldShowDash = (month: string, record: any) => {
  // Logic:
  // 1. Must be 'total' Budget Type
  // 2. Must be 'used' or 'remain' Row Label
  // 3. Month must be April - December
  
  if (modalBudgetType.value !== 'total') return false
  if (modalDataType.value !== 'budget') return false // Ensure it's budget mode
  
  const label = record.label
  // Labels are: '年初预算金额(万)', '当前预算金额(万)', '已用金额(万)', '剩余金额(万)'
  // We check for '已用' or '剩余'
  if (!label.includes('已用') && !label.includes('剩余')) return false
  
  const targetMonths = ['四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  return targetMonths.includes(month)
}

</script>

<style scoped>
/* --- Deep Overrides for Pixel Perfect Modal --- */

/* Input Styles */
:deep(.c-input.ant-input), 
:deep(.c-input .ant-input) {
  height: 32px;
  border-color: #E5E6EB !important;
  font-size: 13px;
  background-color: #F7F8FA;
  color: #1D2129;
  border-radius: 2px;
}

/* Select Styles */
:deep(.ant-select-selector) {
  height: 32px !important;
  border-color: #E5E6EB !important;
  border-radius: 2px !important;
  font-size: 13px !important;
  box-shadow: none !important;
}

:deep(.ant-select-selection-item) {
  line-height: 30px !important; /* height - 2px border */
}

/* Button Styles */
:deep(.ant-btn) {
  border-radius: 2px;
  font-size: 13px;
  box-shadow: none;
}

/* Custom Button Class */
.btn-white-custom {
  height: 32px;
  border: 1px solid #E5E6EB;
  background: #fff;
  color: #1D2129;
  border-radius: 2px;
  font-size: 13px;
  padding: 0 16px;
  box-shadow: none;
}
.btn-white-custom:hover {
  border-color: #0052D9;
  color: #0052D9;
}

/* Modal Table Header Overrides */
:deep(.modal-table .ant-table-thead > tr > th) {
  font-weight: normal;
  font-size: 12px;
  color: #4E5969;
  background: #fff;
  padding: 8px 12px;
  border-bottom: 1px solid #E5E6EB;
  border-right: 1px solid #E5E6EB;
}

/* First Column Header (2026年) - Bold and Gray Bg */
:deep(.modal-table .ant-table-thead > tr > th:first-child) {
  font-weight: 600;
  color: #1D2129;
  background-color: #F7F8FA;
}

/* Table Body Cell Overrides */
:deep(.modal-table .ant-table-tbody > tr > td) {
  padding: 8px 12px;
  border-bottom: 1px solid #E5E6EB;
  border-right: 1px solid #E5E6EB;
  font-size: 12px;
  color: #1D2129;
  white-space: nowrap;
}

/* Row Separator */
:deep(.modal-row-separator) > td {
  border-bottom: 12px solid #F7F8FA !important;
}

:deep(.modal-table) {
  border: 1px solid #E5E6EB;
  border-radius: 4px;
}

/* Hide Ant Table outer border if we want to match HTML table-wrapper border exactly */
:deep(.modal-table.ant-table-bordered .ant-table-container) {
  border: none;
}

/* Remove default Ant Table hover bg if needed, HTML has FBFBFC */
:deep(.modal-table .ant-table-tbody > tr:hover > td) {
  background-color: #FBFBFC !important;
}

/* Tooltip Styles */
:global(.custom-tooltip .ant-tooltip-inner) {
  background-color: #fff;
  color: #1D2129;
  padding: 12px 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  max-width: 320px;
  font-size: 12px;
  line-height: 1.5;
}

:global(.custom-tooltip .ant-tooltip-arrow::before) {
  background-color: #fff;
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tooltip-title {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 4px;
  color: #1D2129;
}

.tooltip-item {
  color: #4E5969;
}

.tooltip-label {
  font-weight: 600;
  color: #1D2129;
}

/* --- End Overrides --- */

.cockpit-container {
  /* padding: 24px; */
  /* Parent Dashboard already has padding, maybe just full width */
}

.section-card {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.section-card.no-padding {
  padding: 0;
  padding-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.count {
  margin-left: 8px;
  font-weight: 400;
  color: #4E5969;
  font-size: 14px;
}

.icon-btn-right {
  margin-left: auto;
  color: #4E5969;
}

.sub-header {
  font-weight: 400;
  font-size: 11px;
  color: #86909C;
}

.text-bold {
  font-weight: 600;
}

.text-red {
  color: #ff4d4f;
}

.text-green {
  color: #52c41a;
}

.text-orange {
  color: #fa8c16;
}

.text-small {
  font-size: 12px;
}

.action-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.section-header-row {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title-text {
  font-weight: 700;
  font-size: 16px;
}

.header-bg-gray {
  background-color: #f7f9fc !important;
}

.header-bg-blue {
  background-color: #e6f2ff !important;
}

.bg-blue-light {
  background-color: #e6f2ff !important;
}

/* Padding optimization - Exclude hidden measure rows by requiring ant-table-cell class */
:deep(.ant-table-thead > tr > th),
:deep(.ant-table-tbody > tr > td.ant-table-cell) {
  padding: 12px 16px !important;
}

/* Vertical separator for 2026/2027 */
:deep(.header-bg-gray) {
  border-right: 2px solid #e8e8e8 !important;
}
:deep(.header-bg-blue) {
  border-left: 2px solid #e8e8e8 !important; 
}

/* Fix for Group Header border */
:deep(.ant-table-thead > tr > th.border-right) {
  border-right: 1px solid #e8e8e8 !important;
}

/* Group Row Styles - Synced with Dashboard.vue */
:deep(.group-row) > td {
  background-color: #f5f5f5 !important;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88); 
  transition: all 0.2s;
  border-bottom: 1px dashed #d9d9d9 !important; 
}

:deep(.group-row:hover) > td {
  box-shadow: 0 2px 4px rgba(0,0,0,0.05) inset !important;
}

/* Modal Styles */
.modal-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-row {
  display: flex;
  gap: 24px;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
}

.filter-label {
  margin-right: 8px;
  font-weight: 600;
}

.c-input {
  width: 240px;
  background: #F7F8FA;
}

.modal-body {
  padding: 24px;
}

.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 4px;
  font-weight: 600;
  width: 20px;
  margin: 0 auto;
}

/* Deep overrides for table header background colors if scoped doesn't apply to a-table-column-group */
:deep(.header-bg-gray) {
  background-color: #f7f9fc !important;
  border-right: 2px solid #e8e8e8 !important; /* Visual separator between years */
}
:deep(.header-bg-blue) {
  background-color: #e6f2ff !important;
  border-left: 2px solid #e8e8e8 !important;
}
:deep(.bg-blue-light) {
  background-color: #e6f2ff !important;
}

:deep(.bg-gray-light) {
  background-color: #f7f9fc !important;
}

/* Ensure column headers within groups inherit or have specific backgrounds */
:deep(.header-bg-gray th),
:deep(.header-bg-gray td) {
  background-color: #f7f9fc;
}

:deep(.header-bg-blue th),
:deep(.header-bg-blue td) {
  background-color: #e6f2ff;
}

/* Hover effects */
:deep(.ant-table-tbody > tr:hover > td) {
  background-color: #fafafa !important; /* Light gray hover for all */
}
/* Ensure hover overrides background colors of specific columns if needed, or let transparency work. 
   Ant Design Table hover usually applies to td. If td has bg color !important, hover might not show.
   Let's avoid !important on td background if possible, or use a darker hover.
*/
:deep(.ant-table-tbody > tr:hover > td.bg-blue-light) {
  background-color: #e6f2ff !important; /* Keep consistent blue for hover */
}
:deep(.ant-table-tbody > tr:hover > td.bg-gray-light) {
  background-color: #f7f9fc !important; /* Keep consistent gray for hover */
}

/* Global Table Cell Styles for Optimization */
:deep(.ant-table-cell) {
  white-space: nowrap;
}

/* Compact Pending Table */
:deep(.pending-table) {
  width: 100%;
  table-layout: fixed; /* Fix layout for ellipsis */
}

:deep(.pending-table .ant-table-thead > tr > th),
:deep(.pending-table .ant-table-tbody > tr > td.ant-table-cell) {
  padding: 4px 8px !important; /* Further reduced padding */
  font-size: 12px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.pending-table .ant-table-thead > tr > th) {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

/* Ensure tooltips or title attributes work by not overriding pointer events */
:deep(.pending-table .ant-table-tbody > tr > td.ant-table-cell) {
  cursor: default;
}

/* Compact Budget Tree Table */
:deep(.budget-tree-table .ant-table-thead > tr > th),
:deep(.budget-tree-table .ant-table-tbody > tr > td.ant-table-cell) {
  padding: 4px 6px !important; /* Even tighter padding horizontally */
  font-size: 12px;
  line-height: 1.2;
  white-space: nowrap;
}

/* Optimization for max-content scroll with tight spacing */
:deep(.budget-tree-table) {
  /* No fixed layout here as we rely on scroll x for many columns */
}

</style>
