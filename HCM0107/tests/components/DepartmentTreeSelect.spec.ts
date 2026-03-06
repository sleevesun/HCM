import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import DepartmentTreeSelect from '../../src/components/DepartmentTreeSelect.vue'
import { nextTick } from 'vue'
import { fetchOrgTree } from '../../src/mocks/orgData'

const fetchOrgChildren = vi.fn(async () => [])
const fetchOrgNodeByCode = vi.fn(async () => null)
const initializeOrgArchitectureData = vi.fn(() => ({ valid: true, issues: [] }))

vi.mock('../../src/mocks/orgData', () => ({
  fetchOrgTree: vi.fn(async () => [
    {
      id: 'L1-GB',
      code: 'L1-GB',
      name: '游戏业务',
      title: '游戏业务',
      level: '1.1',
      manager: 'GU LI MING',
      headcount: 2621,
      parentCode: '01-PW',
      path: '01-PW/L1-GB',
      disabled: true,
      isLeaf: false,
      searchText: '游戏业务'
    }
  ]),
  fetchOrgChildren: (...args: any[]) => fetchOrgChildren(...args),
  fetchOrgNodeByCode: (...args: any[]) => fetchOrgNodeByCode(...args),
  getCurrentUserDeptCode: () => 'GB-03-星云工作室',
  initializeOrgArchitectureData: (...args: any[]) => initializeOrgArchitectureData(...args)
}))

describe('DepartmentTreeSelect', () => {
  beforeEach(() => {
    fetchOrgChildren.mockReset()
    fetchOrgNodeByCode.mockReset()
    initializeOrgArchitectureData.mockClear()
  })

  it('renders correctly', async () => {
    const wrapper = mount(DepartmentTreeSelect, {
      global: {
        stubs: {
          'a-tree-select': {
            props: ['value'],
            template: '<div class="tree-select-stub"><slot /></div>'
          }
        }
      }
    })
    await nextTick()
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.dept-tree-select').exists()).toBe(true)
  })

  it('loads data on mount', async () => {
    mount(DepartmentTreeSelect, {
      global: {
        stubs: {
          'a-tree-select': {
            props: ['value'],
            template: '<div class="tree-select-stub"><slot /></div>'
          }
        }
      }
    })
    await nextTick()
    expect(initializeOrgArchitectureData).toHaveBeenCalled()
    expect(fetchOrgTree).toHaveBeenCalled()
  })

  it('emits update:value event when selection changes', async () => {
    const wrapper = mount(DepartmentTreeSelect, {
      global: {
        stubs: {
          'a-tree-select': {
            emits: ['change', 'update:value'],
            template: '<button class="tree-trigger" @click="$emit(\'change\', \'GB-03-星云工作室\', null, { triggerNode: { props: { code: \'GB-03-星云工作室\', path: \'01-PW/L1-GB/GB-02-游戏工作室群/GB-03-星云工作室\', name: \'星云工作室\' } } })"></button>'
          }
        }
      }
    })
    await wrapper.find('.tree-trigger').trigger('click')
    expect(wrapper.emitted('update:value')).toBeTruthy()
    expect(wrapper.emitted('update:value')?.[0]).toEqual(['GB-03-星云工作室'])
    expect(wrapper.emitted('change')?.[0]?.[1]).toMatchObject({
      code: 'GB-03-星云工作室',
      name: '星云工作室'
    })
  })

  it('预设选中值不在首屏树时可补齐节点', async () => {
    fetchOrgNodeByCode.mockResolvedValueOnce({
      id: 'GB-03-星云工作室',
      code: 'GB-03-星云工作室',
      name: '星云工作室',
      title: '星云工作室',
      level: '03',
      manager: '陈力文',
      headcount: 68,
      parentCode: 'GB-02-游戏工作室群',
      path: '01-PW/L1-GB/GB-02-游戏工作室群/GB-03-星云工作室',
      disabled: false,
      isLeaf: true,
      searchText: '星云工作室'
    })
    mount(DepartmentTreeSelect, {
      props: {
        value: 'GB-03-星云工作室'
      },
      global: {
        stubs: {
          'a-tree-select': {
            props: ['value'],
            template: '<div class="tree-select-stub"></div>'
          }
        }
      }
    })
    await nextTick()
    expect(fetchOrgNodeByCode).toHaveBeenCalledWith('GB-03-星云工作室')
  })
})
