# 过渡期HC审批页面本地验证说明

## 启动
1. `npm install`
2. `npm run dev`
3. 打开：
   - 申请页基准：`http://localhost:5173/transition-hc-apply`
   - 审批页目标：`http://localhost:5173/transition-hc-approval`

## 视觉一致性对比
- 对比项：字体、行高、色值、按钮圆角、表格阴影。
- 验收标准：与申请页误差 ≤ 1px。
- 禁用态遵循 Ant Design 组件默认 disabled 样式。

## 功能验收清单
- 页面字段均为只读或禁用。
- 不展示“过渡期HC共申请多少个”统计区域。
- 底部展示“流程概览”表格及固定五列。
- 接口异常时弹出错误提示并在控制台输出堆栈。
