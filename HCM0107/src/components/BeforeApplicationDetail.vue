<template>
  <div class="before-application-detail">
    <!-- 顶部操作区 -->
    <div class="operation-bar">
      <div class="left-actions">
        <span class="title">申请前</span>
        <a-button @click="toggleSelectAll">
          {{ allSelected ? '取消全选' : '全选' }}
        </a-button>
      </div>
      <div class="right-actions">
        <a-input-search
          v-model:value="searchText"
          placeholder="搜索姓名/工号/项目标签"
          style="width: 250px"
          @search="onSearch"
        />
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <a-table
        :dataSource="filteredData"
        :columns="columns"
        :pagination="false"
        size="small"
        bordered
        rowKey="id"
        :scroll="{ x: 'max-content', y: 'calc(100% - 40px)' }"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange, columnWidth: 80, getCheckboxProps: getCheckboxProps }"
        :defaultExpandAllRows="true"
        :expandIconColumnIndex="0"
        class="detail-table"
      >
        <!-- Custom Header -->
        <template #headerCell="{ column }">
           <template v-if="column.key === 'year'">
             <div class="year-header">2026</div>
           </template>
        </template>

        <!-- Custom Body Cell -->
        <template #bodyCell="{ column, text, record }">
          <!-- Name Column with Popover -->
          <template v-if="column.dataIndex === 'name'">
             <div class="name-cell">
               <!-- Summary Labels -->
               <template v-if="record.isSummary">
                 <span class="summary-label">{{ record.name }}</span>
               </template>
               
               <!-- Employee -->
               <template v-else-if="record.isPerson">
                 <span 
                   class="tag-badge" 
                   :class="record.type === '正编' ? 'tag-regular' : 'tag-intern'"
                 >
                   {{ record.type }}
                 </span>
                 <a-popover 
                   title="" 
                   trigger="hover" 
                   placement="right"
                   :getPopupContainer="getPopupContainer"
                   overlayClassName="employee-popover"
                 >
                   <template #content>
                     <div class="popover-content">
                       <div class="popover-header">
                         <span class="p-name">{{ record.name }}</span>
                         <span class="p-dept-tag">{{ record.dept }}</span>
                       </div>
                       <div class="popover-body">
                         <div class="p-row"><span class="label">项目:</span> <span class="val">{{ record.detail.project }}</span></div>
                         <div class="p-row"><span class="label">地区:</span> <span class="val">{{ record.detail.location }}</span></div>
                         <div class="p-row"><span class="label">入职日期:</span> <span class="val">{{ record.detail.joinDate }}</span></div>
                         <div class="p-row"><span class="label">族群:</span> <span class="val">{{ record.detail.group }}</span></div>
                         <div class="p-row"><span class="label">职级:</span> <span class="val">{{ record.detail.level }}</span></div>
                         <div class="p-row"><span class="label">月薪:</span> <span class="val">{{ record.detail.salary }}</span></div>
                         <div class="p-row"><span class="label">公司:</span> <span class="val">{{ record.detail.company }}</span></div>
                       </div>
                     </div>
                   </template>
                   <span class="name-text">{{ text }}</span>
                 </a-popover>
               </template>

               <!-- Department -->
               <template v-else>
                 <span class="name-text">{{ text }}</span>
               </template>
             </div>
          </template>

          <!-- Salary Columns -->
          <template v-else-if="column.key === 'month' || column.key === 'total'">
            <span class="number-cell">{{ formatNumber(text) }}</span>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// --- Mock Data Construction ---
const generateMockData = () => {
  const depts = [
    { name: '星云工作室', type: 'root', children: ['运营部', '测试部', '策划部', '客户端', '服务器', '美术部'] }
  ]
  
  const rawData = [
     { dept: '星云工作室', total: 3895.3, children: [
        { dept: '运营部', total: 159.1, employees: [
           { name: '陈力文', type: '正编', salary: 10.4 },
           { name: '范思冲', type: '正编', salary: 13.3 },
           { name: '张鹏', type: '正编', salary: 12.9 },
           { name: '徐贺', type: '正编', salary: 0.4 },
           { name: '王子旋', type: '正编', salary: 0.1 },
           { name: '范一頔', type: '正编', salary: 7.8 },
           { name: '何鑫', type: '正编', salary: 0.3 }
        ]},
        { dept: '测试部', total: 58.8, employees: [
           { name: '马凯强', type: '正编', salary: 4.9 },
           { name: '王升', type: '正编', salary: 4.7 }
        ]}
     ]}
  ]

  let idCounter = 1
  const mapNode = (node: any): any => {
    // If it's a dept node with employees
    if (node.employees) {
       const children = node.employees.map((emp: any) => ({
          id: String(idCounter++),
          name: emp.name,
          type: emp.type,
          dept: node.dept,
          isPerson: true,
          detail: {
            project: '星云项目',
            location: '北京',
            joinDate: '2020-01-01',
            group: '技术族',
            level: 'T3-1',
            salary: `${emp.salary}万`,
            company: 'AntGravity'
          },
          ...Array.from({ length: 12 }).reduce((acc: any, _, i) => {
             acc[`m${i+1}`] = emp.salary
             return acc
          }, {}),
          total: (emp.salary * 12).toFixed(1)
       }))
       
       return {
         id: String(idCounter++),
         name: node.dept,
         isPerson: false,
         children,
         ...Array.from({ length: 12 }).reduce((acc: any, _, i) => {
             acc[`m${i+1}`] = children.reduce((sum: number, c: any) => sum + Number(c[`m${i+1}`]), 0).toFixed(1)
             return acc
          }, {}),
          total: children.reduce((sum: number, c: any) => sum + Number(c.total), 0).toFixed(1)
       }
    } 
    // If it's a Root node (星云工作室)
    else if (node.children) {
       const children = node.children.map(mapNode)
       
       // Calculate aggregates for Root
       const monthlyTotals = Array.from({ length: 12 }).reduce((acc: any, _, i) => {
           acc[`m${i+1}`] = children.reduce((sum: number, c: any) => sum + Number(c[`m${i+1}`]), 0).toFixed(1)
           return acc
       }, {})
       const annualTotal = children.reduce((sum: number, c: any) => sum + Number(c.total), 0).toFixed(1)

       // Transform Root Node into a flattened structure with summary rows if needed
       // Requirement: "星云工作室" as root, with HC, Total Salary rows under it? 
       // User asked to remove "工资(万)" column and put totals in "姓名/部门" column
       // Let's create a structure:
       // - Root (星云工作室)
       //   - HC (Summary Row)
       //   - 总工薪(万) (Summary Row)
       //   - 总工资(万) (Summary Row)
       //   - Children Depts...
       
       const rootId = String(idCounter++)
       
       // Mock Summary Rows
       const hcRow = {
         id: rootId + '-hc',
         name: 'HC',
         isSummary: true,
         // HC values would be counts, mocking constant here or calculating
         ...Array.from({ length: 12 }).reduce((acc: any, _, i) => { acc[`m${i+1}`] = 46; return acc }, {}),
         total: 46
       }
       
       const salaryBudgetRow = {
         id: rootId + '-budget',
         name: '总工薪(万)', // User asked for this exact text
         isSummary: true,
         ...monthlyTotals, // Assuming budget ~= salary for mock
         total: annualTotal
       }

       const salaryTotalRow = {
         id: rootId + '-salary',
         name: '总工资(万)',
         isSummary: true,
         ...monthlyTotals,
         total: annualTotal
       }

       return {
         id: rootId,
         name: node.dept,
         isPerson: false,
         isRoot: true, // Mark as root to disable checkbox
         children: [
           hcRow,
           salaryBudgetRow,
           salaryTotalRow,
           ...children
         ],
         // Root itself doesn't need data if it has summary rows, but table might display it
         ...monthlyTotals,
         total: annualTotal
       }
    }
  }

  return rawData.map(mapNode)
}

const tableData = ref(generateMockData())
const searchText = ref('')
const selectedRowKeys = ref<string[]>([])

// --- Computed & Logic ---
const filteredData = computed(() => {
  if (!searchText.value) return tableData.value
  const filter = (nodes: any[]): any[] => {
    return nodes.reduce((acc, node) => {
      if (node.name.includes(searchText.value) || (node.detail && node.detail.project.includes(searchText.value))) {
        acc.push(node)
      } else if (node.children) {
        const filteredChildren = filter(node.children)
        if (filteredChildren.length > 0) {
          acc.push({ ...node, children: filteredChildren })
        }
      }
      return acc
    }, [])
  }
  return filter(tableData.value)
})

const allSelected = computed(() => {
  return selectedRowKeys.value.length > 0
})

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedRowKeys.value = []
  } else {
    const collectIds = (nodes: any[]) => {
      nodes.forEach(node => {
        if (node.isPerson) selectedRowKeys.value.push(node.id)
        if (node.children) collectIds(node.children)
      })
    }
    collectIds(filteredData.value)
  }
}

const onSelectChange = (keys: string[]) => {
  selectedRowKeys.value = keys
}

// Disable checkbox for department nodes and summary nodes and root
const getCheckboxProps = (record: any) => {
  const showCheckbox = record.isPerson
  return {
    disabled: !showCheckbox,
    style: { display: showCheckbox ? 'inline-block' : 'none' }
  }
}

const onSearch = () => {
  // Triggered by input
}

const formatNumber = (val: string | number) => {
  if (!val || val === '0.0' || val === 0) return '-'
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

// --- Columns Definition ---
const months = Array.from({ length: 12 }, (_, i) => `${i + 1}月`)
const monthCols = months.map((m, i) => ({
  title: m,
  dataIndex: `m${i + 1}`,
  key: 'month',
  width: 80,
  align: 'right'
}))

const columns = [
  {
    title: '星云工作室', // Fixed title per requirement 5
    dataIndex: 'name',
    key: 'name',
    width: 280,
    fixed: 'left',
    align: 'center' // Centered title per requirement 5
  },
  // Requirement 4: Removed "工资(万)" column
  {
    title: '2026',
    key: 'year',
    children: [
      ...monthCols,
      {
        title: '全年',
        dataIndex: 'total',
        key: 'total',
        width: 100,
        align: 'right',
        fixed: 'right'
      }
    ]
  }
]

const getPopupContainer = (triggerNode: HTMLElement) => {
  return document.body
}
</script>

<style scoped>
.before-application-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.left-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title {
  font-weight: 700;
  font-size: 16px;
  color: #1f1f1f;
}

.table-container {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* Custom Styles */
.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  /* Ensure content aligns well, though column is center aligned for header, body might be left */
  justify-content: flex-start; 
  padding-left: 8px;
}

/* Specific styling for Root Node (星云工作室) if it appears in body */
/* But since it's a tree, the first column contains the tree structure. */
/* The requirement 5 says "取消原有'姓名/部门'复合字段，仅保留... '星云工作室'" - this refers to HEADER */
/* Requirement 6: Remove "星云工作室" row's checkbox (Handled by getCheckboxProps) */

.summary-label {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.88);
}

.tag-badge {
  font-size: 12px;
  padding: 0 4px;
  border-radius: 2px;
  border: 1px solid;
  white-space: nowrap;
}

.tag-regular {
  background: #e6f7ff;
  color: #1890ff;
  border-color: #91d5ff;
}

.tag-intern {
  background: #f6ffed;
  color: #52c41a;
  border-color: #b7eb8f;
}

.name-text {
  cursor: pointer;
  color: #1f1f1f;
}

.name-text:hover {
  color: #1890ff;
  text-decoration: underline;
}

.number-cell {
  font-family: monospace;
}

/* Deep overrides for Table */
:deep(.ant-table-wrapper) {
  height: 100%;
}

:deep(.ant-table-container) {
  height: 100%;
}

:deep(.ant-table-body) {
  scrollbar-width: thin;
}

:deep(.ant-table-cell) {
  white-space: nowrap;
}

/* Align header text center for the first column */
:deep(.ant-table-thead > tr > th:first-child) {
  text-align: center !important;
}
</style>

<style>
/* Global styles for Popover */
.employee-popover .ant-popover-inner-content {
  padding: 0;
}

.popover-content {
  width: 240px;
}

.popover-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.p-name {
  font-weight: 600;
  font-size: 16px;
}

.p-dept-tag {
  background: #003a8c;
  color: #fff;
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 2px;
}

.popover-body {
  padding: 12px 16px;
}

.p-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}

.p-row:last-child {
  margin-bottom: 0;
}

.p-row .label {
  color: #8c8c8c;
}

.p-row .val {
  color: #262626;
  font-weight: 500;
}
</style>