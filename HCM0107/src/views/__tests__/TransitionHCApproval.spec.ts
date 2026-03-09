import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import TransitionHCApproval from '../TransitionHCApproval.vue'

const fetchDetailMock = vi.fn()
const fetchFlowMock = vi.fn()
const handleApiErrorMock = vi.fn()
const pushMock = vi.fn()

const createMemoryStorage = () => {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear()
  }
}

vi.mock('../../mocks/transitionHcApprovalApi', () => ({
  fetchTransitionHcApprovalDetail: (...args: any[]) => fetchDetailMock(...args),
  fetchTransitionHcApprovalFlowHistory: (...args: any[]) => fetchFlowMock(...args)
}))

vi.mock('../../utils/error-handler', () => ({
  handleApiError: (...args: any[]) => handleApiErrorMock(...args)
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: (...args: any[]) => pushMock(...args)
  })
}))

const buildWrapper = () => mount(TransitionHCApproval, {
  global: {
    stubs: {
      'a-input': {
        props: ['value', 'disabled'],
        template: '<input class="a-input-stub" :disabled="disabled" :value="value" />'
      },
      'a-textarea': {
        props: ['value', 'disabled', 'readonly'],
        emits: ['update:value'],
        template: '<textarea class="a-textarea-stub" :disabled="disabled" :readonly="readonly" :value="value" @input="$emit(\'update:value\', $event.target.value)"></textarea>'
      },
      'a-empty': {
        props: ['description'],
        template: '<div class="a-empty-stub">{{ description }}</div>'
      },
      'a-button': {
        template: '<button class="a-btn-stub" @click="$emit(\'click\')"><slot /></button>'
      },
      'a-modal': {
        props: ['open', 'title'],
        emits: ['cancel', 'ok', 'update:open'],
        template: `
          <div v-if="open" class="a-modal-stub">
            <div class="modal-title">{{ title }}</div>
            <div class="modal-content"><slot /></div>
            <div class="modal-footer"><slot name="footer" /></div>
          </div>
        `
      },
      'a-table': {
        props: ['columns', 'dataSource', 'locale'],
        template: `
          <div class="a-table-stub">
            <div class="table-header">{{ columns.map((c) => c.title).join('|') }}</div>
            <div class="table-rows">{{ (dataSource || []).map((item) => [item.node, item.operator, item.result, item.operatedAt].join('/')).join('|') }}</div>
            <div v-if="!dataSource?.length" class="table-empty">{{ locale?.emptyText }}</div>
          </div>
        `
      }
    }
  }
})

describe('TransitionHCApproval', () => {
  const flushView = async () => {
    await Promise.resolve()
    await Promise.resolve()
    await nextTick()
  }

  beforeEach(() => {
    ;(globalThis as any).localStorage = createMemoryStorage()
    localStorage.setItem('x_auth_token', 'test-token')
    fetchDetailMock.mockReset()
    fetchFlowMock.mockReset()
    handleApiErrorMock.mockReset()
    pushMock.mockReset()
    fetchDetailMock.mockResolvedValue({
      id: 'THC-001',
      deptId: 'GB-03-星云工作室',
      deptPath: '游戏工作室群\\星云工作室',
      reason: '审批测试原因',
      rows: [
        {
          id: 'row_1',
          hcType: '正编',
          replacedPersonId: 'E001',
          salaryDisplay: '45000',
          deptName: '星云工作室',
          projectTag: '项目A',
          resignDate: '2026-03',
          groupCategory: '研发',
          rank: 'P5',
          socialLocation: '北京',
          workLocation: '北京',
          effectiveDate: '2026-03',
          expiryDate: '2026-06',
          personOptions: []
        }
      ]
    })
    fetchFlowMock.mockResolvedValue([
      { operator: '王楠', node: '申请人', result: '已完成', comment: 'ok', operatedAt: '2026-03-05 09:30' },
      { operator: '李晨', node: 'HRD', result: '已完成', comment: 'ok', operatedAt: '2026-03-05 10:15' },
      { operator: '赵敏', node: 'C&B', result: '进行中', comment: 'ok', operatedAt: '' },
      { operator: '周涛', node: '部门负责人', result: '未开始', comment: 'ok', operatedAt: '' }
    ])
  })

  it('全页面为只读模式并移除统计区', async () => {
    const wrapper = buildWrapper()
    await flushView()
    await flushView()
    const deptInput = wrapper.find('#dept-field .a-input-stub')
    expect(deptInput.attributes('disabled')).toBeDefined()
    expect((deptInput.element as HTMLInputElement).value).toContain('\\')
    const inputs = wrapper.findAll('.a-input-stub')
    expect(inputs.length).toBeGreaterThan(0)
    inputs.forEach((item) => expect(item.attributes('disabled')).toBeDefined())
    expect(wrapper.find('.a-textarea-stub').attributes('readonly')).toBeDefined()
    expect(wrapper.text()).not.toContain('本次申请过渡期HC')
  })

  it('渲染流程概览固定列头', async () => {
    const wrapper = buildWrapper()
    await flushView()
    const header = wrapper.find('.table-header').text()
    expect(header).toContain('操作人')
    expect(header).toContain('流程节点')
    expect(header).toContain('审批结果')
    expect(header).toContain('审批意见')
    expect(header).toContain('操作时间')
    const rows = wrapper.find('.table-rows').text()
    expect(rows).toContain('申请人')
    expect(rows).toContain('HRD')
    expect(rows).toContain('C&B')
    expect(rows).toContain('部门负责人')
  })

  it('流程空数据时显示占位', async () => {
    fetchFlowMock.mockResolvedValueOnce([])
    const wrapper = buildWrapper()
    await flushView()
    expect(wrapper.find('.table-empty').text()).toBe('暂无流程数据')
  })

  it('接口异常时走统一错误处理', async () => {
    fetchDetailMock.mockRejectedValueOnce(new Error('500'))
    const wrapper = buildWrapper()
    await flushView()
    expect(handleApiErrorMock).toHaveBeenCalled()
    expect(wrapper.exists()).toBe(true)
  })

  it('详情区域默认存在一行审批明细数据', async () => {
    const wrapper = buildWrapper()
    await flushView()
    const inputs = wrapper.findAll('.a-input-stub')
    expect(inputs.length).toBeGreaterThan(5)
    expect(wrapper.text()).not.toContain('暂无审批明细数据')
  })

  it('点击驳回和通过时弹窗标题正确切换', async () => {
    const wrapper = buildWrapper()
    await flushView()
    const buttons = wrapper.findAll('.a-btn-stub')
    await buttons.find((item) => item.text() === '驳回')!.trigger('click')
    expect(wrapper.find('.modal-title').text()).toBe('审批驳回')
    await buttons.find((item) => item.text() === '通过')!.trigger('click')
    expect(wrapper.find('.modal-title').text()).toBe('审批通过')
  })

  it('驳回场景审批意见必填，通过场景可空提交', async () => {
    const wrapper = buildWrapper()
    await flushView()
    const clickButton = async (text: string) => {
      const target = wrapper.findAll('.a-btn-stub').find((item) => item.text() === text)
      expect(target).toBeTruthy()
      await target!.trigger('click')
    }
    await clickButton('驳回')
    await clickButton('确定')
    expect(wrapper.text()).toContain('审批意见不能为空')
    await clickButton('取消')
    expect(wrapper.find('.a-modal-stub').exists()).toBe(false)
    await clickButton('通过')
    await clickButton('确定')
    expect(wrapper.find('.a-modal-stub').exists()).toBe(false)
  })
})
