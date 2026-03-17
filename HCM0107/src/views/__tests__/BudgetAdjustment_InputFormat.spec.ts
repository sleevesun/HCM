import { describe, it, expect } from 'vitest'
import {
  formatBudgetNumber,
  getBudgetDisplayValue,
  normalizeBudgetOnBlur,
  parseBudgetInput,
  sanitizeBudgetParserValue
} from '../../utils/budgetInputFormat'

describe('BudgetAdjustment Input Format Logic', () => {
  it('格式化显示：千分位+1位小数', () => {
    expect(formatBudgetNumber(1234.56)).toBe('1,234.6')
    expect(formatBudgetNumber(100)).toBe('100.0')
    expect(formatBudgetNumber('10000')).toBe('10,000.0')
  })

  it('聚焦状态显示原值，失焦状态显示格式化值', () => {
    expect(getBudgetDisplayValue(1234.5, { category: 'overtime', month: 1 }, 'overtime', 1)).toBe('1234.5')
    expect(getBudgetDisplayValue(1234.5, null, 'overtime', 1)).toBe('1,234.5')
  })

  it('解析输入：去千分位并过滤非法字符', () => {
    expect(sanitizeBudgetParserValue('1,234.5')).toBe('1234.5')
    expect(sanitizeBudgetParserValue('1,2a34.5元')).toBe('1234.5')
    expect(parseBudgetInput('1,234.5')).toBe(1234.5)
  })

  it('失焦归一化：四舍五入1位小数，非法输入回退旧值', () => {
    expect(normalizeBudgetOnBlur('1234.56', 0)).toBe(1234.6)
    expect(normalizeBudgetOnBlur('100', 0)).toBe(100.0)
    expect(normalizeBudgetOnBlur('', 88.8)).toBe(88.8)
    expect(normalizeBudgetOnBlur('abc', 66.6)).toBe(66.6)
    expect(normalizeBudgetOnBlur('-', 55.5)).toBe(55.5)
  })
})
