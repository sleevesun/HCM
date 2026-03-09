import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import TransitionHCApprovalMobile from '../TransitionHCApprovalMobile.vue'

const showFailToastMock = vi.fn()
const fetchDetailMock = vi.fn()
const fetchFlowMock = vi.fn()
const pushMock = vi.fn()

vi.mock('vant', async () => {
  const actual = await vi.importActual<any>('vant')
  return {
    ...actual,
    showFailToast: (...args: any[]) => showFailToastMock(...args)
  }
})

vi.mock('../../mocks/transitionHcApprovalApi', () => ({
  fetchTransitionHcApprovalDetail: (...args: any[]) => fetchDetailMock(...args),
  fetchTransitionHcApprovalFlowHistory: (...args: any[]) => fetchFlowMock(...args)
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: (...args: any[]) => pushMock(...args)
  })
}))

const flush = async () => {
  await Promise.resolve()
  await Promise.resolve()
  await nextTick()
}

const createMemoryStorage = () => {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear()
  }
}

const buildWrapper = () =>
  mount(TransitionHCApprovalMobile, {
    global: {
      stubs: {
        VanSkeleton: true,
        VanField: {
          props: ['modelValue', 'label', 'placeholder', 'readonly', 'rows', 'autosize', 'type'],
          emits: ['update:modelValue'],
          template: '<textarea class="field-stub" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
        },
        VanButton: true
      }
    }
  })

describe('TransitionHCApprovalMobile', () => {
  beforeEach(() => {
    ;(globalThis as any).localStorage = createMemoryStorage()
    showFailToastMock.mockReset()
    fetchDetailMock.mockReset()
    fetchFlowMock.mockReset()
    pushMock.mockReset()
    localStorage.setItem('x_auth_token', 'token')
    fetchDetailMock.mockResolvedValue({
      id: 'THC-1',
      deptId: 'D1',
      deptName: '星云工作室',
      deptPath: '路径',
      reason: '原因',
      rows: [
        {
          id: 'r1',
          replacedPersonName: '张三',
          salaryDisplay: '23000',
          deptName: '星云工作室',
          resignDate: '2026-05-31',
          effectiveDate: '2026-04',
          expiryDate: '2026-06'
        },
        {
          id: 'r2',
          replacedPersonName: '李四',
          salaryDisplay: '31000',
          deptName: '运营部',
          resignDate: '2026-04-30',
          effectiveDate: '2026-03-01',
          expiryDate: '2026-05-31'
        }
      ]
    })
    fetchFlowMock.mockResolvedValue([
      { operator: 'A', node: '申请人', result: '已完成', comment: 'ok', operatedAt: '2026-03-05 09:30' }
    ])
  })

  it('渲染移动端关键区块与标题递增', async () => {
    const wrapper = buildWrapper()
    await flush()
    expect(wrapper.find('.mobile-header').exists()).toBe(true)
    expect(wrapper.find('.content-wrap').exists()).toBe(true)
    expect(wrapper.findAll('.detail-group').length).toBe(2)
    const titles = wrapper.findAll('.transition-hc-title')
    expect(titles.map((item) => item.text())).toEqual(['过渡期HC 1', '过渡期HC 2'])
    expect(wrapper.text()).toContain('申请数量')
    expect(wrapper.text()).toContain('2')
    const fields = wrapper.findAll('.field-stub')
    expect(fields.length).toBe(1)
    expect(wrapper.text()).toContain('生效日期:')
    expect(wrapper.text()).toContain('失效日期:')
    expect(wrapper.text()).toContain('被替换人:')
    expect(wrapper.text()).toContain('直属部门:')
  })

  it('字段顺序与格式符合要求', async () => {
    const wrapper = buildWrapper()
    await flush()
    const firstGroup = wrapper.findAll('.detail-group')[0]
    const labels = firstGroup.findAll('.label').map((item) => item.text())
    expect(labels).toEqual([
      '生效日期:',
      '失效日期:',
      '被替换人:',
      '预计离职日期:',
      '月薪:',
      '直属部门:'
    ])
    const values = firstGroup.findAll('.value').map((item) => item.text())
    expect(values[0]).toBe('2026-04-01')
    expect(values[1]).toBe('2026-06-01')
    expect(values[4]).toBe('23,000')
  })

  it('字段缺失时显示降级文案', async () => {
    fetchDetailMock.mockResolvedValueOnce({
      id: 'THC-2',
      deptId: 'D1',
      deptName: '',
      deptPath: '路径',
      reason: '原因',
      rows: [
        {
          id: 'r1',
          replacedPersonName: '',
          salaryDisplay: '',
          deptName: '',
          resignDate: '',
          effectiveDate: '',
          expiryDate: ''
        }
      ]
    })
    const wrapper = buildWrapper()
    await flush()
    const values = wrapper.findAll('.detail-group')[0].findAll('.value').map((item) => item.text())
    expect(values).toEqual(['-', '-', '张子薇', '-', '25000', '暂无'])
  })

  it('驳回时审批意见为空提示错误', async () => {
    const wrapper = buildWrapper()
    await flush()
    await wrapper.find('.top-action-btn.danger').trigger('click')
    expect(showFailToastMock).toHaveBeenCalledWith('请先输入审批意见再进行驳回操作')
  })

  it('审批意见输入后实时写入缓存并可执行驳回', async () => {
    const wrapper = buildWrapper()
    await flush()
    const fields = wrapper.findAll('.field-stub')
    await fields[0].setValue('需要补充说明')
    expect(localStorage.getItem('transition_hc_mobile_opinion_v1')).toBe('需要补充说明')
    await wrapper.find('.top-action-btn.danger').trigger('click')
    expect(showFailToastMock).toHaveBeenCalledTimes(0)
  })
})
