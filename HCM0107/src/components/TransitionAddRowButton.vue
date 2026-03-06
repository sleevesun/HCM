<template>
  <div class="transition-add-row">
    <a-button
      type="primary"
      :disabled="disabled"
      :loading="loading"
      class="transition-add-row-btn"
      @click="$emit('add')"
      @keydown.enter.prevent="$emit('add')"
    >
      <template #icon>
        <PlusOutlined />
      </template>
      添加行信息
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { PlusOutlined } from '@ant-design/icons-vue'

defineProps<{
  disabled?: boolean
  loading?: boolean
}>()

defineEmits<{
  (e: 'add'): void
}>()
</script>

<style scoped>
.transition-add-row {
  display: flex;
  justify-content: flex-end;
}

.transition-add-row-btn {
  min-width: 124px;
}
</style>
