<template>
  <section class="transition-hc-stats" aria-label="过渡期HC统计">
    <div class="stats-main">
      <template v-if="loading">
        <div class="stats-line">计算中...</div>
      </template>
      <template v-else-if="error">
        <div class="stats-line">
          <span class="text-default">计算中...</span>
          <button class="retry-btn" type="button" @click="$emit('retry')">重试</button>
        </div>
        <div class="stats-line">
          <span class="text-error">{{ error }}</span>
        </div>
      </template>
      <template v-else>
        <div class="stats-line">
          <span class="text-default">本次申请过渡期HC </span>
          <span class="text-emphasis">{{ a }}</span>
          <span class="text-default"> 个</span>
        </div>
        <div class="stats-line">
          <span class="text-default">提示：当前部门可申请过渡期HC为 </span>
          <span class="text-emphasis">{{ b }}</span>
          <span class="text-default"> 个，当前已申请数量为 </span>
          <span class="text-emphasis">{{ y }}</span>
          <span class="text-default"> 个</span>
          <span v-if="exceeded" class="text-warning">，无法提交本次申请</span>
          <span v-else class="text-default">。</span>
        </div>
      </template>
    </div>
    <div class="stats-action">
      <slot name="action" />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  a: number
  b: number
  y: number
  exceeded: boolean
  loading?: boolean
  error?: string
}>()

defineEmits<{
  (e: 'retry'): void
}>()
</script>

<style scoped>
.transition-hc-stats {
  margin-bottom: 12px;
  padding: 12px 16px;
  border: 1px solid #e6f4ff;
  border-radius: 8px;
  background: #f6fbff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.stats-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.stats-line {
  font-size: 14px;
  line-height: 22px;
  color: #333;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.text-default {
  font-size: 14px;
  line-height: 22px;
  color: #333;
}

.text-emphasis {
  font-size: 14px;
  line-height: 22px;
  color: #e02020;
  font-weight: 700;
}

.text-warning {
  font-size: 14px;
  line-height: 22px;
  color: #e02020;
  font-weight: 700;
}

.text-error {
  font-size: 14px;
  line-height: 22px;
  color: #e02020;
  font-weight: 600;
}

.retry-btn {
  margin-left: 8px;
  border: none;
  background: transparent;
  color: #1677ff;
  font-size: 14px;
  line-height: 22px;
  cursor: pointer;
  padding: 0;
}

.stats-action {
  margin-left: auto;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .transition-hc-stats {
    padding: 10px 12px;
    align-items: flex-start;
  }

  .stats-action {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
