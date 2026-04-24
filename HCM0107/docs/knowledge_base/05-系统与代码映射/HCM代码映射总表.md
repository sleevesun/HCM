# HCM 代码映射总表

本文档汇总了业务模块与 `HCM0107` 代码库之间的映射关系。

| 业务关键字 | 相关代码模块 |
|---|---|
| **奖金** | `src/views/BudgetAdjustment.vue`<br>`src/views/SalaryBudgetCockpit.vue`<br>`src/stores/salaryBudget.ts`<br>`src/components/budget/BudgetDetailTable.vue` |
| **预算** | `src/views/BudgetAdjustment.vue`<br>`src/views/SalaryBudgetCockpit.vue`<br>`src/stores/salaryBudget.ts` |
| **HC** | `src/views/TransitionHCApproval.vue`<br>`src/views/TransitionHCApply.vue`<br>`src/utils/getTransitionHcQuota.ts`<br>`src/mocks/transitionHcQuotaApi.ts` |
| **审批** | `src/views/ApprovalCenter.vue`<br>`src/services/budgetApprovalMobileService.ts`<br>`src/views/BudgetApprovalMobile.vue` |
| **流程** | `src/views/ApprovalCenter.vue`<br>`src/components/FlowReturnButton.vue` |
| **组织** | `src/components/DepartmentTreeSelect.vue`<br>`src/constants/deptStructure.ts` |
| **架构** | `src/components/DepartmentTreeSelect.vue`<br>`src/constants/deptStructure.ts` |
| **档案** | `src/stores/user.ts`<br>`src/views/Dashboard.vue` |
| **员工** | `src/stores/user.ts`<br>`src/components/budget/PersonnelPopover.vue` |
| **离职** | `src/stores/user.ts` |
| **入职** | `src/stores/user.ts` |
| **权限** | `src/stores/user.ts`<br>`src/router/index.ts` |
| **角色** | `src/stores/user.ts`<br>`src/router/index.ts` |
