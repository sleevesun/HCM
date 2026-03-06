# 过渡期HC额度上线步骤与回滚方案

## 上线步骤
1. 执行DDL：`db/ddl/20260305_transition_hc_quota.sql`
2. 执行初始化脚本：`scripts/initTransitionHcQuota.ts`
3. 发布接口改造代码：
   - `/api/department/{deptId}/transition-hc` 读取 `transition_hc_quota`
   - `/api/admin/department/recalculate-quota` 管理重算接口
4. 启用每日02:00校验任务 `runDailyTransitionHcQuotaCheck`
5. 检查监控与告警配置是否生效

## 回滚方案
1. 回滚接口代码到改造前版本
2. 执行回滚SQL：`db/rollback/20260305_transition_hc_quota_rollback.sql`
3. 校验前端是否仍走旧实时计算路径
4. 关闭每日校验任务与相关告警

## 监控项
- `/api/department/{deptId}/transition-hc` P99 < 200ms
- 403/500 比例
- 管理重算接口失败率
- 每日校验修复数量
