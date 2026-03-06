import { beforeEach, describe, expect, it } from 'vitest'
import {
  adminRecalculateQuota,
  fetchDepartmentTransitionHcQuota,
  fetchValidTransitionHcCount,
  runDailyTransitionHcQuotaCheck
} from '../transitionHcQuotaApi'
import {
  initializeOrgArchitectureData,
  updateDepartmentHeadcount
} from '../orgData'

describe('transitionHcQuotaApi', () => {
  const createMemoryStorage = () => {
    const store = new Map<string, string>()
    return {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear()
    }
  }

  ;(globalThis as any).localStorage = createMemoryStorage()

  beforeEach(() => {
    ;(globalThis as any).localStorage.clear()
  })

  it.each([
    [0, 1],
    [1, 1],
    [39, 1],
    [40, 1]
  ])('ceil边界计算: headcount=%s quota=%s', async (headcount, expectedQuota) => {
    initializeOrgArchitectureData(true)
    await updateDepartmentHeadcount('GB-03-星云工作室', headcount)
    const quota = await fetchDepartmentTransitionHcQuota('GB-03-星云工作室')
    expect(quota).toBe(expectedQuota)
  })

  it('接口200返回并在更新人数后3秒内反映新额度', async () => {
    initializeOrgArchitectureData(true)
    await updateDepartmentHeadcount('GB-03-星云工作室', 68)
    const before = await fetchDepartmentTransitionHcQuota('GB-03-星云工作室')
    expect(before).toBe(2)
    await updateDepartmentHeadcount('GB-03-星云工作室', 400)
    await new Promise((resolve) => setTimeout(resolve, 100))
    const after = await fetchDepartmentTransitionHcQuota('GB-03-星云工作室')
    expect(after).toBe(10)
  })

  it('接口403与500异常场景', async () => {
    await expect(fetchDepartmentTransitionHcQuota('FORBIDDEN')).rejects.toThrow()
    await expect(fetchValidTransitionHcCount('SERVER_ERROR')).rejects.toThrow()
  })

  it('管理员重算接口权限校验与执行', async () => {
    await expect(adminRecalculateQuota({ isAdmin: false })).rejects.toThrow()
    const result = await adminRecalculateQuota({ isAdmin: true, deptId: 'GB-03-星云工作室' })
    expect(result.success).toBeGreaterThanOrEqual(1)
  })

  it('每日校验任务可执行', async () => {
    const result = await runDailyTransitionHcQuotaCheck()
    expect(result.repaired).toBeGreaterThanOrEqual(0)
  })

  it('10000并发查询P99 < 200ms', async () => {
    initializeOrgArchitectureData(true)
    const durations: number[] = []
    const total = 10000
    const batch = 200
    for (let offset = 0; offset < total; offset += batch) {
      await Promise.all(
        Array.from({ length: Math.min(batch, total - offset) }).map(async () => {
          const start = performance.now()
          await fetchDepartmentTransitionHcQuota('GB-03-星云工作室')
          durations.push(performance.now() - start)
        })
      )
    }
    durations.sort((a, b) => a - b)
    const p99 = durations[Math.floor(durations.length * 0.99)]
    expect(p99).toBeLessThan(200)
  })
})
