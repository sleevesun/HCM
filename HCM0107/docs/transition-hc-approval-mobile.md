# 过渡期HC审批移动端说明

## 页面入口
- 路由：`/transition-hc-approval-mobile`
- 组件文件：`src/views/TransitionHCApprovalMobile.vue`

## 信息结构
- 顶部固定操作栏：同意、驳回、转审
- 折叠区块：申请部门、过渡期HC详情、原因说明、流程概览
- 底部悬浮提交按钮

## 移动端关键策略
- 关键字段仅保留6项：被替换人、月薪、部门、预计离职日期、生效日期、失效日期
- 日期格式统一 `YYYY-MM-DD`
- 金额格式统一 `¥` + 千分位
- 支持一键展开/收起全部区块

## 接口与降级
- 复用审批详情与流程接口
- 请求参数附带 `device=mobile`
- 失败自动重试最多3次，重试失败提示“网络异常，请稍后重试”
- 本地缓存：`localStorage(transition_hc_mobile_cache_v1)`，弱网可展示最近一次数据

## 性能与无障碍检查建议
- Lighthouse：Performance ≥ 90，LCP ≤ 2.5s
- 文本字号不低于14px，按钮触控区不低于48px
- 对比度按WCAG 2.1 AA核查

## 真机对比截图清单
- iOS Safari：审批详情首屏、流程概览、提交态
- Android Chrome：审批详情首屏、流程概览、提交态
- 微信内置浏览器：审批详情首屏、流程概览、提交态
