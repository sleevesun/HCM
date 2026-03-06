<template>
  <div class="budget-planning-root">
    <!-- 3.1 顶部标题栏 -->
    <header class="page-header">
      <h1>2026年预算调整</h1>
    </header>

    <!-- 3.2 主体区域 -->
    <main class="main-content">
      <!-- 区块 1: 调整汇总 -->
      <section class="content-card" data-testid="adjust-summary">
        <h2>调整汇总</h2>
        <div class="card-body">
          <a-table
            :dataSource="summaryData"
            :columns="summaryColumns"
            :pagination="false"
            size="small"
            bordered
            rowKey="id"
            :scroll="{ x: 'max-content', y: 400 }"
            :expandIconColumnIndex="0"
          >
            <!-- Custom Cell for Diff Columns -->
            <template #bodyCell="{ column, text }">
              <template v-if="['hc.diff.regular', 'hc.diff.other', 'monthly_budget.diff', 'annual_budget.diff'].includes(column.dataIndex)">
                <span :class="getDiffClass(text)">{{ formatDiff(text) }}</span>
              </template>
            </template>
          </a-table>
        </div>
      </section>

      <!-- 区块 2: 申请前明细 -->
      <section class="content-card fixed-height-section" data-testid="before-apply">
        <h2>申请前明细</h2>
        <div class="card-body">
          <BeforeApplicationDetail />
        </div>
      </section>

      <!-- 按钮操作区域 -->
      <div class="middle-actions">
        <div class="left-btn-group">
          <a-button>
            <template #icon><download-outlined /></template>
            下载模板
          </a-button>
          <a-button>
            <template #icon><import-outlined /></template>
            项目标签导入
          </a-button>
        </div>
        <div class="right-btn-group">
          <a-button>不变</a-button>
          <a-button>过渡期HC</a-button>
          <a-button>HC增减</a-button>
          <CombinedActionButton />
        </div>
      </div>

      <!-- 区块 3: 申请通过后明细 -->
      <section class="content-card fixed-height-section" data-testid="after-approve">
        <h2>申请通过后明细</h2>
        <div class="card-body">
          <AfterApplicationDetail />
        </div>
      </section>
    </main>

    <!-- 4. 底部操作栏 -->
    <footer class="page-footer">
      <div class="footer-actions">
        <button 
          class="btn btn-secondary" 
          aria-label="返回" 
          role="button"
          @click="handleBack"
        >
          返回
        </button>
        <button 
          class="btn btn-primary" 
          aria-label="创建审批单据" 
          role="button"
          @click="handleCreate"
        >
          创建审批单据
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BeforeApplicationDetail from '../components/BeforeApplicationDetail.vue'
import AfterApplicationDetail from '../components/AfterApplicationDetail.vue'
import CombinedActionButton from '../components/CombinedActionButton.vue'
import {
  DownloadOutlined,
  ImportOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

const handleBack = () => {
  router.back()
}

const handleCreate = () => {
  console.log('创建审批单据')
  // Logic to create approval document
}

// --- Mock Data ---
const summaryData = ref([
  {
    id: "1",
    department_name: "游戏工作室群/星云工作室",
    hc: {
      pre: { regular: 45, other: 1 },
      post: { regular: 46, other: 1 },
      diff: { regular: 1, other: 0 }
    },
    monthly_budget: {
      pre: 380.9,
      post: 388.7,
      diff: 7.8
    },
    annual_budget: {
      pre: 4562.1,
      post: 4655.3,
      diff: 93.2
    },
    children: [
      {
        id: "1-1",
        department_name: "运营部",
        hc: {
          pre: { regular: 9, other: 0 },
          post: { regular: 9, other: 0 },
          diff: { regular: 0, other: 0 }
        },
        monthly_budget: {
          pre: 52.6,
          post: 52.6,
          diff: 0
        },
        annual_budget: {
          pre: 630.1,
          post: 630.1,
          diff: 0
        }
      },
      {
        id: "1-2",
        department_name: "测试部",
        hc: {
          pre: { regular: 5, other: 0 },
          post: { regular: 5, other: 0 },
          diff: { regular: 0, other: 0 }
        },
        monthly_budget: {
          pre: 22.2,
          post: 22.2,
          diff: 0
        },
        annual_budget: {
          pre: 265.5,
          post: 265.5,
          diff: 0
        }
      },
      {
        id: "1-3",
        department_name: "策划部",
        hc: {
          pre: { regular: 9, other: 0 },
          post: { regular: 10, other: 0 },
          diff: { regular: 1, other: 0 }
        },
        monthly_budget: {
          pre: 69.3,
          post: 77.1,
          diff: 7.8
        },
        annual_budget: {
          pre: 829.8,
          post: 923.0,
          diff: 93.2
        }
      },
      {
        id: "1-4",
        department_name: "客户端",
        hc: {
          pre: { regular: 4, other: 0 },
          post: { regular: 4, other: 0 },
          diff: { regular: 0, other: 0 }
        },
        monthly_budget: {
          pre: 32.0,
          post: 32.0,
          diff: 0
        },
        annual_budget: {
          pre: 383.7,
          post: 383.7,
          diff: 0
        }
      }
    ]
  }
])

const summaryColumns = [
  {
    title: '申请部门',
    dataIndex: 'department_name',
    key: 'department_name',
    width: 250,
    fixed: 'left'
  },
  {
    title: 'HC',
    children: [
      {
        title: '申请前',
        children: [
          { title: '正编', dataIndex: ['hc', 'pre', 'regular'], width: 80, align: 'right' },
          { title: '其他人员', dataIndex: ['hc', 'pre', 'other'], width: 80, align: 'right' }
        ]
      },
      {
        title: '申请通过后',
        children: [
          { title: '正编', dataIndex: ['hc', 'post', 'regular'], width: 80, align: 'right' },
          { title: '其他人员', dataIndex: ['hc', 'post', 'other'], width: 80, align: 'right' }
        ]
      },
      {
        title: '变化',
        children: [
          { title: '正编', dataIndex: ['hc', 'diff', 'regular'], width: 80, align: 'right', customRender: ({ text }: any) => formatDiff(text) },
          { title: '其他人员', dataIndex: ['hc', 'diff', 'other'], width: 80, align: 'right', customRender: ({ text }: any) => formatDiff(text) }
        ]
      }
    ]
  },
  {
    title: '月度工薪预算 (万)',
    children: [
      { title: '申请前', dataIndex: ['monthly_budget', 'pre'], width: 100, align: 'right' },
      { title: '申请通过后', dataIndex: ['monthly_budget', 'post'], width: 100, align: 'right' },
      { title: '变化', dataIndex: ['monthly_budget', 'diff'], width: 100, align: 'right', customRender: ({ text }: any) => formatDiff(text) }
    ]
  },
  {
    title: '年度工薪预算 (万)',
    children: [
      { title: '申请前', dataIndex: ['annual_budget', 'pre'], width: 120, align: 'right' },
      { title: '申请通过后', dataIndex: ['annual_budget', 'post'], width: 120, align: 'right' },
      { title: '变化', dataIndex: ['annual_budget', 'diff'], width: 120, align: 'right', customRender: ({ text }: any) => formatDiff(text) }
    ]
  }
]

const formatDiff = (val: number) => {
  if (val > 0) return `+${val}`
  return val
}

const getDiffClass = (val: number) => {
  if (val > 0) return 'text-red'
  return ''
}
</script>

<style scoped>
/* 5. 全局样式要求: 页面根元素设置 background-color: #F5F5F7 */
.budget-planning-root {
  background-color: #F5F5F7;
  min-height: 100vh;
  /* Ensure it sits on top if needed, or flows correctly */
  position: relative;
  /* Reset box sizing */
  box-sizing: border-box;
}

/* 3.1 顶部标题栏 */
.page-header {
  height: 56px;
  background-color: #FFFFFF;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  /* Fixed positioning relative to the viewport or container? User said "Fixed height", not "Fixed position" for header.
     But Footer says "Fixed position". 
     Usually "Top title bar" implies fixed or at top. 
     Given the main height calc(100vh - 56px - 68px), it implies the header takes space in flow or is fixed with padding.
     If main has that min-height, and header/footer are fixed, then main needs padding.
     Let's assume Header is in normal flow but Footer is fixed as requested.
  */
  position: relative; 
  z-index: 10;
}

.page-header h1 {
  font-size: 18px;
  font-weight: 600;
  color: #1F1F1F;
  margin: 0;
}

/* 3.2 主体区域 */
.main-content {
  min-height: calc(100vh - 56px - 68px);
  background-color: #F5F5F7;
  padding: 16px;
  padding-bottom: 84px; /* Space for fixed footer (68px + 16px) */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 区块容器 */
.content-card {
  background-color: #FFFFFF;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  /* 5. 全局样式要求: 忽略斜向半透明水印文字 - No watermark styles added */
}

.content-card h2 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px; /* Default h2 size or custom? User didn't specify h2 size, assume standard readable */
  font-weight: 500;
  color: #1F1F1F;
}

.fixed-height-section {
  height: 600px;
  display: flex;
  flex-direction: column;
}

.fixed-height-section .card-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* Middle Action Bar */
.middle-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px; /* Slight padding to align visually */
}

.left-btn-group,
.right-btn-group {
  display: flex;
  gap: 12px;
}

/* 4. 底部操作栏 */
.page-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 68px;
  background-color: #FFFFFF;
  border-top: 1px solid #E5E5E5;
  display: flex;
  align-items: center;
  justify-content: flex-end; /* Right aligned */
  padding: 0 24px;
  z-index: 100;
}

.footer-actions {
  display: flex;
  gap: 16px;
}

/* Buttons */
.btn {
  border-radius: 4px; /* Standard radius */
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-secondary {
  width: 88px;
  height: 40px;
  background-color: #FFFFFF;
  border: 1px solid #1890FF;
  color: #1890FF;
}

.btn-secondary:hover {
  background-color: #e6f7ff;
}

.btn-primary {
  width: 160px;
  height: 40px;
  background-color: #1890FF;
  border: 1px solid #1890FF;
  color: #FFFFFF;
}

.btn-primary:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

/* 5. 响应式断点: ≤768 px */
@media (max-width: 768px) {
  .main-content {
    padding: 12px; /* 卡片外边距调整为 12 px (padding on container creates margin effect) */
    padding-bottom: 80px;
  }
  
  .content-card {
    margin-bottom: 12px; /* Or use gap in flex container */
  }

  .footer-actions {
    width: 100%;
    gap: 12px;
  }

  .btn {
    width: 50% !important; /* 按钮宽度自适应为 50% */
  }

  /* Middle actions responsive */
  .middle-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .left-btn-group,
  .right-btn-group {
    width: 100%;
    flex-wrap: wrap;
  }

  .right-btn-group {
    justify-content: flex-end;
  }
}

.text-red {
  color: #ff4d4f;
  font-weight: 500;
}

:deep(.ant-table-thead > tr > th) {
  text-align: center;
  font-weight: 500;
  background-color: #fafafa;
  padding: 8px !important; /* Dense header */
}

:deep(.ant-table-tbody > tr > td) {
  padding: 8px !important; /* Dense cell */
}
</style>
