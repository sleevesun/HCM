# Spreadsheets.xlsx

**Source File:** `/Users/xianer/Library/Mobile Documents/com~apple~CloudDocs/Documents/HR 系统/HR系统文档-面向HR开放等14个文件/各系统历史文档/202410-HR月报/Spreadsheets.xlsx`

## Document Content

### Sheet: Sheet1

| 打卡情况                |   打卡天数 | 是否计算工作时长   |
|:--------------------|-------:|:-----------|
| 正常                  |    1   | 是          |
| 迟到 or 早退            |    1   | 是          |
| 上午缺勤 or下午缺勤         |    0.5 | 是          |
| 上午缺勤 +下午缺勤          |    0   | 否          |
| 请假半天(含补填）           |    0   | 否          |
| 请假全天(含补填）           |    0   | 否          |
| 当天出现冲销              |    0   | 否          |
| (外出、请假、HR、出差、入职第一天） |        |            |
| 已补填考勤               |    1   | 是          |
| 节假日、周末加班            |    0   | 是          |
| 签退—签到＜1小时           |    0   | 否          |



## 系统实现关联
### HCM 代码库对应模块

- [src/mocks/transitionHcQuotaApi.ts](../../../src/mocks/transitionHcQuotaApi.ts)
- [src/stores/user.ts](../../../src/stores/user.ts)
- [src/utils/getTransitionHcQuota.ts](../../../src/utils/getTransitionHcQuota.ts)
- [src/views/TransitionHCApply.vue](../../../src/views/TransitionHCApply.vue)
- [src/views/TransitionHCApproval.vue](../../../src/views/TransitionHCApproval.vue)

