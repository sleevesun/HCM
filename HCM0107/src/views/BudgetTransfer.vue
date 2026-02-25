<template>
  <div class="budget-transfer-container">
    <!-- Header: Page Title -->
    <div class="page-header">
      <div class="page-title">
        <swap-outlined style="margin-right: 8px;" />
        新建资源划转单
      </div>
    </div>

    <!-- Section 1: Basic Config (Header) -->
    <a-card class="config-card" :bordered="false">
      <a-form layout="vertical" :model="formState">
        <a-row :gutter="24">
          <a-col :span="8">
            <a-form-item label="转出部门 (Source)" required>
              <a-select
                v-model:value="formState.sourceDeptId"
                placeholder="请选择转出部门"
                :options="deptOptions"
                @change="handleSourceChange"
                show-search
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="接收部门 (Target)" required>
              <a-select
                v-model:value="formState.targetDeptId"
                placeholder="请选择接收部门"
                :options="deptOptions"
                @change="handleTargetChange"
                show-search
                :status="targetError ? 'error' : ''"
              />
              <div v-if="isTargetNonEntity" class="warning-text">
                <warning-outlined /> 接收方为非实体节点，仅可划转资金
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="生效日期" required>
              <a-date-picker 
                v-model:value="formState.effectiveDate" 
                style="width: 100%" 
                placeholder="请选择生效日期"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24">
            <a-form-item label="划转原因" required>
              <a-textarea 
                v-model:value="formState.reason" 
                placeholder="请填写组织变革背景或相关会议纪要编号 (限200字)" 
                :rows="2" 
                :maxlength="200"
                show-count
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>

    <!-- Section 2: Operation Area (Body) -->
    <a-card class="operation-card" :bordered="false">
      <a-tabs v-model:activeKey="activeTab">
        
        <!-- Tab 1: Dept Budget -->
        <a-tab-pane key="budget" tab="部门级预算">
          <div class="matrix-layout">
            <!-- Left: Source Matrix -->
            <div class="matrix-panel source">
              <div class="panel-header">
                <span class="title">转出方：{{ getDeptName(formState.sourceDeptId) }}</span>
                <span class="tag source">Source</span>
              </div>
              <a-table
                :dataSource="sourceMatrixData"
                :columns="matrixColumns"
                rowKey="key"
                :pagination="false"
                size="small"
                :scroll="{ x: 'max-content', y: 400 }"
                class="matrix-table"
                :rowClassName="(record: any) => record.isSummary ? 'summary-row' : ''"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'name'">
                    <span :class="record.isSummary ? 'text-black font-bold' : ''">
                      {{ record.name }}
                    </span>
                  </template>
                  <template v-else-if="record[column.dataIndex]">
                    <a-popover title="预算明细">
                      <template #content>
                        <div class="popover-detail">
                          <div class="row"><span>总预算:</span> ¥ {{ formatMoney(record[column.dataIndex].total) }}</div>
                          <div class="row"><span>已使用:</span> ¥ {{ formatMoney(record[column.dataIndex].used) }}</div>
                          <div class="row divider"></div>
                          <div class="row"><span>余额:</span> <strong>¥ {{ formatMoney(record[column.dataIndex].remaining) }}</strong></div>
                        </div>
                      </template>
                      <span :class="getRemainingClass(record[column.dataIndex].remaining)" class="cell-value">
                        <span class="balance-label">余额</span> ¥ {{ formatMoney(record[column.dataIndex].remaining) }}
                      </span>
                    </a-popover>
                  </template>
                </template>
              </a-table>
            </div>

            <!-- Middle: Divider -->
            <div class="matrix-divider">
              <div class="divider-line"></div>
              <div class="divider-icon"><swap-outlined /></div>
              <div class="divider-line"></div>
            </div>

            <!-- Right: Target Matrix -->
            <div class="matrix-panel target">
              <div class="panel-header">
                <span class="title">接收方：{{ getDeptName(formState.targetDeptId) }}</span>
                <span class="tag target">Target</span>
              </div>
              <a-table
                :dataSource="targetMatrixData"
                :columns="matrixColumns"
                rowKey="key"
                :pagination="false"
                size="small"
                :scroll="{ x: 'max-content', y: 400 }"
                class="matrix-table"
                :rowClassName="(record: any) => record.isSummary ? 'summary-row' : ''"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'name'">
                    <span :class="record.isSummary ? 'text-black font-bold' : ''">
                      {{ record.name }}
                    </span>
                  </template>
                  <template v-else-if="record[column.dataIndex]">
                    <!-- Summary Row: Read-only -->
                    <span v-if="record.isSummary" class="text-blue">
                      ¥ {{ formatMoney(record[column.dataIndex].transferAmount || 0) }}
                    </span>
                    <!-- Data Row: Input -->
                    <div v-else>
                      <a-input-number
                        v-model:value="record[column.dataIndex].transferAmount"
                        size="small"
                        :min="0"
                        :max="getSourceRemaining(record.name, column.dataIndex)"
                        style="width: 100%"
                        :formatter="(value: any) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                        :parser="(value: any) => value.replace(/\¥\s?|(,*)/g, '')"
                        :status="isTransferInvalid(record.name, column.dataIndex, record[column.dataIndex].transferAmount) ? 'error' : ''"
                        @change="handleTransferChange"
                        :disabled="false"
                        placeholder="0"
                      />
                      <div class="preview-text">
                        <!-- 余额: ¥ {{ formatMoney(record[column.dataIndex].remaining + (record[column.dataIndex].transferAmount || 0)) }} -->
                      </div>
                    </div>
                  </template>
                </template>
              </a-table>
            </div>
          </div>
        </a-tab-pane>

        <!-- Tab 2: Vacant HC -->
        <a-tab-pane key="hc" tab="空缺 HC" :disabled="isTargetNonEntity">
          <div v-if="isTargetNonEntity" class="disabled-mask">
            <span>接收方属性不支持承接编制</span>
          </div>
          
          <div class="hc-table-container">
            <a-table
              :dataSource="vacantHcList"
              :columns="hcColumns"
              :row-selection="rowSelection"
              size="small"
              :pagination="{ pageSize: 50, showSizeChanger: false }"
              :scroll="{ x: 'max-content', y: 400 }"
              rowKey="key"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'code'">
                  <span>{{ record.code }}</span>
                  <a-tag v-if="record.isGap" color="orange" style="margin-left: 4px; font-size: 10px; line-height: 16px;">补差额</a-tag>
                </template>
                <template v-if="['family', 'rank', 'location', 'insurance'].includes(column.key)">
                  <span v-if="record.isGap" style="color: #ccc;">--</span>
                  <span v-else>{{ record[column.key] }}</span>
                </template>
                <template v-if="column.key.startsWith('month_')">
                  <span class="salary-item">
                    {{ record.monthlySalaries[parseInt(column.key.split('_')[1])] !== null ? formatMoney(record.monthlySalaries[parseInt(column.key.split('_')[1])]) : '-' }}
                  </span>
                </template>
                <template v-if="['yearSalary', 'yearTotal'].includes(column.key)">
                  <strong>¥ {{ formatMoney(record[column.key]) }}</strong>
                </template>
              </template>
            </a-table>
          </div>
          
          <div class="tab-footer-stat">
            <div class="info-tip" v-if="vacantHcList.some(i => i.isGap)">
              <info-circle-outlined /> 提示：补差额 HC 将随对应类型的常规 HC 自动选中，不计入 HC 数量统计，但会计入薪酬总额。
            </div>
            <div v-if="formState.selectedHcKeys.length === 0" class="empty-stat">
              请至少选择一个 HC 类型以查看统计信息
            </div>
            <div v-else class="stat-list">
              <div v-for="(stat, type) in selectedHcStats" :key="type" class="stat-card">
                <div class="stat-header">
                  <span class="type-tag">{{ type }}</span>
                </div>
                <div class="stat-body">
                  <div class="stat-item">
                    <span class="label">划转数量</span>
                    <span class="value">{{ stat.count }} <small>个</small></span>
                  </div>
                  <div class="stat-item">
                    <span class="label">工资总额</span>
                    <span class="value">¥ {{ formatMoney(stat.totalSalary) }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">工薪总额</span>
                    <span class="value">¥ {{ formatMoney(stat.totalCost) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>

        <!-- Tab 3: Gap Budget -->
        <a-tab-pane key="gap" tab="补差额 HC 预算" :disabled="isTargetNonEntity">
          <div v-if="isTargetNonEntity" class="disabled-mask">
            <span>接收方属性不支持承接编制</span>
          </div>
          
          <a-table :dataSource="gapBudgetList" :pagination="false" bordered size="middle">
            <a-table-column title="员工类型" dataIndex="type" width="150" />
            <a-table-column title="转出方余额 (Source)" dataIndex="sourceBalance" width="180">
              <template #default="{ text }">¥ {{ formatMoney(text) }}</template>
            </a-table-column>
            <a-table-column title="本次划转金额 (Action)" width="200">
              <template #default="{ record }">
                <a-input-number
                  v-model:value="record.transferAmount"
                  style="width: 100%"
                  :min="0"
                  :max="record.sourceBalance"
                  placeholder="输入金额"
                />
              </template>
            </a-table-column>
            <a-table-column title="接收方状态预览 (Target Preview)">
              <template #default="{ record }">
                <div class="target-preview">
                  <span v-if="record.hasTargetType" class="preview-tag merge">
                    <sync-outlined spin /> 合并金额
                  </span>
                  <span v-else class="preview-tag new">
                    <plus-circle-outlined /> 自动创建
                  </span>
                  <span class="preview-calc">
                    (余额: ¥{{ formatMoney(record.targetBalance) }} + {{ formatMoney(record.transferAmount || 0) }} = 
                    <strong>¥{{ formatMoney(record.targetBalance + (record.transferAmount || 0)) }}</strong>)
                  </span>
                </div>
              </template>
            </a-table-column>
          </a-table>
          <div class="gap-tip">
            <info-circle-outlined /> 提示：若接收部门不存在对应类型的补差额 HC，系统将自动创建一个新的补差额虚拟 HC 并转入金额。
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- Footer: Actions -->
    <div class="footer-bar">
      <div class="footer-summary">
        <span class="summary-item">部门级预算: <strong>¥ {{ formatMoney(formState.transferAmount || 0) }}</strong></span>
        <span class="divider">|</span>
        <span class="summary-item">HC: <strong>{{ vacantHcList.filter(i => formState.selectedHcKeys.includes(i.key) && !i.isGap).length }}</strong> 个</span>
        <span class="divider">|</span>
        <span class="summary-item">补差额预算: <strong>¥ {{ formatMoney(totalGapTransfer) }}</strong></span>
      </div>
      <div class="footer-buttons">
        <a-button style="margin-right: 8px">取消</a-button>
        <a-button style="margin-right: 8px">保存草稿</a-button>
        <a-button type="primary" @click="handleSubmit">提交审批</a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Modal, message } from 'ant-design-vue'
import {
  SwapOutlined,
  WarningOutlined,
  SyncOutlined,
  PlusCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons-vue'

// --- Mock Data ---
const deptOptions = [
  { label: '完美世界 (Root)', value: 'root', isEntity: true },
  { label: '游戏业务 (Group)', value: 'game', isEntity: false },
  { label: '黑羽工作室', value: 'black_feather', isEntity: true },
  { label: '青云工作室', value: 'qingyun', isEntity: true },
  { label: '远景工作室', value: 'vision', isEntity: true },
  { label: '游戏开发运维中心', value: 'dev_ops', isEntity: true }
]

const mockHcData = [
  { key: 'HC001', code: 'HC-2026-001', title: '高级Java开发', level: 'P7', cost: 600000, type: '正编', dept: '产品组', project: '诛仙世界', family: '技术', rank: '14~16', location: '北京', insurance: '北京', monthlySalaries: Array(12).fill(50000), yearSalary: 600000, yearTotal: 780000 },
  { key: 'HC002', code: 'HC-2026-002', title: '资深前端专家', level: 'P8', cost: 800000, type: '正编', dept: '前端组', project: '完美世界', family: '技术', rank: '17~19', location: '上海', insurance: '上海', monthlySalaries: Array(12).fill(66666), yearSalary: 800000, yearTotal: 1040000 },
  { key: 'HC003', code: 'HC-2026-003', title: '产品经理', level: 'P6', cost: 400000, type: '外包', dept: '后端组', project: '幻塔', family: '产品', rank: '11~13', location: '成都', insurance: '成都', monthlySalaries: Array(12).fill(33333), yearSalary: 400000, yearTotal: 520000 },
  { key: 'HC004', code: 'HC-2026-004', title: 'UI设计师', level: 'P5', cost: 250000, type: '实习', dept: '设计组', project: '诛仙世界', family: '设计', rank: '10级以下', location: '北京', insurance: '北京', monthlySalaries: Array(12).fill(20833), yearSalary: 250000, yearTotal: 325000 },
  { key: 'HC005', code: 'HC-2026-005', title: '测试工程师', level: 'P5', cost: 200000, type: '派遣', dept: '测试组', project: '完美世界', family: '测试', rank: '10级以下', location: '北京', insurance: '北京', monthlySalaries: Array(12).fill(16666), yearSalary: 200000, yearTotal: 260000 },
  { key: 'HC006', code: 'HC-2026-006', title: '兼职翻译', level: 'P4', cost: 100000, type: '兼职', dept: '运营组', project: 'Dota2', family: '运营', rank: '10级以下', location: '上海', insurance: '上海', monthlySalaries: Array(12).fill(8333), yearSalary: 100000, yearTotal: 130000 },
  // Regular (5 more)
  { key: 'HC007', code: 'HC-2026-007', title: '高级3D美术', level: 'P7', cost: 550000, type: '正编', dept: '美术组', project: '诛仙世界', family: '美术', rank: '14~16', location: '北京', insurance: '北京', monthlySalaries: Array(12).fill(45833), yearSalary: 550000, yearTotal: 715000 },
  { key: 'HC008', code: 'HC-2026-008', title: '系统策划', level: 'P6', cost: 450000, type: '正编', dept: '策划组', project: '完美世界', family: '策划', rank: '11~13', location: '北京', insurance: '北京', monthlySalaries: Array(12).fill(37500), yearSalary: 450000, yearTotal: 585000 },
  { key: 'HC009', code: 'HC-2026-009', title: '客户端开发', level: 'P6', cost: 480000, type: '正编', dept: '程序组', project: '幻塔', family: '技术', rank: '11~13', location: '成都', insurance: '成都', monthlySalaries: Array(12).fill(40000), yearSalary: 480000, yearTotal: 624000 },
  { key: 'HC010', code: 'HC-2026-010', title: '数值策划', level: 'P7', cost: 520000, type: '正编', dept: '策划组', project: '幻塔', family: '策划', rank: '14~16', location: '成都', insurance: '成都', monthlySalaries: Array(12).fill(43333), yearSalary: 520000, yearTotal: 676000 },
  { key: 'HC011', code: 'HC-2026-011', title: '引擎开发专家', level: 'P9', cost: 1200000, type: '正编', dept: '引擎组', project: '中台', family: '技术', rank: '20级以上', location: '北京', insurance: '北京', monthlySalaries: Array(12).fill(100000), yearSalary: 1200000, yearTotal: 1560000 },
  // Intern (4 more with specific patterns)
  { key: 'HC012', code: 'HC-2026-012', title: '实习策划', level: 'P4', cost: 30000, type: '实习', dept: '策划组', project: 'Dota2', family: '策划', rank: '10级以下', location: '上海', insurance: '上海', monthlySalaries: [...Array(6).fill(5000), ...Array(6).fill(null)], yearSalary: 30000, yearTotal: 39000 },
  { key: 'HC013', code: 'HC-2026-013', title: '实习测试', level: 'P4', cost: 35000, type: '实习', dept: '测试组', project: 'CSGO', family: '测试', rank: '10级以下', location: '上海', insurance: '上海', monthlySalaries: [...Array(7).fill(5000), ...Array(5).fill(null)], yearSalary: 35000, yearTotal: 45500 },
  { key: 'HC014', code: 'HC-2026-014', title: '实习美术', level: 'P4', cost: 45000, type: '实习', dept: '美术组', project: '诛仙世界', family: '美术', rank: '10级以下', location: '北京', insurance: '北京', monthlySalaries: [...Array(9).fill(5000), ...Array(3).fill(null)], yearSalary: 45000, yearTotal: 58500 },
  { key: 'HC015', code: 'HC-2026-015', title: '实习运营', level: 'P4', cost: 50000, type: '实习', dept: '运营组', project: '完美世界', family: '运营', rank: '10级以下', location: '北京', insurance: '北京', monthlySalaries: [...Array(10).fill(5000), ...Array(2).fill(null)], yearSalary: 50000, yearTotal: 65000 },
  // Outsourced (3 more)
  { key: 'HC016', code: 'HC-2026-016', title: '外包测试', level: 'P5', cost: 180000, type: '外包', dept: '测试组', project: '幻塔', family: '测试', rank: '10级以下', location: '成都', insurance: '成都', monthlySalaries: Array(12).fill(15000), yearSalary: 180000, yearTotal: 234000 },
  { key: 'HC017', code: 'HC-2026-017', title: '外包美术', level: 'P5', cost: 240000, type: '外包', dept: '美术组', project: '诛仙世界', family: '美术', rank: '10级以下', location: '北京', insurance: '北京', monthlySalaries: Array(12).fill(20000), yearSalary: 240000, yearTotal: 312000 },
  { key: 'HC018', code: 'HC-2026-018', title: '外包客服', level: 'P4', cost: 120000, type: '外包', dept: '客服组', project: 'Dota2', family: '客服', rank: '10级以下', location: '上海', insurance: '上海', monthlySalaries: Array(12).fill(10000), yearSalary: 120000, yearTotal: 156000 },
  // Gap HCs
  { key: 'GAP001', code: 'GAP-2026-001', title: '正编补差', level: '', cost: 100000, type: '正编', dept: '产品组', project: '诛仙世界', family: '', rank: '', location: '', insurance: '', monthlySalaries: Array(12).fill(100000/12), yearSalary: 100000, yearTotal: 100000, isGap: true, parentKey: 'HC001' },
  { key: 'GAP002', code: 'GAP-2026-002', title: '外包补差', level: '', cost: 50000, type: '外包', dept: '后端组', project: '幻塔', family: '', rank: '', location: '', insurance: '', monthlySalaries: Array(12).fill(50000/12), yearSalary: 50000, yearTotal: 50000, isGap: true, parentKey: 'HC003' },
]

const vacantHcList = computed(() => {
  const typeOrder = ['正编', '外包', '实习', '派遣', '兼职']
  
  return [...mockHcData].sort((a, b) => {
    // 1. Dept (Ascending)
    if (a.dept !== b.dept) {
      return a.dept.localeCompare(b.dept, 'zh-CN')
    }
    
    // 2. Type (Custom Order)
    const typeIdxA = typeOrder.indexOf(a.type)
    const typeIdxB = typeOrder.indexOf(b.type)
    if (typeIdxA !== typeIdxB) {
      return typeIdxA - typeIdxB
    }
    
    // 3. Gap HC first
    if (a.isGap !== b.isGap) {
      return a.isGap ? -1 : 1
    }
    
    return 0
  })
})

const gapBudgetList = [
  { key: 1, type: '正编补差', sourceBalance: 500000, transferAmount: 0, targetBalance: 100000, hasTargetType: true },
  { key: 2, type: '实习生补差', sourceBalance: 20000, transferAmount: 0, targetBalance: 0, hasTargetType: false },
  { key: 3, type: '外包补差', sourceBalance: 150000, transferAmount: 0, targetBalance: 50000, hasTargetType: true },
]

// --- Matrix Data Types ---
const FIXED_CATEGORIES = [
  { key: 'overtime', name: '加班费' },
  { key: 'severance', name: '离职补偿金' },
  { key: 'adjustment', name: '调薪' }
]

interface BudgetDetail {
  total: number
  used: number
  remaining: number
  transferAmount?: number
}

interface DeptBudgetRow {
  key: string
  name: string
  isSummary: boolean
  // Dynamic keys based on FIXED_CATEGORIES
  [key: string]: any 
}

// --- Matrix Mock Data Generator ---
const generateMatrixData = (deptId: string): DeptBudgetRow[] => {
  if (!deptId) return []
  
  const subDepts = ['产品组', '前端组', '后端组', '测试组', '设计组']
  const seed = deptId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  
  const rows: DeptBudgetRow[] = subDepts.map((name, i) => {
    const row: DeptBudgetRow = {
      key: `${deptId}_${i}`,
      name: name,
      isSummary: false
    }
    
    FIXED_CATEGORIES.forEach((cat, j) => {
      const catSeed = seed + i * 10 + j
      const total = Math.floor((Math.sin(catSeed) * 10000) % 50000) + 50000
      
      // Allow 0 budget/used for some cases to simulate empty accounts
      const hasBudget = Math.sin(catSeed + 2) > -0.8 // 90% chance to have budget
      const realTotal = hasBudget ? total : 0
      
      const used = hasBudget ? Math.floor(realTotal * (0.4 + (Math.sin(catSeed + 1) * 0.4))) : 0
      
      const isOverspent = hasBudget && Math.sin(catSeed + 3) > 0.8 // 10% chance
      const realUsed = isOverspent ? Math.floor(realTotal * 1.2) : used
      
      let remaining = realTotal - realUsed
      
      if (isOverspent && realUsed > realTotal) {
        remaining = realTotal - realUsed // Should be negative
      }
      
      row[cat.key] = {
        total: realTotal,
        used: realUsed,
        remaining,
        transferAmount: 0
      } as BudgetDetail
    })
    
    return row
  })
  
  // Calculate Summary Row
  const summaryRow: DeptBudgetRow = {
    key: 'summary',
    name: '总计',
    isSummary: true
  }
  
  FIXED_CATEGORIES.forEach(cat => {
    const sumTotal = rows.reduce((sum, r) => sum + r[cat.key].total, 0)
    const sumUsed = rows.reduce((sum, r) => sum + r[cat.key].used, 0)
    const sumRemaining = rows.reduce((sum, r) => sum + r[cat.key].remaining, 0)
    
    summaryRow[cat.key] = {
      total: sumTotal,
      used: sumUsed,
      remaining: sumRemaining,
      transferAmount: 0
    }
  })
  
  return [summaryRow, ...rows]
}

// --- State ---
const activeTab = ref('budget')
const formState = reactive({
  sourceDeptId: undefined as string | undefined,
  targetDeptId: undefined as string | undefined,
  effectiveDate: null,
  reason: '',
  transferAmount: 0, // Used for Footer Summary only
  selectedHcKeys: [] as string[]
})

// Matrix Data State
const sourceMatrixData = ref<DeptBudgetRow[]>([])
const targetMatrixData = ref<DeptBudgetRow[]>([])

// --- Computed ---
const matrixColumns = [
  { title: '部门', dataIndex: 'name', key: 'name', width: 120, fixed: 'left' },
  ...FIXED_CATEGORIES.map(cat => ({
    title: cat.name,
    dataIndex: cat.key,
    key: cat.key,
    width: 140,
    align: 'center' as const
  }))
]

const isTargetNonEntity = computed(() => {
  const target = deptOptions.find(d => d.value === formState.targetDeptId)
  return target ? !target.isEntity : false
})

const targetError = computed(() => {
  return formState.sourceDeptId && formState.targetDeptId && formState.sourceDeptId === formState.targetDeptId
})

// const isOverBudget = computed(() => {
//   // Logic moved to row-level validation
//   return false 
// })

const selectedHcCost = computed(() => {
  return vacantHcList.value
    .filter(item => formState.selectedHcKeys.includes(item.key))
    .reduce((sum, item) => sum + item.cost, 0)
})

const selectedHcStats = computed(() => {
  const stats: Record<string, { count: number; totalSalary: number; totalCost: number }> = {}
  
  const selectedItems = vacantHcList.value.filter(item => formState.selectedHcKeys.includes(item.key))
  
  selectedItems.forEach(item => {
    if (!stats[item.type]) {
      stats[item.type] = { count: 0, totalSalary: 0, totalCost: 0 }
    }
    // Only count regular HCs
    if (!item.isGap) {
      stats[item.type].count++
    }
    // Sum salary/cost for ALL selected items (including Gap)
    stats[item.type].totalSalary += item.yearSalary
    stats[item.type].totalCost += item.yearTotal
  })
  
  return stats
})

const totalGapTransfer = computed(() => {
  return gapBudgetList.reduce((sum, item) => sum + (item.transferAmount || 0), 0)
})

// --- Methods ---
const getDeptName = (id?: string) => {
  return deptOptions.find(d => d.value === id)?.label || '-'
}

const formatMoney = (val?: number) => {
  if (val === undefined || val === null) return '0'
  return val.toLocaleString('en-US')
}

const getRemainingClass = (val: number) => {
  return val < 0 ? 'text-red' : 'text-black'
}

const handleSourceChange = (val: string) => {
  sourceMatrixData.value = generateMatrixData(val)
  // Simulate HC list change - vacantHcList is now computed, so we don't need to manually reset it for mock
  // In real app, we would fetch new data here
}

const handleTargetChange = (val: string) => {
  // Target structure mirrors Source structure logic for demo
  const rawData = generateMatrixData(val)
  // Target needs to have transferAmount reset to 0
  targetMatrixData.value = rawData.map(row => {
    const newRow = { ...row }
    FIXED_CATEGORIES.forEach(cat => {
      // Don't leak source balance to target matrix!
      // In a real app, 'remaining' would be fetched from Target's API.
      // Here we simulate Target having its own balance (e.g., 0 or random)
      // For demo: Let's say Target starts with 0 balance if it's a new transfer.
      // OR if we want to simulate existing balance, we should generate new randoms.
      // But CRITICALLY: DO NOT copy Source's 'remaining' value.
      
      // Let's generate a different "Target Balance" for demo purposes, 
      // ensuring it's not the Source's balance.
      const targetBalance = Math.floor(Math.random() * 10000) 
      
      newRow[cat.key] = { 
        ...row[cat.key], 
        remaining: targetBalance, // Overwrite with Target's own balance
        transferAmount: 0 
      }
    })
    return newRow
  })
  
  const target = deptOptions.find(d => d.value === val)
  if (target && !target.isEntity) {
    activeTab.value = 'budget' 
  }
}

// Helper to find Source Remaining by Key (for validation)
const getSourceRemaining = (deptName: string, catKey: string): number => {
  // Fallback: Find by Name match
  // 1. Find Target Category Name
  // let targetCatName = ''
  let targetSubName = ''
  
  // Find which row we are in Target Matrix to get names
  // This helper is called with deptName and catKey
  targetSubName = deptName
  // targetCatName = FIXED_CATEGORIES.find(c => c.key === catKey)?.name || ''
  
  // 2. Find Source Category with same SubDept Name
  // Source Matrix Row structure: { name: '产品组', overtime: {...}, ... }
  const sourceRow = sourceMatrixData.value.find(r => r.name === targetSubName)
  
  // 3. Return remaining from Source Row
  if (sourceRow && sourceRow[catKey]) {
    // return sourceRow[catKey].remaining // Removed strict row limit
    // Return actual max for validation
    return sourceRow[catKey].remaining 
  }
  
  return 0
}

const isTransferInvalid = (deptName: string, catKey: string, amount: number) => {
  // Real-time validation for single cell
  // Allow empty input (which is undefined or null or 0)
  if (!amount) return false
  
  const max = getSourceRemaining(deptName, catKey)
  // If max is negative (overspent source), disallow any positive transfer
  if (max <= 0 && amount > 0) return true
  
  return amount > max
}

const handleTransferChange = () => {
  // 1. Recalculate Summary Row for Target
  const summaryRow = targetMatrixData.value[0]
  if (summaryRow && summaryRow.isSummary) {
    FIXED_CATEGORIES.forEach(cat => {
      let totalTransfer = 0
      // Sum from index 1 to end (skip summary row itself)
      for (let i = 1; i < targetMatrixData.value.length; i++) {
        totalTransfer += (targetMatrixData.value[i][cat.key].transferAmount || 0)
      }
      summaryRow[cat.key].transferAmount = totalTransfer
    })
  }

  // 2. Update Total Transfer Amount for Footer
  let total = 0
  // Skip summary row
  for (let i = 1; i < targetMatrixData.value.length; i++) {
    const row = targetMatrixData.value[i]
    FIXED_CATEGORIES.forEach(cat => {
      total += (row[cat.key].transferAmount || 0)
    })
  }
  formState.transferAmount = total
}

// Transfer Table Columns
// const leftColumns = [
//   { dataIndex: 'code', title: 'HC编码' },
//   { dataIndex: 'title', title: '职位名称' },
//   { dataIndex: 'level', title: '职级' },
// ]

// const rightColumns = [
//   { dataIndex: 'code', title: 'HC编码' },
//   { dataIndex: 'title', title: '职位名称' },
//   { dataIndex: 'cost', title: '年成本' },
// ]

// const getRowSelection = ({ selectedKeys, onItemSelect }: any) => {
//   return {
//     onSelect: (record: any, selected: boolean) => {
//       onItemSelect(record.key, selected);
//     },
//     selectedRowKeys: selectedKeys,
//   };
// };

// const filterOption = (inputValue: string, item: any) => {
//   return item.title.indexOf(inputValue) > -1 || item.code.indexOf(inputValue) > -1;
// };

// const handleHcChange = (keys: string[]) => {
//   formState.selectedHcKeys = keys
// }

const hcColumns = [
  { title: 'HC编码', dataIndex: 'code', key: 'code', width: 120, fixed: 'left' },
  { title: 'HC类型', dataIndex: 'type', key: 'type', width: 80 },
  { title: '所属部门', dataIndex: 'dept', key: 'dept', width: 100 },
  { title: '所属项目', dataIndex: 'project', key: 'project', width: 100 },
  { title: '族群类别', dataIndex: 'family', key: 'family', width: 100 },
  { title: '职级', dataIndex: 'rank', key: 'rank', width: 80 },
  { title: '工作地', dataIndex: 'location', key: 'location', width: 80 },
  { title: '社保地', dataIndex: 'insurance', key: 'insurance', width: 80 },
  ...Array.from({ length: 12 }, (_, i) => ({
    title: `${i + 1}月`,
    key: `month_${i}`,
    width: 80,
    align: 'right' as const,
    customRender: ({ text, record }: any) => {
        // Special render logic handled in template slot, but this helps column def completeness
        return text
    }
  })),
  { title: '全年工资', dataIndex: 'yearSalary', key: 'yearSalary', width: 120, align: 'right' as const },
  { title: '全年工薪', dataIndex: 'yearTotal', key: 'yearTotal', width: 120, align: 'right' as const },
]

const rowSelection = {
  onChange: (selectedRowKeys: string[], selectedRows: any[]) => {
    // 1. Separate regular selection
    const newSelection = new Set(selectedRowKeys)
    
    // 2. Find selected regular HCs
    const selectedRegulars = selectedRows.filter(r => !r.isGap)
    
    // 3. Auto-select associated Gap HCs
    // Logic: If regular HC is selected, select all Gap HCs with same dept and type
    vacantHcList.value.filter(item => item.isGap).forEach(gapItem => {
      const parentRegular = selectedRegulars.find(reg => 
        reg.dept === gapItem.dept && reg.type === gapItem.type
      )
      
      if (parentRegular) {
        newSelection.add(gapItem.key)
      } else {
        newSelection.delete(gapItem.key)
      }
    })
    
    formState.selectedHcKeys = Array.from(newSelection)
  },
  selectedRowKeys: computed(() => formState.selectedHcKeys),
  getCheckboxProps: (record: any) => ({
    disabled: record.isGap, // Disable checkbox for Gap HCs
  }),
}

// Validation helper for Total Transfer Amount
const isTotalOverLimit = computed(() => {
  if (!formState.sourceDeptId || !sourceMatrixData.value.length) return false
  
  // Get Source Summary Total Budget
  const sourceSummary = sourceMatrixData.value[0]
  if (!sourceSummary || !sourceSummary.isSummary) return false
  
  let sourceTotalRemaining = 0
  FIXED_CATEGORIES.forEach(cat => {
    sourceTotalRemaining += sourceSummary[cat.key].remaining
  })
  
  return formState.transferAmount > sourceTotalRemaining
})

const handleSubmit = () => {
  // Validation
  if (!formState.sourceDeptId || !formState.targetDeptId) {
    message.error('请选择转出和接收部门')
    return
  }
  if (targetError.value) {
    message.error('转出和接收部门不能相同')
    return
  }
  
  if (isTotalOverLimit.value) {
    message.error('接收方总计金额超过转出方总余额，请调整金额')
    return
  }
  
  // Check for any row-level errors
  let hasRowError = false
  // Skip summary row
  for (let i = 1; i < targetMatrixData.value.length; i++) {
    const row = targetMatrixData.value[i]
    FIXED_CATEGORIES.forEach(cat => {
      const amount = row[cat.key].transferAmount || 0
      if (isTransferInvalid(row.name, cat.key, amount)) {
        hasRowError = true
      }
    })
  }
  
  if (hasRowError) {
    message.error('部分项目划转金额超过转出方可用额度，请检查红色标记项')
    return
  }
  
  // Create Log
  const logs: string[] = []
  // Skip summary row
  for (let i = 1; i < targetMatrixData.value.length; i++) {
    const row = targetMatrixData.value[i]
    FIXED_CATEGORIES.forEach(cat => {
      const amount = row[cat.key].transferAmount || 0
      if (amount > 0) {
        logs.push(`[${row.name}-${cat.name}] 划转 ¥${formatMoney(amount)}`)
      }
    })
  }
  
  if (logs.length === 0) {
    message.warning('请输入至少一笔划转金额')
    return
  }
  
  Modal.confirm({
    title: '确认提交审批',
    content: `您确定要将 [${deptOptions.find(d => d.value === formState.sourceDeptId)?.label}] 的资源划转给 [${deptOptions.find(d => d.value === formState.targetDeptId)?.label}] 吗？\n\n涉及明细：\n${logs.join('\n')}`,
    onOk() {
      console.log('Transaction Logs:', logs)
      message.success('提交成功！')
    }
  })
}
</script>

<style scoped>
.budget-transfer-container {
  min-height: 100%;
  padding-bottom: 60px; /* Space for footer */
  position: relative;
}

.page-header {
  margin-bottom: 16px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1D2129;
  display: flex;
  align-items: center;
}

.config-card {
  margin-bottom: 16px;
  background: #F7F8FA; /* Light gray bg for config area */
  border-radius: 4px;
}

.warning-text {
  color: #fa8c16;
  font-size: 12px;
  margin-top: 4px;
}

.operation-card {
  min-height: 500px;
}

/* Matrix Layout */
.matrix-layout {
  display: flex;
  gap: 16px;
  height: 500px;
}

.matrix-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #E5E6EB;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.matrix-panel.source { border-top: 3px solid #52C41A; }
.matrix-panel.target { border-top: 3px solid #1890FF; }

.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid #E5E6EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FAFAFA;
}

.panel-header .title {
  font-weight: 600;
  color: #1D2129;
}

.panel-header .tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.tag.source { background: #F6FFED; color: #52C41A; border: 1px solid #B7EB8F; }
.tag.target { background: #E6F7FF; color: #1890FF; border: 1px solid #91D5FF; }

.matrix-table {
  flex: 1;
  overflow: hidden;
}

/* Divider */
.matrix-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40px;
}

.divider-line {
  flex: 1;
  width: 1px;
  background: #E5E6EB;
}

.divider-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #F2F3F5;
  color: #86909C;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px 0;
  border: 1px solid #E5E6EB;
}

/* Text Colors */
.text-green { color: #52C41A; font-weight: 600; }
.text-red { color: #FF4D4F; font-weight: 600; }
.text-blue { color: #1890FF; font-weight: 600; }
.text-black { color: #1D2129; }
.font-bold { font-weight: 700; }
.text-gray { color: #86909C; }

.error-text {
  color: #FF4D4F;
  font-size: 12px;
  margin-top: 2px;
}

.preview-text {
  font-size: 12px;
  color: #86909C;
  text-align: right;
  margin-top: 2px;
}

.popover-detail {
  font-size: 12px;
}
.popover-detail .row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  min-width: 120px;
}
.popover-detail .divider {
  height: 1px;
  background: #E5E6EB;
  margin: 4px 0;
}

.cell-value {
  cursor: help;
  display: block;
  width: 100%;
}

.balance-label {
  font-size: 10px;
  color: #86909C;
  margin-right: 2px;
  font-weight: normal;
  vertical-align: middle;
}

:deep(.summary-row) > td {
  background-color: #FAFAFA !important;
  font-weight: 600;
}

/* Disabled Mask */
.disabled-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #999;
}

/* Footer Bar */
.footer-bar {
  position: fixed;
  bottom: 0;
  right: 0;
  left: 200px; /* Adjust based on sidebar width if fixed */
  height: 60px;
  background: #fff;
  border-top: 1px solid #E5E6EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

/* Adjust for layout if needed */
@media (max-width: 768px) {
  .footer-bar { left: 0; }
}

.summary-item {
  font-size: 14px;
  color: #4E5969;
}

.divider {
  margin: 0 16px;
  color: #E5E6EB;
}

/* Gap Budget Styles */
.target-preview {
  display: flex;
  align-items: center;
}

.preview-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  margin-right: 8px;
}

.preview-tag.merge { background: #E6F7FF; color: #1890FF; border: 1px solid #91D5FF; }
.preview-tag.new { background: #F6FFED; color: #52C41A; border: 1px solid #B7EB8F; }

.gap-tip {
  margin-top: 16px;
  color: #86909C;
  font-size: 13px;
}

.hc-table-container {
  margin-bottom: 16px;
}

.salary-item {
  display: block;
  text-align: right;
  color: #595959;
  font-size: 12px;
}

/* Stat Card Styles */
.tab-footer-stat {
  margin-top: 16px;
  padding: 16px;
  background: #FAFAFA;
  border-radius: 4px;
  border: 1px solid #E5E6EB;
}

.info-tip {
  margin-bottom: 12px;
  color: #86909C;
  font-size: 13px;
  background: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px dashed #E5E6EB;
}

.empty-stat {
  text-align: center;
  color: #86909C;
  padding: 12px 0;
}

.stat-list {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-card {
  flex: 1;
  min-width: 180px; /* Reduced to fit 5 cards */
  background: #fff;
  border: 1px solid #E5E6EB;
  border-radius: 4px;
  padding: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.stat-header {
  margin-bottom: 8px;
  border-bottom: 1px solid #F2F3F5;
  padding-bottom: 8px;
}

.type-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #E6F7FF;
  color: #1890FF;
  border: 1px solid #91D5FF;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 500;
}

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.stat-item .label {
  color: #86909C;
}

.stat-item .value {
  color: #1D2129;
  font-weight: 600;
}

.stat-item .value small {
  font-weight: normal;
  color: #86909C;
  margin-left: 2px;
}
</style>