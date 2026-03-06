export interface TransitionHcQuotaInput {
  deptHeadcount: number
  currentFormCount: number
  validHistoryCount: number
}

export interface TransitionHcQuotaResult {
  a: number
  b: number
  y: number
  exceeded: boolean
}

export const getTransitionHcQuota = (input: TransitionHcQuotaInput): TransitionHcQuotaResult => {
  const headcount = Number.isFinite(input.deptHeadcount) ? Math.max(0, input.deptHeadcount) : 0
  const a = Number.isFinite(input.currentFormCount) ? Math.max(0, input.currentFormCount) : 0
  const history = Number.isFinite(input.validHistoryCount) ? Math.max(0, input.validHistoryCount) : 0
  const b = Math.max(Math.ceil(headcount * 0.025), 1)
  const y = history + a
  return {
    a,
    b,
    y,
    exceeded: y > b
  }
}
