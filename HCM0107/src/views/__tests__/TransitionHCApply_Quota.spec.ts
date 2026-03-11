import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import TransitionHCApply from '../TransitionHCApply.vue'
import * as quotaApi from '../../mocks/transitionHcQuotaApi'

// Mock the API calls
vi.mock('../../mocks/transitionHcQuotaApi', () => ({
  fetchDepartmentTransitionHcQuota: vi.fn(),
  fetchValidTransitionHcCount: vi.fn(),
  getCurrentUserDeptId: vi.fn(() => 'test-dept')
}))

describe('TransitionHCApply Quota Logic', () => {
  it('should calculate X, Y, N correctly when N > 0', async () => {
    // Headcount = 100 -> X = ceil(100 * 0.025) = 3
    // Y = floor(3 * 0.3) = 0
    // N = 3 - 0 = 3
    vi.mocked(quotaApi.fetchDepartmentTransitionHcQuota).mockResolvedValue(100)
    vi.mocked(quotaApi.fetchValidTransitionHcCount).mockResolvedValue(0)

    const wrapper = mount(TransitionHCApply)
    await nextTick()
    // Wait for async loadQuotaData
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // We need to trigger dept change to see the stats
    // @ts-ignore
    wrapper.vm.selectedDept = 'test-dept'
    await nextTick()

    // @ts-ignore
    const q = wrapper.vm.quota
    expect(q.x).toBe(3)
    expect(q.y).toBe(0)
    expect(q.n).toBe(3)
    expect(q.exceeded).toBe(false)
  })

  it('should calculate X, Y, N correctly when N = 0', async () => {
    // Headcount = 0 -> X = 0, Y = 0, N = 0
    vi.mocked(quotaApi.fetchDepartmentTransitionHcQuota).mockResolvedValue(0)
    const wrapper = mount(TransitionHCApply)
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // @ts-ignore
    wrapper.vm.selectedDept = 'test-dept'
    await nextTick()

    // @ts-ignore
    const q = wrapper.vm.quota
    expect(q.n).toBe(0)
    expect(q.exceeded).toBe(true)
    expect(q.errorMsg).toContain('无可申请')
  })

  it('should detect exceeded limit when input rows > N', async () => {
    // Headcount = 40 -> X = ceil(40 * 0.025) = 1. Y = floor(0.3) = 0. N = 1.
    vi.mocked(quotaApi.fetchDepartmentTransitionHcQuota).mockResolvedValue(40)
    const wrapper = mount(TransitionHCApply)
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // @ts-ignore
    wrapper.vm.selectedDept = 'test-dept'
    // @ts-ignore
    wrapper.vm.transitionHCData = [{ id: '1' }, { id: '2' }] // 2 rows
    await nextTick()

    // @ts-ignore
    const q = wrapper.vm.quota
    expect(q.n).toBe(1)
    expect(q.a).toBe(2)
    expect(q.exceeded).toBe(true)
    expect(q.errorMsg).toContain('超过上限')
  })
})
