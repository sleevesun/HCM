# 假勤系统新功能上线后的实用FAQ（for HR only）.docx

**Source File:** `/Users/xianer/Library/Mobile Documents/com~apple~CloudDocs/Documents/HR 系统/HR系统文档-面向HR开放等14个文件/HR系统文档-面向HR开放/假勤系统新功能上线后的实用FAQ（for HR only）.docx`

## Document Content

假勤系统新功能上线后的实用FAQ（for HR only）
说明：此文件仅用于HR内部查看，请不要转发给其他员工


如果临时安排加班，加班申请当天可以提交么？提交申请有最晚的时限要求么？
A：加班当天提交——算事前，员工自己可以提；过了当天都算“事后”，只能由HRD补提（入口是一样的，OA>>加班申请）。
补提申请最晚不能超过30天（与考勤补签规则保持一致）。

加班申请的审批规则？（什么情况下会审批到集团管理层）
A：
加班事前申请的，HRD+二级部门负责人/工作室负责人审批；
加班事后申请的，由HRD代提交，审批规则与考勤补签的规则保持一致——
不超过3天的，二级部门负责人/工作室负责人审批；
>3天的会审批到集团HR负责人

员工因周六/日加班产生的调休，在申请调休假的时候，当天是否有餐补？
A：有餐补

员工加班当日是远程办公，无法正常考勤打卡，需要“考勤补签”吗？占用“补签次数”吗？
A：这种情况下需要有考勤补签（因为系统会校验考勤时间），写清楚原因；但不占用补签次数

“半天弹性规则”什么情况下生效？什么情况下不生效？
A:“半天弹性规则”是在原来“弹性规则”基础上的补充，不会覆盖原来的部门考勤规则；也就是说——
如果部门原来设定的考勤规则中没有“弹性”，那么“半天弹性规则”也不会生效；
如果部门原来设定的考勤规则中“弹性窗口”比较小（比如上午从8:30开始），那么“半天弹性规则”也会follow原设定（上午也从8:30开始）；
如果部门原来设定的考勤规则没有特殊规定（即遵循7:00~19:30的统一规定），则“半天弹性规则”正常生效




## 系统实现关联
### HCM 代码库对应模块

- [src/components/budget/PersonnelPopover.vue](../../../src/components/budget/PersonnelPopover.vue)
- [src/mocks/transitionHcQuotaApi.ts](../../../src/mocks/transitionHcQuotaApi.ts)
- [src/services/budgetApprovalMobileService.ts](../../../src/services/budgetApprovalMobileService.ts)
- [src/stores/user.ts](../../../src/stores/user.ts)
- [src/utils/getTransitionHcQuota.ts](../../../src/utils/getTransitionHcQuota.ts)
- [src/views/ApprovalCenter.vue](../../../src/views/ApprovalCenter.vue)
- [src/views/BudgetApprovalMobile.vue](../../../src/views/BudgetApprovalMobile.vue)
- [src/views/TransitionHCApply.vue](../../../src/views/TransitionHCApply.vue)
- [src/views/TransitionHCApproval.vue](../../../src/views/TransitionHCApproval.vue)

