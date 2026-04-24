import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BudgetChangeLogModal from '../BudgetChangeLogModal.vue'
import { useSalaryBudgetStore } from '../../../stores/salaryBudget'
import Antd from 'ant-design-vue'

describe('BudgetChangeLogModal.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should sort logs by timestamp descending', async () => {
    const store = useSalaryBudgetStore()
    // Clear logs and add unsorted ones
    store.changeLogs = [
      {
        id: 'LOG-1',
        timestamp: '2026-01-01 10:00:00',
        type: 'Type 1',
        bizType: 'APPROVAL',
        deptId: 'D1',
        deptName: 'Dept 1',
        category: 'Cat 1',
        hcChange: 0,
        totalBudgetChange: 100,
        details: []
      },
      {
        id: 'LOG-2',
        timestamp: '2026-01-02 10:00:00',
        type: 'Type 2',
        bizType: 'APPROVAL',
        deptId: 'D2',
        deptName: 'Dept 2',
        category: 'Cat 2',
        hcChange: 0,
        totalBudgetChange: 200,
        details: []
      }
    ]

    const wrapper = mount(BudgetChangeLogModal, {
      props: { open: true },
      global: {
        plugins: [Antd]
      }
    })

    const vm = wrapper.vm as any
    expect(vm.filteredLogs[0].id).toBe('LOG-2')
    expect(vm.filteredLogs[1].id).toBe('LOG-1')
  })

  it('should color tags correctly based on bizType', () => {
    const wrapper = mount(BudgetChangeLogModal, {
      props: { open: true },
      global: {
        plugins: [Antd]
      }
    })
    const vm = wrapper.vm as any

    expect(vm.getTypeColor({ bizType: 'TRANSFER_IN' })).toBe('orange')
    expect(vm.getTypeColor({ bizType: 'APPROVAL' })).toBe('blue')
    expect(vm.getTypeColor({ bizType: 'DEPT_MOVE' })).toBe('purple')
  })
})
