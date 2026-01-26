<template>
  <a-layout class="layout-container">
    <!-- Header -->
    <a-layout-header class="header">
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

    <!-- Main Content -->
    <a-layout-content class="main-content">
      <div class="content-card">
        <router-view></router-view>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  AppstoreOutlined,
  DeploymentUnitOutlined,
  BarChartOutlined,
  FileTextOutlined,
  UserOutlined,
  HistoryOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const currentMenu = ref<string[]>(['3-1'])

const handleMenuClick = ({ key }: { key: string }) => {
  if (key === '3-1') {
    router.push('/approval-center')
  } else if (key === '3-2') {
    router.push('/salary-budget')
  } else if (key === '3-3') {
    router.push('/budget-transfer')
  }
}

// Sync menu with route
watch(
  () => route.path,
  (path) => {
    if (path.includes('approval-center')) {
      currentMenu.value = ['3-1']
    } else if (path.includes('salary-budget')) {
      currentMenu.value = ['3-2']
    } else if (path.includes('budget-transfer')) {
      currentMenu.value = ['3-3']
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
</style>
