import budgetApprovalMobileData from '../mocks/budgetApprovalMobile.json'
import type { BudgetApprovalMobileData } from '../types/budgetApprovalMobile'

export const fetchBudgetApprovalMobileData = async (): Promise<BudgetApprovalMobileData> => {
  return Promise.resolve(budgetApprovalMobileData as BudgetApprovalMobileData)
}

export const submitBudgetApprovalDecision = async (decision: 'approve' | 'reject'): Promise<{ success: boolean; decision: 'approve' | 'reject' }> => {
  return Promise.resolve({ success: true, decision })
}
