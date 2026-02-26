# Mock Data Dictionary

## Overview
This dataset simulates pre-application personnel salary budget data for the HCM system.
Generated at: 2026-02-26T07:30:36.272Z

## Statistics
- **Total Records**: 220
- **Departments**: 运营部, 测试部, 策划部, 客户端, 服务器, 美术部
- **Source**: Parsed from raw data and augmented with synthetic records.

## Schema Definition

| Field Name | Data Type | Description | Constraints / Logic |
|------------|-----------|-------------|---------------------|
| `id` | String | Unique Identifier | Generated random ID (Prefix 'E' for Employee, 'D' for Dept). |
| `name` | String | Person/Dept Name | Original names preserved; augmented names suffixed. Edge cases include very long strings. |
| `type` | Enum | Entity Type | Values: 'group', 'dept', 'person'. |
| `tag` | Enum | Employment Type | 'REG' (Regular), 'INT' (Intern). |
| `tagName` | String | Tag Display Name | '正编', '实习'. |
| `jobTitle` | String | Job Position | Inferred from context (e.g., Engineer, Intern). |
| `rank` | String | Professional Rank | Linked to Job Title (P5-P9). |
| `phone` | String | Phone Number | Masked format: 138****1234. Includes empty strings for abnormal cases. |
| `email` | String | Email Address | Masked format: pinyin****@domain. Includes invalid formats for abnormal cases. |
| `idCard` | String | ID Card Number | Masked format: 18 digits with asterisks. |
| `months` | Object | Monthly Salary | Keyed by month (1-12). Contains `salary` value. |
| `totalYear` | Number | Annual Total | Sum of 12 months. Includes large values for boundary tests. |
| `dataSource` | String | Data Source | Fixed value 'mock'. |
| `createTime` | Number | Creation Timestamp | Unix timestamp of generation. |

## Data Generation Rules
1. **Parsing**: Raw data from `申请前人员数据.md` is parsed to extract departments, names, and salary figures.
2. **Augmentation**: Existing records are cloned and modified to reach the minimum 200 record count.
3. **Sensitive Data**: PII fields (Phone, Email, ID) are generated using random algorithms with masking applied.
4. **Edge Cases**:
   - 10% of augmented records have extreme values (long names, high salaries).
   - 5% of augmented records have abnormal values (invalid email, missing phone).
5. **Consistency**: Department totals are recalculated based on child records.
