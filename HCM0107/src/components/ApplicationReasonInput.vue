<template>
  <section class="reason-section" aria-label="申请原因说明">
    <div class="reason-title">
      <span>申请原因说明</span>
      <span class="required-star">*</span>
    </div>
    <a-textarea
      :value="modelValue"
      :maxlength="maxLength"
      :auto-size="{ minRows: 4, maxRows: 10 }"
      placeholder="请简要描述新增原因"
      class="reason-textarea"
      @update:value="handleChange"
    />
    <div class="reason-footer">
      <span v-if="error" class="reason-error">{{ error }}</span>
      <span v-else class="reason-hint">不少于{{ minLength }}个字符，不超过{{ maxLength }}个字符</span>
      <span class="reason-count">{{ currentLength }}/{{ maxLength }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: string
  error?: string
  minLength?: number
  maxLength?: number
}>(), {
  error: '',
  minLength: 10,
  maxLength: 500
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const currentLength = computed(() => props.modelValue.length)

const handleChange = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.reason-section {
  margin-top: 12px;
  padding: 12px 16px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  background: #fff;
}

.reason-title {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1f1f1f;
}

.required-star {
  color: #ff4d4f;
}

.reason-textarea :deep(textarea) {
  border-radius: 8px;
  border-color: #d9d9d9;
  font-size: 14px;
  line-height: 22px;
}

.reason-textarea :deep(textarea:focus) {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.15);
}

.reason-footer {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
}

.reason-hint {
  color: #86909c;
}

.reason-error {
  color: #e02020;
}

.reason-count {
  color: #4e5969;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .reason-section {
    padding: 10px 12px;
  }

  .reason-footer {
    flex-wrap: wrap;
    align-items: flex-start;
  }
}
</style>
