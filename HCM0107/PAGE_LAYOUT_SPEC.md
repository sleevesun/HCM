# 页面布局详细说明文档

**页面名称**: 工薪预算驾驶舱 (Budget Adjustment Cockpit)  
**对应路由**: `/budget-adjust`  
**版本**: 1.0.0

---

## 1. 整体布局框架

### 1.1 视口策略
*   **布局模式**: 流式布局 (Fluid Layout)。
*   **策略**: 页面主体容器 `.cockpit-container` 宽度自适应父容器（通常是 `Layout.Content`），高度由内容撑开。
*   **最小宽度**: 兼容移动端视口 (min-width: 320px)，但在桌面端建议最小宽度 1024px 以保证表格展示效果。

### 1.2 栅格系统
*   **基础网格**: 8px (Ant Design Base Unit)。
*   **断点 (Breakpoints)**:
    *   `xs`: < 576px
    *   `sm`: ≥ 576px
    *   `md`: ≥ 768px
    *   `lg`: ≥ 992px
    *   `xl`: ≥ 1200px
    *   `xxl`: ≥ 1600px
*   **间距 Token**:
    *   组件间距: `24px` (垂直方向卡片间距)
    *   内部间距: `24px` (卡片内边距)
    *   小间距: `8px`, `12px`, `16px`

### 1.3 层叠上下文 (Z-Index)
遵循 Ant Design 默认层级管理：
*   **基础内容**: 0
*   **悬浮按钮/面板**: 100 (如项目标签面板)
*   **Modal 遮罩**: 1000
*   **Modal 弹窗**: 1000
*   **Dropdown/Tooltip**: 1050
*   **Message/Notification**: 1010+

---

## 2. 区域级组件拆解

### 2.1 页面头部 (Page Header)
*   **Class**: `.page-header`
*   **高度**: 内容自适应 (通常约 24px + margin)
*   **间距**: `margin-bottom: 20px`
*   **排版**: Flex 布局，左侧标题，图标间距 `8px`。
*   **样式**:
    *   字体大小: `16px`
    *   字重: `700` (Bold)
    *   颜色: `rgba(0, 0, 0, 0.85)`

### 2.2 主内容卡片 (Section Card)
*   **Class**: `.section-card`
*   **背景色**: `#ffffff`
*   **圆角**: `4px`
*   **内边距**: `24px` (特殊情况 `.no-padding` 为 0)
*   **外边距**: `24px` (bottom)
*   **阴影**: 无 (Flat 风格，依靠背景色差区分) 或微弱阴影 `0 1px 2px rgba(0, 0, 0, 0.05)`

### 2.3 复合操作按钮 (Combined Action Button)
*   **Class**: `.combined-btn-container`
*   **尺寸**: 高度 `32px`，宽度自适应内容。
*   **圆角**: `8px`
*   **边框**: `1px solid #d9d9d9` (Default), `#4096ff` (Hover)
*   **布局**: Flex 布局，中间包含 `1px` 宽度的 `.separator`。

### 2.4 模态框 (Modal)
*   **Class**: `.custom-modal`
*   **宽度**: `1400px` (超大号)
*   **Body Padding**: `0` (为了全宽表格)
*   **Header**: 自定义头部 `.modal-header`，包含筛选器和操作区。

---

## 3. 原子级样式规范

### 3.1 颜色系统

| 语义 | 变量名 | 色值 | 说明 |
| :--- | :--- | :--- | :--- |
| **主色** | `--color-primary` | `#4096ff` | Ant Design Blue-6 |
| **主色(Hover)** | `--color-primary-hover` | `rgba(5, 145, 255, 0.1)` | 按钮悬停背景 |
| **边框色** | `--color-border` | `#d9d9d9` | 默认边框 |
| **二级边框** | `--color-border-secondary` | `#f0f0f0` | 分割线、浅色边框 |
| **主要文本** | `--color-text` | `rgba(0, 0, 0, 0.88)` | 标题、正文 |
| **次要文本** | `--color-text-secondary` | `rgba(0, 0, 0, 0.45)` | 说明、标签 |
| **成功色** | `--color-success` | `#52c41a` | 正向变化 |
| **错误色** | `--color-error` | `#ff4d4f` | 负向变化 |
| **警告色** | `--color-warning` | `#fa8c16` | 状态提示 |
| **背景色(Table Header)** | `--bg-gray-light` | `#fafafa` | 灰色表头 |
| **背景色(Table Header Blue)** | `--bg-blue-light` | `#e6f7ff` | 蓝色表头 |

### 3.2 字体系统
*   **Font Family**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif`
*   **字阶**:
    *   Small: `12px`
    *   Base: `14px`
    *   Title: `16px`
*   **字重**:
    *   Regular: `400`
    *   Medium: `500`
    *   Bold: `700`

### 3.3 间距系统 (Spacing)
基于 4px 基准：
*   `4px` (xs)
*   `8px` (sm)
*   `12px` (md)
*   `16px` (lg)
*   `24px` (xl)

### 3.4 圆角 (Border Radius)
*   `2px`: 小组件 (Tag)
*   `4px`: 默认组件 (Card, Input, Button)
*   `8px`: 复合组件 (Combined Button)

---

## 4. 文案与多语言

### 4.1 核心文案
*   **标题**: "工薪预算驾驶舱", "在途调整/编制申请", "当前工薪执行现状及现行规划"
*   **表格列**: "申请类型", "申请部门", "正编", "实习", "劳务派遣", "人力外包", "兼职"
*   **操作**: "去提交", "修改", "删除", "预实比对", "一键折叠", "一键展开"

### 4.2 数字格式化
*   **千分位**: 使用 `toLocaleString()`，如 `1,234`
*   **货币**: 保留一位小数，如 `1,234.5`
*   **正负号**: 变化量显示 `+` 或无符号（负数自带 `-`）。

---

## 5. 交互与状态

### 5.1 按钮 (Combined Button)
*   **Default**: 背景透明，文字黑色，边框灰色。
*   **Hover**: 容器边框变蓝，阴影出现；子按钮背景变浅灰，文字变蓝。
*   **Click**: 触发 Ripple 波纹动画。
*   **Focus**: 浏览器默认 outline 或 Ant Design 蓝色 outline。

### 5.2 表格交互
*   **Hover Row**: 背景色变 `#fafafa`。
*   **Expand/Collapse**: 树形表格支持展开折叠，支持一键操作。

### 5.3 模态框
*   **Open**: 动画淡入 + 缩放。
*   **Loading**: 数据计算时若有延迟应显示 Spin（当前逻辑为前端计算，无明显 Loading）。

---

## 6. 可访问性 (Accessibility)

### 6.1 语义化
*   复合按钮容器使用 `role="group"` 和 `aria-label="现有人员/HC变更"`。
*   表格使用标准的 `th`, `td` 结构。

### 6.2 键盘导航
*   `Tab` 键可聚焦所有交互元素（Input, Button, Select）。
*   `Enter` 或 `Space` 可触发按钮点击。

### 6.3 触摸目标
*   移动端适配：按钮点击区域通过伪元素扩大至 `44x44px`。

---

## 7. 性能与兼容性

### 7.1 CSS 策略
*   使用 `scoped` CSS 避免全局污染。
*   关键样式内联在组件中。

### 7.2 浏览器支持
*   Chrome 88+
*   Edge 88+
*   Safari 14+
*   Firefox 85+

---

## 8. 组件开发指南

### 8.1 CombinedActionButton 示例

```vue
<template>
  <div class="combined-btn-container" role="group">
    <button class="c-btn left-btn">Left</button>
    <div class="separator"></div>
    <button class="c-btn right-btn">Right</button>
  </div>
</template>

<style scoped>
.combined-btn-container {
  /* Flex layout, border radius 8px */
}
</style>
```

### 8.2 CSS 变量引用
建议在全局 CSS 或组件根元素定义：

```css
:root {
  --color-primary: #4096ff;
  --color-border: #d9d9d9;
}
```
