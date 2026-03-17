export type BudgetFocusedCell = {
  category: string
  month: number
} | null

export const formatBudgetNumber = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return ''
  const normalized = typeof value === 'string' ? value.replace(/,/g, '').trim() : value
  const num = Number(normalized)
  if (!Number.isFinite(num)) return ''
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })
}

export const parseBudgetInput = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined) return null
  const cleaned = String(value).replace(/,/g, '').trim()
  if (!cleaned || cleaned === '-' || cleaned === '.' || cleaned === '-.') return null
  const parsed = Number(cleaned)
  if (!Number.isFinite(parsed)) return null
  return parsed
}

export const normalizeBudgetOnBlur = (
  rawValue: string | number | null | undefined,
  previousValue: number
): number => {
  const parsed = parseBudgetInput(rawValue)
  if (parsed === null) return previousValue
  const rounded = Number(parsed.toFixed(1))
  if (!Number.isFinite(rounded)) return previousValue
  return rounded
}

export const sanitizeBudgetParserValue = (value: string): string => {
  return value.replace(/,/g, '').replace(/[^\d.-]/g, '')
}

export const getBudgetDisplayValue = (
  value: number | string | null | undefined,
  focusedCell: BudgetFocusedCell,
  category: string,
  month: number
): string => {
  if (focusedCell?.category === category && focusedCell?.month === month) {
    if (value === null || value === undefined) return ''
    return String(value)
  }
  return formatBudgetNumber(value)
}
