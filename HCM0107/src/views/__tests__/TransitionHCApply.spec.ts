import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import TransitionHCApply from '../TransitionHCApply.vue'

vi.mock('../../mocks/budgetData', () => ({
  searchStaff: vi.fn(async () => [])
}))

const syncTransitionRows = vi.fn(async () => ({ success: true }))
const submitTransitionApplication = vi.fn(async () => ({ success: true }))
const saveTransitionDraft = vi.fn()
const saveTransitionHistory = vi.fn()
const loadTransitionDraftMock = vi.fn(() => [])
const loadTransitionHistoryMock = vi.fn(() => [])
const fetchDepartmentTransitionHcQuotaMock = vi.fn(async () => 1)
const fetchValidTransitionHcCountMock = vi.fn(async () => 0)
const getCurrentUserDeptIdMock = vi.fn(() => 'D0102')

vi.mock('../../mocks/transitionHCService', () => ({
  createDefaultTransitionRow: vi.fn(() => ({
    id: `row_test_${Date.now()}`,
    hcType: '正编',
    personOptions: []
  })),
  loadTransitionDraft: (...args: any[]) => loadTransitionDraftMock(...args),
  syncTransitionRows: (...args: any[]) => syncTransitionRows(...args),
  submitTransitionApplication: (...args: any[]) => submitTransitionApplication(...args),
  saveTransitionDraft: (...args: any[]) => saveTransitionDraft(...args),
  saveTransitionHistory: (...args: any[]) => saveTransitionHistory(...args),
  loadTransitionHistory: (...args: any[]) => loadTransitionHistoryMock(...args)
}))

vi.mock('../../mocks/transitionHcQuotaApi', () => ({
  fetchDepartmentTransitionHcQuota: (...args: any[]) => fetchDepartmentTransitionHcQuotaMock(...args),
  fetchValidTransitionHcCount: (...args: any[]) => fetchValidTransitionHcCountMock(...args),
  getCurrentUserDeptId: (...args: any[]) => getCurrentUserDeptIdMock(...args)
}))

const messageError = vi.fn()
const messageWarning = vi.fn()
const messageSuccess = vi.fn()

vi.mock('ant-design-vue', () => ({
  message: {
    error: (...args: any[]) => messageError(...args),
    warning: (...args: any[]) => messageWarning(...args),
    success: (...args: any[]) => messageSuccess(...args)
  }
}))

const buildWrapper = () =>
  mount(TransitionHCApply, {
    global: {
      stubs: {
        DepartmentTreeSelect: {
          template: '<button class="dept-select-stub" @click="$emit(\'update:value\', \'D01\')">dept</button>'
        },
        TransitionAddRowButton: {
          template: '<button class="transition-add-row-btn" @click="$emit(\'add\')">add-row</button>'
        },
        ApplicationReasonInput: {
          props: ['modelValue'],
          template: '<textarea class="reason-input-stub" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>'
        },
        'a-button': {
          props: ['type'],
          template: '<button :data-type="type" @click="$emit(\'click\')"><slot /></button>'
        },
        'a-input': {
          props: ['value', 'disabled', 'placeholder'],
          template: '<input :value="value" :disabled="disabled" :placeholder="placeholder" @input="$emit(\'update:value\', $event.target.value)" />'
        },
        'a-select': {
          props: ['value', 'disabled'],
          template: '<select :disabled="disabled" @change="$emit(\'update:value\', $event.target.value)"><slot /></select>'
        },
        'a-select-option': {
          props: ['value'],
          template: '<option :value="value"><slot /></option>'
        },
        'a-date-picker': {
          props: ['value', 'disabled'],
          template: '<input type="month" :disabled="disabled" @change="$emit(\'update:value\', $event.target.value)" />'
        },
        'a-spin': true,
        'a-empty': {
          props: ['description'],
          template: '<div class="empty-stub">{{ description }}</div>'
        },
        'a-popconfirm': {
          template: '<div><slot /></div>'
        },
        'a-tooltip': {
          template: '<div><slot /></div>'
        },
        'a-skeleton-input': true
      }
    }
  })

describe('TransitionHCApply', () => {
  beforeEach(() => {
    messageError.mockClear()
    messageWarning.mockClear()
    messageSuccess.mockClear()
    syncTransitionRows.mockClear()
    saveTransitionDraft.mockClear()
    saveTransitionHistory.mockClear()
    submitTransitionApplication.mockClear()
    loadTransitionDraftMock.mockReset()
    loadTransitionDraftMock.mockImplementation(() => [])
    loadTransitionHistoryMock.mockReset()
    loadTransitionHistoryMock.mockImplementation(() => [])
    fetchDepartmentTransitionHcQuotaMock.mockReset()
    fetchDepartmentTransitionHcQuotaMock.mockImplementation(async () => 1)
    fetchValidTransitionHcCountMock.mockReset()
    fetchValidTransitionHcCountMock.mockImplementation(async () => 0)
    getCurrentUserDeptIdMock.mockReset()
    getCurrentUserDeptIdMock.mockImplementation(() => 'D0102')
  })

  const flushView = async () => {
    await Promise.resolve()
    await Promise.resolve()
    await new Promise((resolve) => setTimeout(resolve, 200))
    await nextTick()
  }

  afterEach(() => {
    vi.useRealTimers()
  })

  it('渲染完整表头结构', async () => {
    const wrapper = buildWrapper()
    await flushView()
    const headers = wrapper.findAll('th').map((th) => th.text())
    expect(headers).toContain('序号')
    expect(headers).toContain('HC类型')
    expect(headers).toContain('被替换人员 *')
    expect(headers).toContain('操作')
    expect(wrapper.text()).toContain('本次申请过渡期HC')
    expect(wrapper.text()).toContain('当前部门可申请过渡期HC为')
  })

  it('点击添加行后生成新行并展示序号', async () => {
    const wrapper = buildWrapper()
    await flushView()
    await wrapper.find('.transition-add-row-btn').trigger('click')
    await nextTick()
    await flushView()
    const rowCells = wrapper.findAll('tbody tr td.text-center')
    expect(rowCells[0]?.text()).toBe('1')
    expect(wrapper.text()).toContain('本次申请过渡期HC 1 个')
  })

  it('未选部门提交时触发错误提示', async () => {
    const wrapper = buildWrapper()
    await flushView()
    await wrapper.find('.reason-input-stub').setValue('这是用于测试的申请原因说明文本')
    await wrapper.findAll('button').at(-1)!.trigger('click')
    expect(messageError).toHaveBeenCalled()
  })

  it('数据变更触发自动保存与同步', async () => {
    const wrapper = buildWrapper()
    await flushView()
    await wrapper.find('.transition-add-row-btn').trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 700))
    await flushView()
    expect(saveTransitionDraft).toHaveBeenCalled()
    expect(syncTransitionRows).toHaveBeenCalled()
  })

  it('统计加载异常时展示错误提示', async () => {
    fetchDepartmentTransitionHcQuotaMock.mockImplementationOnce(async () => {
      throw new Error('403')
    })
    const wrapper = buildWrapper()
    await flushView()
    expect(wrapper.text()).toContain('配额数据加载失败，请重试')
  })

  it('超出上限时禁用提交按钮并显示警示文案', async () => {
    fetchDepartmentTransitionHcQuotaMock.mockImplementationOnce(async () => 1)
    fetchValidTransitionHcCountMock.mockImplementationOnce(async () => 1)
    const wrapper = buildWrapper()
    await flushView()
    await wrapper.find('.transition-add-row-btn').trigger('click')
    await nextTick()
    expect(wrapper.text()).toContain('无法提交本次申请')
    const submitBtn = wrapper.findAll('button').find((btn) => btn.text() === '提交')
    expect(submitBtn?.attributes('disabled')).toBeDefined()
  })

  it('接口500时展示错误提示且允许重试', async () => {
    fetchDepartmentTransitionHcQuotaMock.mockImplementationOnce(async () => {
      throw new Error('500')
    })
    const wrapper = buildWrapper()
    await flushView()
    expect(wrapper.text()).toContain('配额数据加载失败，请重试')
    fetchDepartmentTransitionHcQuotaMock.mockImplementationOnce(async () => 1)
    fetchValidTransitionHcCountMock.mockImplementationOnce(async () => 0)
    await wrapper.find('.retry-btn').trigger('click')
    await flushView()
    expect(wrapper.text()).not.toContain('配额数据加载失败，请重试')
  })

  it('未填写申请原因时提交触发必填校验', async () => {
    loadTransitionDraftMock.mockImplementationOnce(() => ([{
      id: 'row_valid_1',
      hcType: '正编',
      replacedPersonId: 'E001',
      projectTag: '项目A',
      resignDate: '2026-03',
      groupCategory: '研发',
      rank: 'P4',
      socialLocation: '北京',
      workLocation: '北京',
      effectiveDate: '2026-03',
      expiryDate: '2026-06',
      personOptions: []
    }]))
    const wrapper = buildWrapper()
    await flushView()
    await wrapper.find('.dept-select-stub').trigger('click')
    await nextTick()
    await wrapper.findAll('button').at(-1)!.trigger('click')
    expect(messageError).toHaveBeenCalledWith('请填写申请原因说明')
  })

  it('填写合法申请原因后可提交并携带后端参数', async () => {
    loadTransitionDraftMock.mockImplementationOnce(() => ([{
      id: 'row_valid_2',
      hcType: '正编',
      replacedPersonId: 'E002',
      projectTag: '项目A',
      resignDate: '2026-03',
      groupCategory: '研发',
      rank: 'P4',
      socialLocation: '北京',
      workLocation: '北京',
      effectiveDate: '2026-03',
      expiryDate: '2026-06',
      personOptions: []
    }]))
    const wrapper = buildWrapper()
    await flushView()
    await wrapper.find('.dept-select-stub').trigger('click')
    await nextTick()
    await wrapper.find('.reason-input-stub').setValue('这是用于验证提交功能的申请原因说明文本')
    await wrapper.findAll('button').at(-1)!.trigger('click')
    expect(submitTransitionApplication).toHaveBeenCalled()
    expect(submitTransitionApplication.mock.calls[0][0]).toMatchObject({
      deptId: 'D01',
      reason: '这是用于验证提交功能的申请原因说明文本'
    })
  })
})
