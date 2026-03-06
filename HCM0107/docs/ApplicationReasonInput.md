# ApplicationReasonInput 组件文档

## 组件用途
用于“过渡期HC申请”页面中的“申请原因说明”录入区域，提供必填标识、字符计数、错误提示与自适应文本框能力。

## 使用示例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import ApplicationReasonInput from '../components/ApplicationReasonInput.vue'

const reason = ref('')
const reasonError = ref('')
</script>

<template>
  <ApplicationReasonInput
    v-model="reason"
    :error="reasonError"
    :min-length="10"
    :max-length="500"
  />
</template>
```

## API

### Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | string | - | 输入内容，支持 `v-model` |
| error | string | `''` | 校验错误文案 |
| minLength | number | `10` | 最小字符限制提示值 |
| maxLength | number | `500` | 最大字符限制与计数上限 |

### Emits

| 事件名 | 参数 | 说明 |
| --- | --- | --- |
| update:modelValue | `(value: string)` | 输入变化时触发 |

## 交互说明
- 输入框为多行文本并开启高度自适应（`minRows=4`，`maxRows=10`）。
- 默认占位为“请简要描述新增原因”。
- 底部右侧显示实时字符计数，左侧展示错误提示或限制说明。
