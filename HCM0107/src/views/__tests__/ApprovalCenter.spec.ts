import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ApprovalCenter from '../ApprovalCenter.vue'
import { nextTick } from 'vue'

// Mock Ant Design components as they might be complex to render
vi.mock('ant-design-vue', async () => {
  const actual = await vi.importActual('ant-design-vue')
  return {
    ...actual,
    Table: {
      name: 'ATable',
      template: '<div class="ant-table"><slot name="default"></slot></div>',
      props: ['dataSource', 'columns']
    },
    'a-table-column': { template: '<div></div>' },
    'a-table-column-group': { template: '<div><slot></slot></div>' },
    RadioGroup: {
      name: 'ARadioGroup',
      template: '<div class="ant-radio-group"><slot></slot></div>',
      props: ['value']
    },
    RadioButton: {
      name: 'ARadioButton',
      template: '<div class="ant-radio-button" @click="$emit(\'click\')"><slot></slot></div>',
      props: ['value']
    },
    Empty: { template: '<div class="ant-empty">Empty</div>' }
  }
})

describe('ApprovalCenter.vue', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(ApprovalCenter, {
      global: {
        stubs: {
          'appstore-outlined': true,
          'reload-outlined': true,
          'info-circle-outlined': true,
          'a-button': true,
          'a-space': true,
          'a-tooltip': true,
          'DepartmentTreeSelect': true
        }
      }
    })
  })

  it('renders page title correctly', () => {
    expect(wrapper.find('.page-title').text()).toContain('审批中心')
  })

  it('renders primary status tabs with correct default', () => {
    const radioGroup = wrapper.find('.status-tabs')
    expect(radioGroup.exists()).toBe(true)
    // Check if 3 radio buttons exist
    const radioButtons = radioGroup.findAll('div.ant-radio-button') // Since we mocked it as div
    // Wait, the mock template renders div class="ant-radio-button"
    // But since ARadioButton is a component, findComponent might be better or check rendered HTML
    // However, shallowMount/mount with stubs might behave differently.
    // Let's rely on finding the text.
    expect(wrapper.text()).toContain('待审批')
    expect(wrapper.text()).toContain('进行中')
    expect(wrapper.text()).toContain('已完成')
    
    // Check default value of approvalStatus
    expect(wrapper.vm.approvalStatus).toBe('pending')
  })

  it('renders secondary type tabs with correct default', () => {
    const typeTabs = wrapper.find('.type-tabs')
    expect(typeTabs.exists()).toBe(true)
    const items = typeTabs.findAll('.type-tab-item')
    expect(items.length).toBe(2)
    expect(items[0].text()).toBe('部门预算编制/变更')
    expect(items[1].text()).toBe('过渡期HC申请')
    
    // Check active class
    expect(items[0].classes()).toContain('active')
    expect(items[1].classes()).not.toContain('active')
    
    // Check default approvalType
    expect(wrapper.vm.approvalType).toBe('budget')
  })

  it('switches secondary tabs correctly', async () => {
    const items = wrapper.findAll('.type-tab-item')
    
    // Click "Transition HC"
    await items[1].trigger('click')
    expect(wrapper.vm.approvalType).toBe('transition_hc')
    expect(items[1].classes()).toContain('active')
    
    // Content should change
    expect(wrapper.find('.transition-hc-list').exists()).toBe(true)
    expect(wrapper.find('.ant-table').exists()).toBe(true)
    
    // Click back to "Budget"
    await items[0].trigger('click')
    expect(wrapper.vm.approvalType).toBe('budget')
    expect(wrapper.find('.ant-table').exists()).toBe(true)
  })

  it('updates data when status changes', async () => {
    // Mock generateStaticData or watch the effect
    // We can check if tableData is updated.
    // Since generateStaticData generates random data seeded by year, 
    // and processNode uses random hash seeded by status bias.
    // It's hard to deterministically check the data content without mocking math.random or the function.
    // But we can check if the watch is triggered.
    
    const initialData = wrapper.vm.tableData
    
    // Change status
    wrapper.vm.approvalStatus = 'processing'
    await nextTick()
    
    // Data should be regenerated (reference changed)
    expect(wrapper.vm.tableData).not.toBe(initialData)
  })
})
