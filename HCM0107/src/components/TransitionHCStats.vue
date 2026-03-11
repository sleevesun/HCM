<template>
  <transition name="fade">
    <div v-if="visible" class="transition-hc-hint" :class="{ 'has-error': exceeded }" aria-label="过渡期HC统计">
      <template v-if="loading">
        <span class="text-default">计算中...</span>
      </template>
      <template v-else-if="error">
        <span class="text-error">{{ error }}</span>
        <button class="retry-btn" type="button" @click="$emit('retry')">重试</button>
      </template>
      <template v-else>
        <span class="text-default">当前部门可申请过渡期HC为 </span>
        <span class="text-emphasis">{{ b }}</span>
        <span class="text-default"> 个，当前已生效数量为 </span>
        <span class="text-emphasis">{{ y }}</span>
        <span class="text-default"> 个。</span>
      </template>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  b: number // X
  y: number // Y
  exceeded?: boolean
  loading?: boolean
  error?: string
  visible: boolean
}>()

defineEmits<{
  (e: 'retry'): void
}>()
</script>

<style scoped>
.transition-hc-hint {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 4px;
  background: #f6fbff;
  border: 1px solid #e6f4ff;
  font-size: 13px;
  line-height: 20px;
  white-space: nowrap;
}

.transition-hc-hint.has-error {
  background: #fff2f0;
  border-color: #ffccc7;
}

.text-default {
  color: #666;
}

.text-emphasis {
  color: #1677ff;
  font-weight: 600;
  margin: 0 2px;
}

.has-error .text-emphasis {
  color: #ff4d4f;
}

.text-error {
  color: #ff4d4f;
}

.retry-btn {
  margin-left: 8px;
  border: none;
  background: transparent;
  color: #1677ff;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

/* 200ms fade animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
