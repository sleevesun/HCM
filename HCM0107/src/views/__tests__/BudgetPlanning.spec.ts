import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BudgetPlanning from '../BudgetPlanning.vue'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    back: vi.fn(),
    push: vi.fn()
  })
}))

describe('BudgetPlanning.vue', () => {
  it('renders the header title correctly', () => {
    const wrapper = mount(BudgetPlanning)
    const header = wrapper.find('header.page-header h1')
    expect(header.exists()).toBe(true)
    expect(header.text()).toBe('2026年预算调整')
  })

  it('renders all three sections with correct data-testid', () => {
    const wrapper = mount(BudgetPlanning)
    
    const sections = [
      { id: 'adjust-summary', title: '调整汇总' },
      { id: 'before-apply', title: '申请前明细' },
      { id: 'after-approve', title: '申请通过后明细' }
    ]

    sections.forEach(section => {
      const el = wrapper.find(`section[data-testid="${section.id}"]`)
      expect(el.exists()).toBe(true)
      expect(el.find('h2').text()).toBe(section.title)
    })
  })

  it('handles bottom button clicks', async () => {
    const wrapper = mount(BudgetPlanning)
    
    // Find buttons
    const backBtn = wrapper.find('button[aria-label="返回"]')
    const createBtn = wrapper.find('button[aria-label="创建审批单据"]')

    expect(backBtn.exists()).toBe(true)
    expect(createBtn.exists()).toBe(true)

    // Trigger clicks
    await backBtn.trigger('click')
    await createBtn.trigger('click')

    // Since we mocked logic with console.log and router, we primarily check they are clickable without error
    // In a real test we would spy on the methods
  })

  it('has correct footer layout structure', () => {
    const wrapper = mount(BudgetPlanning)
    const footer = wrapper.find('footer.page-footer')
    expect(footer.exists()).toBe(true)
    expect(footer.element.tagName).toBe('FOOTER')
  })
})
