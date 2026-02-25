# 预算调整模块开发交付物

## 1. 页面复刻
- **源码文件**: `src/views/BudgetAdjustment.vue`
- **复刻说明**:
  - 基于 `工薪预算驾驶舱.html` 的结构和样式进行了 1:1 复刻。
  - 使用 Ant Design Vue 组件 (`a-table`, `a-modal`, `a-input`, `a-select`) 替换了原生 HTML 元素。
  - 样式使用 `scoped` CSS 封装，并使用了 `:deep()` 选择器来覆盖 Ant Design 默认样式以匹配设计稿。
  - 实现了包括 RowSpan、Tree Table、模态框数据计算等复杂业务逻辑。

## 2. 菜单扩展
- **配置文件**: `src/views/Dashboard.vue`
- **功能说明**:
  - 添加了“预算调整”菜单项，Key 为 `3-4`。
  - 实现了权限控制：通过 `src/stores/user.ts` 中的 `userStore.hasPermission('finance')` 控制菜单显示。
  - 实现了路由跳转和高亮同步。

## 3. 按钮跳转
- **修改文件**: `src/views/SalaryBudgetCockpit.vue`
- **功能说明**:
  - 在“预算调整”列的编辑按钮添加了点击事件。
  - 点击按钮调用 `goToBudgetAdjustment(record)` 方法，使用 `router.push` 跳转至 `/budget-adjust` 并携带 `rowId` 参数。

## 4. 启动与验证
- **启动命令**: `npm run dev`
- **访问路径**: 
  - 首页: `http://localhost:5173/`
  - 预算调整页: `http://localhost:5173/budget-adjust`
- **验证步骤**:
  1. 登录系统（默认拥有 finance 权限）。
  2. 在左侧菜单栏“编制管理”下可以看到“预算调整”菜单，点击可进入。
  3. 在“工薪预算驾驶舱”页面，点击表格中的“预算调整”列编辑图标，可跳转至预算调整页，且 URL 包含 `rowId` 参数。
  4. 检查预算调整页面的 UI 是否与原 HTML 一致，包括表格样式、模态框交互等。

## 5. 兼容性说明
- 本模块基于 Vue 3 + Ant Design Vue 开发，兼容现代浏览器（Chrome, Edge, Firefox, Safari）。
- 响应式布局适配了桌面端和部分移动端视口。
