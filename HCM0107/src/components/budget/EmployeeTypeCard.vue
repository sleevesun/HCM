<template>
  <div class="employee-card" :style="{ '--card-color': type.color }">
    <div class="card-icon">{{ type.icon }}</div>
    <div class="card-title">{{ type.name }}</div>
    <div class="card-divider"></div>
    <div class="card-data">
      <div class="data-row">
        <span class="data-label">当前</span>
        <span class="data-value">{{ current }}</span>
      </div>
      <div class="data-row">
        <span class="data-label">目标</span>
        <span class="data-value">{{ target }}</span>
      </div>
    </div>
    <div class="card-footer">
      <MiniTrend :current="current" :target="target" />
      <span class="card-change" :class="changeClass">
        {{ changeText }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MiniTrend from './MiniTrend.vue'

const props = defineProps<{
  type: any
  current: number
  target: number
}>()

const change = computed(() => props.target - props.current)
const changePercent = computed(() => {
  if (props.current === 0) return props.target > 0 ? '100.0' : '0.0'
  return ((change.value / props.current) * 100).toFixed(1)
})

const changeText = computed(() => {
  const sign = change.value > 0 ? '+' : ''
  return `${sign}${change.value} (${sign}${changePercent.value}%)`
})

const changeClass = computed(() => {
  if (change.value === 0) return 'change-none'
  return change.value > 0 ? 'change-up' : 'change-down'
})
</script>

<style scoped>
.employee-card {
  background: #fff;
  border: 1px solid #E5E6EB;
  border-radius: 6px;
  padding: 12px;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.employee-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--card-color);
}

.employee-card:hover {
  border-color: var(--card-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 20px;
  text-align: center;
  margin-bottom: 4px;
}

.card-title {
  font-size: 12px;
  font-weight: 600;
  color: #4E5969;
  text-align: center;
  margin-bottom: 8px;
}

.card-divider {
  height: 1px;
  background: #F2F3F5;
  margin-bottom: 8px;
}

.card-data {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.data-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.data-label {
  color: #86909C;
}

.data-value {
  font-weight: 600;
  color: #1D2129;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #E5E6EB;
}

.card-change {
  font-size: 11px;
  font-weight: 600;
}

.card-change.change-up {
  color: #F53F3F;
}

.card-change.change-down {
  color: #00B42A;
}

.card-change.change-none {
  color: #86909c;
}
</style>
