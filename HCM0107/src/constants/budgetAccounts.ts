/**
 * 预算财务科目常量定义 (v4.1)
 * 基于 PRD 要求的 14 类标准财务科目
 */
export const BUDGET_ACCOUNTS = [
  { id: 'ACC-001', name: '工资预算' },
  { id: 'ACC-002', name: '绩效工资' },
  { id: 'ACC-003', name: '商业保险（补充医疗）' },
  { id: 'ACC-004', name: '工会经费' },
  { id: 'ACC-005', name: '饭补' },
  { id: 'ACC-006', name: '工伤保险' },
  { id: 'ACC-007', name: '医疗保险' },
  { id: 'ACC-008', name: '失业保险' },
  { id: 'ACC-009', name: '养老保险' },
  { id: 'ACC-010', name: '公积金' },
  { id: 'ACC-011', name: '签字费' },
  { id: 'ACC-012', name: '离职补偿金' },
  { id: 'ACC-013', name: '加班费' },
  { id: 'ACC-014', name: '其他人力成本预留' },
] as const;

export type BudgetAccountId = typeof BUDGET_ACCOUNTS[number]['id'];
export type BudgetAccountName = typeof BUDGET_ACCOUNTS[number]['name'];
