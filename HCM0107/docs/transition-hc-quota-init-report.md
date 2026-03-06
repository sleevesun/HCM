# 过渡期HC额度初始化执行报告

## 执行信息
- 脚本：`scripts/initTransitionHcQuota.ts`
- 执行模式：全量重算
- 执行时间：2026-03-05

## 结果摘要
- 总部门数：85
- 成功部门数：85
- 失败部门数：0

## 失败明细
- 无

## 幂等验证
- 连续执行两次脚本后，`transition_hc_quota` 字段值一致。
- 公式统一：`CEIL(headcount * 0.025)`。
