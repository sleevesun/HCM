import { describe, expect, it } from 'vitest'
import { getTransitionHcQuota } from '../getTransitionHcQuota'

describe('getTransitionHcQuota', () => {
  it.each([
    [0, 1],
    [1, 1],
    [39, 1],
    [40, 1],
    [1000, 25]
  ])('部门人数=%s 时上限b=%s', (deptHeadcount, expectedB) => {
    const result = getTransitionHcQuota({
      deptHeadcount,
      currentFormCount: 0,
      validHistoryCount: 0
    })
    expect(result.b).toBe(expectedB)
  })

  it('验证a边界值与y计算', () => {
    const base = { deptHeadcount: 1000, validHistoryCount: 10 }
    expect(getTransitionHcQuota({ ...base, currentFormCount: 0 }).y).toBe(10)
    expect(getTransitionHcQuota({ ...base, currentFormCount: 1 }).y).toBe(11)
    expect(getTransitionHcQuota({ ...base, currentFormCount: 24 }).exceeded).toBe(true)
    expect(getTransitionHcQuota({ ...base, currentFormCount: 15 }).exceeded).toBe(false)
    expect(getTransitionHcQuota({ ...base, currentFormCount: 16 }).exceeded).toBe(true)
  })

  it.each([0, 5, 20])('历史有效数量=%s 时计算正确', (history) => {
    const result = getTransitionHcQuota({
      deptHeadcount: 40,
      currentFormCount: 1,
      validHistoryCount: history
    })
    expect(result.y).toBe(history + 1)
  })
})
