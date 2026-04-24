import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSalaryBudgetStore } from '../salaryBudget'

describe('SalaryBudget Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should generate hedge logs when transition HC is approved', () => {
    const store = useSalaryBudgetStore()
    const initialLogCount = store.changeLogs.length

    const payload = {
      approvalId: 'TEST-001',
      fromDeptId: 'DEPT-SRC',
      fromDeptName: 'Source Dept',
      toDeptId: 'DEPT-TGT',
      toDeptName: 'Target Dept',
      hcCount: 2,
      amount: 120000,
      projectTag: 'Test Project',
      category: '正编'
    }

    store.approveTransitionHC(payload)

    // Should add 2 logs (IN and OUT)
    expect(store.changeLogs.length).toBe(initialLogCount + 2)

    const inLog = store.changeLogs.find(l => l.bizType === 'TRANSFER_IN')
    const outLog = store.changeLogs.find(l => l.bizType === 'TRANSFER_OUT')

    expect(inLog).toBeDefined()
    expect(outLog).toBeDefined()

    // Verify In Log
    expect(inLog?.deptName).toBe('Target Dept')
    expect(inLog?.hcChange).toBe(2)
    expect(inLog?.totalBudgetChange).toBe(120000)
    expect(inLog?.details.length).toBeGreaterThan(0)
    
    // Verify Out Log
    expect(outLog?.deptName).toBe('Source Dept')
    expect(outLog?.hcChange).toBe(-2)
    expect(outLog?.totalBudgetChange).toBe(-120000)
    expect(outLog?.details.length).toBeGreaterThan(0)

    // Verify detail sum
    const detailSum = inLog?.details.reduce((acc, d) => acc + d.amount, 0)
    expect(detailSum).toBe(120000)
  })
})
