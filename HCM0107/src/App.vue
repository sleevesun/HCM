<template>
  <a-config-provider :locale="zhCN">
    <Dashboard />
  </a-config-provider>
</template>

<script setup lang="ts">
import Dashboard from './views/Dashboard.vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  background-color: var(--color-bg-1);
  color: var(--color-text-1);
}
</style>
