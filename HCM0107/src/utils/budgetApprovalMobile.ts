import type { BudgetChangeType } from '../types/budgetApprovalMobile'

export const getChangeClass = (type: BudgetChangeType): string => {
  if (type === 'positive') return 'text-red'
  if (type === 'negative') return 'text-green'
  return 'text-gray-400'
}
