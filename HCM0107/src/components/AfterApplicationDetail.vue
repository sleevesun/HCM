<template>
  <div class="after-application-detail">
    <!-- 顶部操作区 -->
    <div class="operation-bar">
      <div class="left-actions">
        <span class="title">申请通过后</span>
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
          <!-- Name Column with Action Icons -->
          <template v-if="column.dataIndex === 'name'">
             <div class="name-cell">
               <!-- Action Icons -->
               <template v-if="record.isPerson">
                 <!-- For NEW HC: Edit and Delete -->
                 <template v-if="record.isNew">
                   <a-tooltip title="修改">
                     <span class="action-icon" @click.stop="handleEdit(record)">
                       <edit-outlined />
                     </span>
                   </a-tooltip>
                   <a-tooltip title="删除">
                     <a-popconfirm
                       title="确认删除该条记录吗？"
                       ok-text="确认"
                       cancel-text="取消"
                       @confirm="handleDelete(record)"
                     >
                       <span class="action-icon delete-icon" @click.stop>
                         <delete-outlined />
                       </span>
                     </a-popconfirm>
                   </a-tooltip>
                 </template>
                 <!-- For Standard HC: Only Edit -->
                 <template v-else>
                   <a-tooltip title="修改">
                     <span class="action-icon" @click.stop="handleEdit(record)">
                       <edit-outlined />
                     </span>
                   </a-tooltip>
                 </template>
               </template>

               <!-- Summary Labels -->
               <template v-if="record.isSummary">
                 <span class="summary-label">{{ record.name }}</span>
               </template>
               
               <!-- Employee Info -->
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

          <!-- Salary Columns (Read Only) -->
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
import { message } from 'ant-design-vue'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'

// --- Mock Data Construction ---
const generateMockData = () => {
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
       // Inject 2-3 NEW HC records
       const newCount = Math.floor(Math.random() * 2) + 2; // 2 or 3
       for (let i = 0; i < newCount; i++) {
         node.employees.push({
           name: 'NEW HC',
           type: '正编', // Inherit default
           salary: 0,
           isNew: true
         })
       }

       const children = node.employees.map((emp: any) => {
          const isNew = emp.isNew === true
          const id = isNew 
            ? `new_hc_${Date.now()}_${Math.floor(Math.random() * 10000)}` 
            : String(idCounter++)
          
          return {
            id,
            name: emp.name,
            type: emp.type,
            dept: node.dept,
            isPerson: true,
            isNew,
            detail: {
              project: isNew ? '待定' : '星云项目',
              location: '北京',
              joinDate: isNew ? '-' : '2020-01-01',
              group: '技术族',
              level: isNew ? 'TBD' : 'T3-1',
              salary: `${emp.salary}万`,
              company: 'AntGravity'
            },
            ...Array.from({ length: 12 }).reduce((acc: any, _, i) => {
               acc[`m${i+1}`] = emp.salary
               return acc
            }, {}) as any,
            total: (emp.salary * 12).toFixed(1)
          }
       })
       
       return {
         id: String(idCounter++),
         name: node.dept,
         isPerson: false,
         children,
         ...Array.from({ length: 12 }).reduce((acc: any, _, i) => {
             acc[`m${i+1}`] = children.reduce((sum: number, c: any) => sum + Number(c[`m${i+1}`]), 0).toFixed(1)
             return acc
          }, {}) as any,
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
       }, {}) as any
       const annualTotal = children.reduce((sum: number, c: any) => sum + Number(c.total), 0).toFixed(1)

       const rootId = String(idCounter++)
       
       // Mock Summary Rows
       const hcRow = {
         id: rootId + '-hc',
         name: 'HC',
         isSummary: true,
         ...Array.from({ length: 12 }).reduce((acc: any, _, i) => { acc[`m${i+1}`] = 46; return acc }, {}) as any,
         total: 46
       }
       
       const salaryBudgetRow = {
         id: rootId + '-budget',
         name: '总工薪(万)',
         isSummary: true,
         ...monthlyTotals,
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
         isRoot: true,
         children: [
           hcRow,
           salaryBudgetRow,
           salaryTotalRow,
           ...children
         ],
         ...monthlyTotals,
         total: annualTotal
       }
    }
  }

  return rawData.map(mapNode)
}

const tableData = ref(generateMockData())
const searchText = ref('')

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

const onSearch = () => {
  // Triggered by input
}

const formatNumber = (val: string | number) => {
  if (!val || val === '0.0' || val === 0) return '-'
  return Number(val).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

const handleEdit = (record: any) => {
  console.log('Edit record:', record)
  message.info(`编辑记录: ${record.name} (ID: ${record.id})`)
  // TODO: Implement actual edit logic or modal
}

const handleDelete = (record: any) => {
  console.log('Delete record:', record)
  // Remove from data source
  const removeNode = (nodes: any[], id: string): boolean => {
    const idx = nodes.findIndex(n => n.id === id)
    if (idx !== -1) {
      nodes.splice(idx, 1)
      return true
    }
    for (const node of nodes) {
      if (node.children) {
        if (removeNode(node.children, id)) return true
      }
    }
    return false
  }
  
  if (removeNode(tableData.value, record.id)) {
    message.success('记录已删除')
  } else {
    message.error('删除失败')
  }
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
    title: '星云工作室',
    dataIndex: 'name',
    key: 'name',
    width: 280,
    fixed: 'left',
    align: 'center'
  },
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

const getPopupContainer = (_triggerNode: HTMLElement) => {
  return document.body
}
</script>

<style scoped>
.after-application-detail {
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
  justify-content: flex-start; 
  padding-left: 8px;
}

.action-icon {
  cursor: pointer;
  color: #1890ff;
  font-size: 14px;
  transition: color 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.action-icon:hover {
  color: #40a9ff;
  background: rgba(0,0,0,0.04);
  border-radius: 4px;
}

.delete-icon {
  color: #ff4d4f;
  margin-left: 16px; 
}

.delete-icon:hover {
  color: #ff7875;
}

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
/* Reuse Popover Styles */
.employee-popover .ant-popover-inner-content {
  padding: 0;
}
</style>