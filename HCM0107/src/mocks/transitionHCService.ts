export interface TransitionHCRow {
  id: string
  hcType: string
  replacedPersonId?: string
  replacedPersonName?: string
  deptName?: string
  projectTag?: string
  resignDate?: string
  groupCategory?: string
  rank?: string
  socialLocation?: string
  workLocation?: string
  effectiveDate?: string
  expiryDate?: string
  salaryDisplay?: string
  searchLoading?: boolean
  fieldLoading?: boolean
  personOptions: Array<{ empId: string; name: string }>
  searchTimer?: ReturnType<typeof setTimeout>
}

export interface TransitionHcSubmitPayload {
  deptId: string
  deptName?: string
  deptPath?: string
  reason: string
  rows: TransitionHCRow[]
}

const DRAFT_KEY = 'transition_hc_draft_v1'
const HISTORY_KEY = 'transition_hc_history_v1'
let nextRowId = 1

export const createDefaultTransitionRow = (): TransitionHCRow => ({
  id: `row_${nextRowId++}`,
  hcType: '正编',
  personOptions: []
})

export const loadTransitionDraft = (): TransitionHCRow[] => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as TransitionHCRow[]
    return parsed.map((item) => ({
      ...item,
      personOptions: [],
      searchLoading: false,
      fieldLoading: false
    }))
  } catch {
    return []
  }
}

export const saveTransitionDraft = (rows: TransitionHCRow[]) => {
  const toSave = rows.map((item) => ({
    ...item,
    personOptions: [],
    searchLoading: false,
    fieldLoading: false,
    searchTimer: undefined
  }))
  localStorage.setItem(DRAFT_KEY, JSON.stringify(toSave))
}

export const loadTransitionHistory = (): string[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

export const saveTransitionHistory = (records: string[]) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(records.slice(0, 200)))
}

export const syncTransitionRows = async (_rows: TransitionHCRow[]) => {
  await new Promise((resolve) => setTimeout(resolve, 120))
  return { success: true }
}

export const submitTransitionApplication = async (_payload: TransitionHcSubmitPayload) => {
  await new Promise((resolve) => setTimeout(resolve, 140))
  return { success: true }
}
