import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ApplicationReasonInput from '../../src/components/ApplicationReasonInput.vue'

describe('ApplicationReasonInput', () => {
  it('渲染标题、星号与占位提示', () => {
    const wrapper = mount(ApplicationReasonInput, {
      props: {
        modelValue: ''
      }
    })
    expect(wrapper.text()).toContain('申请原因说明')
    expect(wrapper.text()).toContain('*')
    const textarea = wrapper.find('textarea')
    expect(textarea.attributes('placeholder')).toBe('请简要描述新增原因')
  })

  it('输入时触发双向绑定事件', async () => {
    const wrapper = mount(ApplicationReasonInput, {
      props: {
        modelValue: ''
      }
    })
    const textarea = wrapper.find('textarea')
    await textarea.setValue('这是新增申请原因说明')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['这是新增申请原因说明'])
  })

  it('展示错误信息与字符计数', () => {
    const wrapper = mount(ApplicationReasonInput, {
      props: {
        modelValue: '123456789',
        error: '申请原因说明不少于10个字符',
        minLength: 10,
        maxLength: 500
      }
    })
    expect(wrapper.text()).toContain('申请原因说明不少于10个字符')
    expect(wrapper.text()).toContain('9/500')
  })
})
