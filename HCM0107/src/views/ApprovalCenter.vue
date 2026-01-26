<template>
  <div class="approval-center-container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-title">
        <appstore-outlined style="margin-right: 8px;" />
        审批中心
      </div>
      <a-radio-group v-model:value="approvalStatus" button-style="solid">
        <a-radio-button value="pending">待审批</a-radio-button>
        <a-radio-button value="approved">已审批</a-radio-button>
      </a-radio-group>
    </div>

    <!-- Action Bar -->
    <div class="action-bar">
      <div class="filter-compact">
        <span class="label">申请年度：</span>
        <a-radio-group v-model:value="selectedYear" button-style="solid" size="small">
          <a-radio-button value="2026">2026年</a-radio-button>
          <a-radio-button value="2027">2027年</a-radio-button>
        </a-radio-group>
      </div>
      <a-space>
        <a-button type="text" @click="handleRepairData">
           <template #icon><reload-outlined /></template>
           数据修复
        </a-button>
        <a-button type="text" @click="handleCollapseAll">一键折叠</a-button>
        <a-button type="text" @click="handleExpandAll">一键展开</a-button>
      </a-space>
    </div>

    <!-- Tree Table -->
    <a-table
      :dataSource="tableData"
      :expandedRowKeys="expandedKeys"
      @expand="handleExpand"
      rowKey="id"
      :pagination="false"
      :scroll="{ x: 'max-content' }"
      bordered
      size="middle"
      :rowClassName="getRowClassName"
    >
      <a-table-column title="申请部门" dataIndex="name" :width="250" fixed="left" align="left" class="border-right">
         <template #default="{ record }">
            <div class="dept-name-cell">
              <span>{{ record.name }}</span>
              <a-tooltip 
                v-if="record.values.approval_status === 'to_approve' || record.values.has_child_to_approve" 
                title="有新的审批待处理"
              >
                <span 
                  class="notification-dot" 
                  @click.stop="handleViewDetails(record)"
                ></span>
              </a-tooltip>
            </div>
         </template>
      </a-table-column>
      
      <a-table-column-group title="HC" class="border-right">
        <a-table-column-group title="申请前">
          <a-table-column title="正编" :width="80" align="center">
            <template #default="{ record }">{{ record.values.hc_pre_reg }}</template>
          </a-table-column>
          <a-table-column title="其他人员" :width="80" align="center">
            <template #default="{ record }">{{ record.values.hc_pre_other }}</template>
          </a-table-column>
        </a-table-column-group>
        
        <a-table-column-group>
          <template #title>
            申请通过后 <info-circle-outlined style="color: var(--color-text-3)" />
          </template>
          <a-table-column title="正编" :width="80" align="center">
            <template #default="{ record }">
              <span v-if="READ_ONLY_IDS.has(record.id)" style="color: #999;">―</span>
              <span v-else>{{ record.values.hc_post_reg }}</span>
            </template>
          </a-table-column>
          <a-table-column title="其他人员" :width="80" align="center">
            <template #default="{ record }">
              <span v-if="READ_ONLY_IDS.has(record.id)" style="color: #999;">―</span>
              <span v-else>{{ record.values.hc_post_other }}</span>
            </template>
          </a-table-column>
        </a-table-column-group>
        
        <a-table-column-group>
          <template #title>
            变化 <info-circle-outlined style="color: var(--color-text-3)" />
          </template>
          <a-table-column title="正编" :width="80" align="center">
            <template #default="{ record }">
              <span v-if="READ_ONLY_IDS.has(record.id)" style="color: #999;">―</span>
              <span v-else :style="getDiffStyle(record.values.hc_diff_reg)">
                {{ formatDiff(record.values.hc_diff_reg) }}
              </span>
            </template>
          </a-table-column>
          <a-table-column title="其他人员" :width="80" align="center">
            <template #default="{ record }">
              <span v-if="READ_ONLY_IDS.has(record.id)" style="color: #999;">―</span>
              <span v-else :style="getDiffStyle(record.values.hc_diff_other)">
                {{ formatDiff(record.values.hc_diff_other) }}
              </span>
            </template>
          </a-table-column>
        </a-table-column-group>
      </a-table-column-group>

      <a-table-column-group title="月度工薪预算 (万)" class="border-right">
        <a-table-column title="申请前" :width="100" align="center">
          <template #default="{ record }">
            <a-tooltip v-if="record.type === 'group'" title="数据由下级部门汇总计算">
               <span style="border-bottom: 1px dotted #999; cursor: help;">{{ record.values.month_pre.toFixed(2) }}</span>
            </a-tooltip>
            <span v-else>{{ record.values.month_pre.toFixed(2) }}</span>
          </template>
        </a-table-column>
        <a-table-column :width="100" align="center">
          <template #title>
            申请通过后 <info-circle-outlined style="color: var(--color-text-3)" />
          </template>
          <template #default="{ record }">
             <span v-if="READ_ONLY_IDS.has(record.id)" style="color: #999;">―</span>
             <template v-else>
                <a-tooltip v-if="record.type === 'group'" title="数据由下级部门汇总计算">
                   <span style="border-bottom: 1px dotted #999; cursor: help;">{{ record.values.month_post.toFixed(2) }}</span>
                </a-tooltip>
                <span v-else>{{ record.values.month_post.toFixed(2) }}</span>
             </template>
          </template>
        </a-table-column>
        <a-table-column title="变化" :width="100" align="center">
          <template #default="{ record }">
            <span v-if="READ_ONLY_IDS.has(record.id)" style="color: #999;">―</span>
            <span v-else :style="getDiffStyle(record.values.month_diff)">
              {{ formatDiff(record.values.month_diff) }}
            </span>
          </template>
        </a-table-column>
      </a-table-column-group>

      <a-table-column-group title="年度工薪预算 (万)" class="border-right">
        <a-table-column title="申请前" :width="100" align="center">
          <template #default="{ record }">{{ record.values.year_pre.toFixed(2) }}</template>
        </a-table-column>
        <a-table-column :width="100" align="center">
          <template #title>
            申请通过后 <info-circle-outlined style="color: var(--color-text-3)" />
          </template>
          <template #default="{ record }">
             <span v-if="READ_ONLY_IDS.has(record.id)" style="color: #999;">―</span>
             <span v-else>{{ record.values.year_post.toFixed(2) }}</span>
          </template>
        </a-table-column>
        <a-table-column title="变化" :width="100" align="center">
          <template #default="{ record }">
            <span v-if="READ_ONLY_IDS.has(record.id)" style="color: #999;">―</span>
            <span v-else :style="getDiffStyle(record.values.year_diff)">
              {{ formatDiff(record.values.year_diff) }}
            </span>
          </template>
        </a-table-column>
      </a-table-column-group>

      <a-table-column title="操作" :width="80" align="center" fixed="right" class="border-right">
        <template #default="{ record }">
          <template v-if="READ_ONLY_IDS.has(record.id)">
             <span style="color: #999; cursor: not-allowed;">―</span>
          </template>
          <!-- Check approval status first -->
          <template v-else-if="record.values.approval_status === 'to_approve'">
             <a @click="handleViewDetails(record)" style="color: #1890FF;">去审批</a>
          </template>
          <template v-else-if="record.values.approval_status === 'approving'">
             <a @click="handleViewDetails(record)" style="color: #FA8C16;">审批中</a>
          </template>
          <!-- If status is none, show '-' -->
          <template v-else>
             <span style="color: #999; cursor: not-allowed;">―</span>
          </template>
        </template>
      </a-table-column>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import {
  AppstoreOutlined,
  InfoCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons-vue'
import { 
  DEPT_TREE_STRUCTURE, 
  HIDE_ACTION_IDS, 
  HIDE_CHILDREN_ACTION_PARENT_IDS, 
  READ_ONLY_IDS 
} from '../constants/deptStructure'
import type { DeptNode } from '../constants/deptStructure'

// --- Types ---
interface Metrics {
  hc_pre_reg: number
  hc_pre_other: number
  hc_post_reg: number
  hc_post_other: number
  hc_diff_reg: number
  hc_diff_other: number
  
  month_pre: number
  month_post: number
  month_diff: number
  
  year_pre: number
  year_post: number
  year_diff: number
  
  approval_status?: 'none' | 'to_approve' | 'approving'
  has_child_to_approve?: boolean
}

// interface DashboardDeptNode extends DeptNode {
//   values?: Metrics
//   children?: DashboardDeptNode[]
// }

// --- State ---
const approvalStatus = ref('pending')
const selectedYear = ref('2026')
const expandedKeys = ref<string[]>([])
const tableData = ref<DeptNode[]>([])

// --- Data Logic ---
const STATIC_DATA_STORE: Record<string, DeptNode[]> = {}

const generateStaticData = (year: string): DeptNode => {
  const generateMetrics = (weight: number): Metrics => {
    const scaleReg = 100;
    const scaleOther = 10;
    const pseudoRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    }
    
    const seed = weight * (year === '2027' ? 1.1 : 1.0);
    const variance = 0.95 + pseudoRandom(seed) * 0.1;
    const growth = year === '2027' ? 1.02 : 1.0;
    
    const reg = Math.round(weight * scaleReg * variance * growth);
    const other = Math.round(weight * scaleOther * variance * growth);
    
    const diffSeed = pseudoRandom(seed + 1);
    let reg_diff = 0;
    let other_diff = 0;
    
    if (diffSeed < 0.4) {
       reg_diff = 0;
    } else if (diffSeed < 0.7) {
       reg_diff = -Math.max(1, Math.round(reg * (0.01 + pseudoRandom(seed + 2) * 0.09)));
    } else {
       reg_diff = Math.max(1, Math.round(reg * (0.01 + pseudoRandom(seed + 2) * 0.09)));
    }
    
    const otherDiffSeed = pseudoRandom(seed + 3);
    if (otherDiffSeed < 0.4) {
       other_diff = 0;
    } else if (otherDiffSeed < 0.7) {
       other_diff = -Math.max(1, Math.round(other * (0.01 + pseudoRandom(seed + 4) * 0.09)));
    } else {
       other_diff = Math.max(1, Math.round(other * (0.01 + pseudoRandom(seed + 4) * 0.09)));
    }

    const reg_pre = reg - reg_diff;
    const other_pre = other - other_diff;
    
    const costPerHead = 1.8 + pseudoRandom(seed + 5) * 0.4;
    
    const month_pre = (reg_pre + other_pre) * costPerHead;
    const month_post = (reg + other) * costPerHead;
    const month_diff = month_post - month_pre;
    
    return {
      hc_pre_reg: reg_pre,
      hc_pre_other: other_pre,
      hc_post_reg: reg,
      hc_post_other: other,
      hc_diff_reg: reg_diff,
      hc_diff_other: other_diff,
      month_pre: month_pre,
      month_post: month_post,
      month_diff: month_diff,
      year_pre: month_pre * 12,
      year_post: month_post * 12,
      year_diff: month_diff * 12
    }
  }

  const processNode = (node: DeptNode, parentId?: string): DeptNode => {
    const newNode = { ...node, children: node.children ? [] : undefined } as DeptNode
    let status: 'none' | 'to_approve' | 'approving' = 'none'
    const shouldHide = HIDE_ACTION_IDS.has(node.id) || (parentId && HIDE_CHILDREN_ACTION_PARENT_IDS.has(parentId))
    
    if (!shouldHide) {
       let hash = 0;
       for (let i = 0; i < node.id.length; i++) {
         hash = node.id.charCodeAt(i) + ((hash << 5) - hash);
       }
       status = (Math.abs(hash) % 2 === 0) ? 'to_approve' : 'approving';
    }
    
    if (node.id === 'hr') status = 'none'

    if (node.children) {
      newNode.children = node.children.map(child => processNode(child, node.id))
      const agg: Metrics = {
        hc_pre_reg: 0, hc_pre_other: 0, hc_post_reg: 0, hc_post_other: 0, hc_diff_reg: 0, hc_diff_other: 0,
        month_pre: 0, month_post: 0, month_diff: 0,
        year_pre: 0, year_post: 0, year_diff: 0,
        approval_status: status,
        has_child_to_approve: false
      }
      
      newNode.children.forEach(child => {
        if (child.values) {
          agg.hc_pre_reg += child.values.hc_pre_reg
          agg.hc_pre_other += child.values.hc_pre_other
          agg.hc_post_reg += child.values.hc_post_reg
          agg.hc_post_other += child.values.hc_post_other
          agg.month_pre += child.values.month_pre
          agg.month_post += child.values.month_post
          agg.year_pre += child.values.year_pre
          agg.year_post += child.values.year_post
          
          if (child.values.approval_status === 'to_approve' || child.values.has_child_to_approve) {
             agg.has_child_to_approve = true
          }
        }
      })
      
      agg.hc_diff_reg = agg.hc_post_reg - agg.hc_pre_reg
      agg.hc_diff_other = agg.hc_post_other - agg.hc_pre_other
      agg.month_diff = agg.month_post - agg.month_pre
      agg.year_diff = agg.year_post - agg.year_pre
      
      if (node.id === 'root') agg.has_child_to_approve = false
      
      agg.month_pre = Math.round(agg.month_pre * 100) / 100
      agg.month_post = Math.round(agg.month_post * 100) / 100
      agg.year_pre = Math.round(agg.year_pre * 100) / 100
      agg.year_post = Math.round(agg.year_post * 100) / 100
      agg.month_diff = agg.month_post - agg.month_pre
      agg.year_diff = agg.year_post - agg.year_pre
      
      newNode.values = agg
    } else {
      const metrics = generateMetrics(node.weight || 1)
      if (READ_ONLY_IDS.has(node.id)) {
        metrics.hc_post_reg = metrics.hc_pre_reg
        metrics.hc_post_other = metrics.hc_pre_other
        metrics.hc_diff_reg = 0
        metrics.hc_diff_other = 0
        metrics.month_post = metrics.month_pre
        metrics.month_diff = 0
        metrics.year_post = metrics.year_pre
        metrics.year_diff = 0
      }
      metrics.approval_status = status
      metrics.has_child_to_approve = false
      newNode.values = metrics
    }
    return newNode
  }

  return processNode(DEPT_TREE_STRUCTURE)
}

const refreshData = () => {
  const year = selectedYear.value
  if (!STATIC_DATA_STORE[year]) {
    STATIC_DATA_STORE[year] = [generateStaticData(year)]
  }
  tableData.value = STATIC_DATA_STORE[year]
}

watch(selectedYear, () => {
  refreshData()
})

onMounted(() => {
  refreshData()
  // Requirement 1: Default Expand All
  handleExpandAll()
})

// --- Interaction Handlers ---
const handleExpand = (expanded: boolean, record: DeptNode) => {
  if (expanded) {
    expandedKeys.value = [...expandedKeys.value, record.id]
  } else {
    expandedKeys.value = expandedKeys.value.filter(k => k !== record.id)
  }
}

const handleExpandAll = () => {
  const keys: string[] = []
  const collect = (node: DeptNode) => {
    keys.push(node.id)
    if (node.children) node.children.forEach(collect)
  }
  collect(DEPT_TREE_STRUCTURE)
  expandedKeys.value = keys
}

const handleCollapseAll = () => {
  expandedKeys.value = []
}

const handleRepairData = () => {
  for (const key in STATIC_DATA_STORE) {
    delete STATIC_DATA_STORE[key]
  }
  refreshData()
}

const handleViewDetails = (record: DeptNode) => {
  console.log('View details for:', record.name)
}

const getRowClassName = (record: DeptNode) => {
  return record.type === 'group' ? 'group-row' : ''
}

const formatDiff = (val: number) => {
  if (Math.abs(val) < 0.01) return '―'
  return (val > 0 ? '+' : '') + val.toFixed(2)
}

const getDiffStyle = (val: number) => {
  if (Math.abs(val) < 0.01) return { color: 'var(--color-text-3)', display: 'inline-block' } 
  if (val > 0) return { color: '#cf1322', display: 'inline-block' } 
  return { color: '#3f8600', display: 'inline-block' } 
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 16px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  margin-right: 24px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-compact {
  display: flex;
  align-items: center;
  gap: 12px;
}

.label {
  font-weight: 600;
  font-size: 14px;
}

:deep(.ant-table-thead > tr > th) {
  text-align: center !important;
  font-weight: 600;
  background: #fafafa;
}

:deep(.border-right) {
  border-right: 1px solid #e8e8e8 !important;
}

:deep(.ant-table-cell.border-right) {
  border-right: 1px solid #e8e8e8 !important;
  padding-right: 8px !important; 
  padding-left: 8px !important;
}

:deep(.ant-table-thead > tr > th.border-right) {
  border-right: 1px solid #e8e8e8 !important;
}

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

.dept-name-cell {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.notification-dot {
  width: 8px;
  height: 8px;
  background-color: #ff4d4f; 
  border-radius: 50%;
  margin-left: 6px;
  cursor: pointer;
  position: relative;
  animation: fade-in 0.3s ease-in-out;
  box-shadow: 0 0 0 1px #fff; 
}

@keyframes fade-in {
  from { opacity: 0; transform: scale(0); }
  to { opacity: 1; transform: scale(1); }
}

.notification-dot:hover {
  transform: scale(1.2);
  transition: transform 0.2s;
}
</style>