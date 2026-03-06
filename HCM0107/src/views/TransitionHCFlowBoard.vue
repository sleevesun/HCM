<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const steps = [
  {
    order: 1,
    name: '过渡期HC申请信息填写',
    description: '填写被替换人员、日期、原因并提交申请',
    path: '/transition-hc-apply'
  },
  {
    order: 2,
    name: '审批中心待办事项',
    description: '进入审批中心查看待审批过渡期HC任务',
    path: '/approval-center'
  },
  {
    order: 3,
    name: '过渡期HC审批详情',
    description: '审核申请明细并执行通过或驳回操作',
    path: '/transition-hc-approval'
  },
  {
    order: 4,
    name: '工薪预算驾驶舱',
    description: '查看预算编制（过渡期HC）数据落地结果',
    path: '/budget-adjust-transition-hc'
  }
]

const openStep = (step: (typeof steps)[number]) => {
  router.push({
    path: step.path,
    query: {
      flowSource: 'transition_hc_flow_board',
      step: String(step.order)
    }
  })
}
</script>

<template>
  <main class="flow-board-page">
    <header class="flow-board-header">
      <h1>过渡期HC申请流程白板</h1>
      <p>点击任一步骤可进入对应系统页面，所有页面右下角均支持一键返回流程白板。</p>
    </header>
    <section class="flow-timeline" aria-label="过渡期HC流程">
      <button
        v-for="step in steps"
        :key="step.order"
        class="flow-step-card"
        @click="openStep(step)"
      >
        <span class="step-index">步骤 {{ step.order }}</span>
        <span class="step-name">{{ step.name }}</span>
        <span class="step-desc">{{ step.description }}</span>
      </button>
    </section>
  </main>
</template>

<style scoped>
.flow-board-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f6f9ff 0%, #eef4ff 100%);
  padding: 24px;
  box-sizing: border-box;
}

.flow-board-header {
  max-width: 960px;
  margin: 0 auto 20px;
}

.flow-board-header h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.3;
  color: #102a56;
}

.flow-board-header p {
  margin: 10px 0 0;
  color: #4a5a75;
  font-size: 14px;
  line-height: 22px;
}

.flow-timeline {
  max-width: 960px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.flow-step-card {
  position: relative;
  border: 1px solid #d7e3ff;
  border-radius: 14px;
  background: #fff;
  padding: 18px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.flow-step-card:hover {
  transform: translateY(-3px);
  border-color: #9fc0ff;
  box-shadow: 0 12px 24px rgba(22, 119, 255, 0.14);
}

.flow-step-card:active {
  transform: scale(0.98);
}

.step-index {
  width: fit-content;
  padding: 3px 10px;
  border-radius: 999px;
  background: #eaf2ff;
  color: #1f64d8;
  font-size: 12px;
  font-weight: 600;
}

.step-name {
  color: #0f2451;
  font-size: 18px;
  font-weight: 700;
  line-height: 26px;
}

.step-desc {
  color: #5c6d87;
  font-size: 13px;
  line-height: 21px;
}

@media (max-width: 900px) {
  .flow-timeline {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .flow-board-page {
    padding: 14px;
  }

  .flow-board-header h1 {
    font-size: 22px;
  }

  .flow-step-card {
    padding: 14px;
  }
}
</style>
