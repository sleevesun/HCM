<template>
  <a-layout class="layout-container">
    <a-layout-header v-if="!isMobileApprovalRoute" class="header">
      <div class="header-left">
        <div class="logo">
          <appstore-outlined style="font-size: 20px; margin-right: 8px;" />
          <span class="title">HCM</span>
        </div>
        <a-menu
          v-model:selectedKeys="currentMenu"
          mode="horizontal"
          theme="dark"
          class="nav-menu"
          triggerSubMenuAction="click"
          @click="handleMenuClick"
        >
          <a-menu-item key="1"><deployment-unit-outlined /> 组织树</a-menu-item>
          <a-menu-item key="2"><bar-chart-outlined /> 报表中心</a-menu-item>
          <a-sub-menu key="3">
            <template #title><file-text-outlined /> 编制管理</template>
            <a-menu-item key="3-1">审批中心</a-menu-item>
            <a-menu-item key="3-2">工薪预算驾驶舱</a-menu-item>
            <a-menu-item key="3-3">预算划转</a-menu-item>
            <a-menu-item key="3-4" v-if="userStore.hasPermission('finance')">预算调整</a-menu-item>
            <a-menu-item key="3-5" v-if="userStore.hasPermission('finance')">预算编制/调整</a-menu-item>
            <a-menu-item key="3-6" v-if="userStore.hasPermission('finance')">过渡期HC申请</a-menu-item>
            <a-menu-item key="3-7" v-if="userStore.hasPermission('finance')">过渡期HC审批</a-menu-item>
            <a-menu-item key="3-8" v-if="userStore.hasPermission('finance')">预算编制（过渡期HC）</a-menu-item>
          </a-sub-menu>
        </a-menu>
      </div>
      <div class="header-right">
        <div class="user-profile">
          <a-avatar :size="24" style="background-color: #C9CDD4; margin-right: 8px;">
            <template #icon><user-outlined /></template>
          </a-avatar>
          <span>用户</span>
        </div>
        <a-button type="text" size="small" class="switch-version">
          <template #icon><history-outlined /></template>
          切换旧版
        </a-button>
      </div>
    </a-layout-header>
    <a-layout-content :class="isMobileApprovalRoute ? 'main-content mobile-route' : 'main-content'">
      <div :class="isMobileApprovalRoute ? 'content-card mobile-route' : 'content-card'">
        <router-view></router-view>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  AppstoreOutlined,
  DeploymentUnitOutlined,
  BarChartOutlined,
  FileTextOutlined,
  UserOutlined,
  HistoryOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const currentMenu = ref<string[]>(['3-2'])
const isMobileApprovalRoute = ref(false)

const handleMenuClick = ({ key }: { key: string }) => {
  if (key === '3-1') {
    router.push('/approval-center')
  } else if (key === '3-2') {
    router.push('/salary-budget')
  } else if (key === '3-3') {
    router.push('/budget-transfer')
  } else if (key === '3-4') {
    router.push('/budget-adjust')
  } else if (key === '3-5') {
    router.push('/budget-planning')
  } else if (key === '3-6') {
    router.push('/transition-hc-apply')
  } else if (key === '3-7') {
    router.push('/transition-hc-approval')
  } else if (key === '3-8') {
    router.push('/budget-adjust-transition-hc')
  }
}

watch(
  () => route.path,
  (path) => {
    isMobileApprovalRoute.value = path.includes('/transition-hc-approval-mobile')
    if (path.includes('approval-center')) {
      currentMenu.value = ['3-1']
    } else if (path.includes('salary-budget')) {
      currentMenu.value = ['3-2']
    } else if (path.includes('budget-transfer')) {
      currentMenu.value = ['3-3']
    } else if (path.includes('budget-adjust')) {
      currentMenu.value = ['3-4']
    } else if (path.includes('budget-planning')) {
      currentMenu.value = ['3-5']
    } else if (path.includes('transition-hc-apply')) {
      currentMenu.value = ['3-6']
    } else if (path.includes('transition-hc-approval')) {
      currentMenu.value = ['3-7']
    } else if (path.includes('budget-adjust-transition-hc')) {
      currentMenu.value = ['3-8']
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  background-color: #f0f2f5;
}

.header {
  height: 56px;
  line-height: 56px;
  background-color: #001529;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  height: 100%;
}

.logo {
  font-size: 20px;
  margin-right: 40px;
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #fff;
}

.nav-menu {
  line-height: 56px;
  border-bottom: none;
  min-width: 400px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-profile {
  display: flex;
  align-items: center;
  margin-right: 24px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.85);
}

.switch-version {
  color: rgba(255, 255, 255, 0.65);
}
.switch-version:hover {
  color: #fff;
}

.main-content {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.content-card {
  background-color: #fff;
  border-radius: 4px;
  padding: 24px;
  min-height: calc(100vh - 56px - 48px);
}

.main-content.mobile-route {
  padding: 0;
  max-width: none;
}

.content-card.mobile-route {
  border-radius: 0;
  padding: 0;
  min-height: 100vh;
}
</style>
