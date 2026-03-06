# Changelog

## 2026-03-05

### Added
- 新增过渡期HC配额计算工具函数 `getTransitionHcQuota`，用于计算 `a`、`b`、`y` 与超限状态。
- 新增统计区域文案与样式重构，支持两行配额说明、红色变量高亮、超限警示文案。
- 新增配额接口封装：
  - `/api/dept/headcount?deptId=xxx`（部门实时在职人数）
  - `/api/transition-hc/valid-count?deptId=xxx`（历史有效过渡期HC数量）
- 新增统计区重试机制、超时提示、提交按钮超限禁用与提示文案。
- 新增“申请原因说明”输入组件 `ApplicationReasonInput`，支持必填标识、自动换行、自适应高度与字符计数。
- 新增提交载荷字段 `reason`，用于提交新增原因说明。
- 新增组织架构预设数据与初始化脚本，来源于《组织架构.md》并建立 01/1.1/02/03 层级关系。
- 新增组织架构维护接口：`createOrgNode`、`updateOrgNode`、`deleteOrgNode`、`validateOrgArchitecture`。
- 新增组织树配置文档与数据关联验证报告。
- 新增额度查询接口 `/api/department/{deptId}/transition-hc`，改为直接读取 `transition_hc_quota`。
- 新增管理员重算接口 `/api/admin/department/recalculate-quota`，支持单部门与全量重算。
- 新增每日02:00额度一致性校验任务与告警日志。
- 新增“过渡期HC审批”只读页面与流程概览表格，路由 `/transition-hc-approval`，权限码 `transition_hc_approval_view`。

### Changed
- `TransitionHCStats` 组件改为“统计信息 + 右侧操作入口”的结构，并支持加载态、错误态、重试事件。
- “添加行信息”入口迁移到统计 `section` 右侧，保留原有新增行行为与数据联动。
- 提交按钮新增配额校验：当 `y > b` 时禁用并展示提示“已超出本部门可申请上限”。
- 详情表格下方新增“申请原因说明”区域，提交前增加必填、最小10字符、最大500字符校验。
- HC申请部门组件改为组织架构数据源驱动，支持动态加载、搜索筛选、权限控制与组织路径回传。

### Compatibility
- 保持现有表格字段结构不变；新增统计相关字段仅在前端状态中使用。
- 接口异常（403/500/超时）时提供友好降级展示，不阻塞页面基础录入能力。
- 提交接口兼容说明：请求体新增 `reason` 字段；旧调用方若未传该字段将无法通过前端校验。
