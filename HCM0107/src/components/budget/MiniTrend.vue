<template>
  <div class="mini-trend">
    <svg width="40" height="20" viewBox="0 0 40 20">
      <path :d="pathData" :stroke="color" stroke-width="2" fill="none" class="trend-line" />
      <polygon :points="arrow" :fill="color" />
    </svg>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  current: number
  target: number
}>()

const isUp = computed(() => props.target >= props.current)
const color = computed(() => isUp.value ? '#F53F3F' : '#00B42A')

const pathData = computed(() => {
  return isUp.value ? 'M 0 16 Q 15 16 30 6' : 'M 0 4 Q 15 4 30 14'
})

const arrow = computed(() => {
  return isUp.value ? '30,0 26,10 34,10' : '30,20 26,10 34,10'
})
</script>
<style scoped>
.mini-trend {
  display: inline-flex;
  align-items: center;
}
.trend-line {
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
