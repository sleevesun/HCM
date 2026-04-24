# 海外发薪科目与HCM科目对应.xlsx

**Source File:** `/Users/xianer/Library/Mobile Documents/com~apple~CloudDocs/Documents/HR 系统/HR系统文档-面向HR开放等14个文件/进行中项目文档/202409 HC控制/50 HCM 第三期/海外发薪科目与HCM科目对应.xlsx`

## Document Content

### Sheet: Sheet1

| PS海外发薪科目   | HCM科目   | 备注               |
|:-----------|:--------|:-----------------|
| 计发工资       | 工资      | nan              |
| 奖金         | -       | nan              |
| 员工养老金      | -       | nan              |
| 雇主养老金      | 养老保险    | nan              |
| 所得税扣减      | -       | nan              |
| 工资净收入      | -       | nan              |
| 年终奖        | -       | nan              |
| 年终奖所得税扣减   | -       | nan              |
| 年终奖净付款     | -       | nan              |
| nan        | 社保总额    | 等于五险的合计，海外目前只有养老 |



## 系统实现关联
### HCM 代码库对应模块

- [src/components/budget/BudgetDetailTable.vue](../../../src/components/budget/BudgetDetailTable.vue)
- [src/components/budget/PersonnelPopover.vue](../../../src/components/budget/PersonnelPopover.vue)
- [src/mocks/transitionHcQuotaApi.ts](../../../src/mocks/transitionHcQuotaApi.ts)
- [src/stores/salaryBudget.ts](../../../src/stores/salaryBudget.ts)
- [src/stores/user.ts](../../../src/stores/user.ts)
- [src/utils/getTransitionHcQuota.ts](../../../src/utils/getTransitionHcQuota.ts)
- [src/views/BudgetAdjustment.vue](../../../src/views/BudgetAdjustment.vue)
- [src/views/SalaryBudgetCockpit.vue](../../../src/views/SalaryBudgetCockpit.vue)
- [src/views/TransitionHCApply.vue](../../../src/views/TransitionHCApply.vue)
- [src/views/TransitionHCApproval.vue](../../../src/views/TransitionHCApproval.vue)

