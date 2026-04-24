# HCPlanning3.0-概况-20250420.pptx

**Source File:** `/Users/xianer/Library/Mobile Documents/com~apple~CloudDocs/Documents/HR 系统/HR系统文档-面向HR开放等14个文件/进行中项目文档/202409 HC控制/01 前期准备/HCPlanning3.0-概况-20250420.pptx`

## Document Content

HC Planning3.0-概况

---
HC Planning-整体规划

---
HCP 3.0 功能清单（new)
建立统一的数据底座，整合 人力与财务的核心数据（如人员编制、成本科目，全类型、全科目覆盖），确保双方使用一致的预算数据口径。

统一人力与财务的管控维度（如部门层级统一为四级部门、项目层级统一按地区划分），确保双方对 “部门”“项目”“人员” 等基础维度的定义与层级划分完全一致。
前提

---
 
HCP 3.0 系统架构

---
各系统之间交互
统一预算出口：
流程统一管控：HC填报计算、线上审批
实现人财一体：提供数据给财务
达成目标：
预算多版本管理
留存各预算版本，数据透明
多口径预算数据
部门维度
项目维度
公司维度

---
HC Planning-整体规划
统一预算出口：
流程统一管控：HC填报计算、线上审批
实现人财一体：提供数据给财务
预算填报：年度HC预算编制
HC预算审批（二级部门/工作室内）
HC预算调整
HC预算控制


数据对接到OA HC控制模块
（HC控制1.0&2.0）
达成目标：
预算多版本管理
留存各预算版本，数据透明
应用范围：
人员类型：正式（含试用、返聘）、实习生、劳务派遣、兼职
适用业务：A股上市公司(游戏、电竞、影视、集团)
多口径预算数据
部门维度
项目维度
公司维度
给财务
提供数据


---
HC Planning-流程


---
HC Planning-功能梳理

---
HC预算调整
1）新增HC

2）不同HC类型间预算调拨

3）组织架构调整带来的预算调整（转移）

4）CB调整（公司层面的调整）

5）项目预算调整

6）预算版本管理

---
HCP 功能清单

---
HCP 功能清单

---
HCP 功能清单（new)
建立统一的数据底座，整合 人力与财务的核心数据（如人员编制、成本科目），确保双方使用一致的预算数据口径，全类型、全科目覆盖。
统一人力与财务的管控维度（如部门层级统一为四级部门、项目层级统一按地区划分），确保双方对 “部门”“项目”“人员” 等基础维度的定义与层级划分完全一致。
前提

---


## 系统实现关联
### HCM 代码库对应模块

- [src/components/DepartmentTreeSelect.vue](../../../src/components/DepartmentTreeSelect.vue)
- [src/components/FlowReturnButton.vue](../../../src/components/FlowReturnButton.vue)
- [src/constants/deptStructure.ts](../../../src/constants/deptStructure.ts)
- [src/mocks/transitionHcQuotaApi.ts](../../../src/mocks/transitionHcQuotaApi.ts)
- [src/services/budgetApprovalMobileService.ts](../../../src/services/budgetApprovalMobileService.ts)
- [src/stores/salaryBudget.ts](../../../src/stores/salaryBudget.ts)
- [src/utils/getTransitionHcQuota.ts](../../../src/utils/getTransitionHcQuota.ts)
- [src/views/ApprovalCenter.vue](../../../src/views/ApprovalCenter.vue)
- [src/views/BudgetAdjustment.vue](../../../src/views/BudgetAdjustment.vue)
- [src/views/BudgetApprovalMobile.vue](../../../src/views/BudgetApprovalMobile.vue)
- [src/views/SalaryBudgetCockpit.vue](../../../src/views/SalaryBudgetCockpit.vue)
- [src/views/TransitionHCApply.vue](../../../src/views/TransitionHCApply.vue)
- [src/views/TransitionHCApproval.vue](../../../src/views/TransitionHCApproval.vue)

