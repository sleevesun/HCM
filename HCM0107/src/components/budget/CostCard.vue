<template>
  <div class="cost-card">
    <div class="cost-title">{{ title }}</div>
    <div class="cost-value" :style="{ color: color }">
      <span class="num">{{ formatNumber(value) }}</span>
      <span class="unit" v-if="unit">{{ unit }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: number
  unit?: string
  color?: string
}>()

const formatNumber = (num: number) => {
  if (num === undefined || num === null) return '0.0'
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}
</script>

<style scoped>
.cost-card {
  padding: 12px;
  background: #F7F8FA;
  border-radius: 4px;
}
.cost-title {
  font-size: 12px;
  color: #86909C;
  margin-bottom: 8px;
}
.cost-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.num {
  font-size: 18px;
  font-weight: 700;
}
.unit {
  font-size: 12px;
}
</style>
