type ApiError = Error & { status?: number }

import {
  fetchDeptHeadcountFromOrg,
  fetchDeptQuotaFromOrg,
  getCurrentUserDeptCode,
  initializeOrgArchitectureData,
  recalculateTransitionHcQuota,
  runDailyQuotaConsistencyJob
} from './orgData'

const VALID_COUNT_KEY = 'transition_hc_valid_count_db_v1'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const QUOTA_PATH = '/api/department/{deptId}/transition-hc'
const ADMIN_RECALC_PATH = '/api/admin/department/recalculate-quota'

const readValidCountDb = () => {
  const raw = localStorage.getItem(VALID_COUNT_KEY)
  if (!raw) {
    const preset: Record<string, number> = {
      'GB-03-星云工作室': 1,
      'GB-03-青云工作室': 3,
      'GB-03-幻塔工作室': 16,
      DEFAULT: 0
    }
    localStorage.setItem(VALID_COUNT_KEY, JSON.stringify(preset))
    return preset
  }
  return JSON.parse(raw) as Record<string, number>
}

export const getCurrentUserDeptId = () => getCurrentUserDeptCode()

export const fetchDeptHeadcount = async (deptId: string): Promise<number> => {
  await wait(80)
  initializeOrgArchitectureData()
  if (deptId === 'FORBIDDEN') {
    const err = new Error('无权访问部门人数') as ApiError
    err.status = 403
    throw err
  }
  if (deptId === 'SERVER_ERROR') {
    const err = new Error('部门人数接口异常') as ApiError
    err.status = 500
    throw err
  }
  return fetchDeptHeadcountFromOrg(deptId)
}

export const fetchDepartmentTransitionHcQuota = async (deptId: string): Promise<number> => {
  initializeOrgArchitectureData()
  if (deptId === 'FORBIDDEN') {
    const err = new Error('无权访问部门额度') as ApiError
    err.status = 403
    throw err
  }
  if (deptId === 'SERVER_ERROR') {
    const err = new Error('部门额度接口异常') as ApiError
    err.status = 500
    throw err
  }
  return fetchDeptQuotaFromOrg(deptId)
}

export const fetchValidTransitionHcCount = async (deptId: string): Promise<number> => {
  await wait(90)
  if (deptId === 'FORBIDDEN') {
    const err = new Error('无权访问历史有效数量') as ApiError
    err.status = 403
    throw err
  }
  if (deptId === 'SERVER_ERROR') {
    const err = new Error('历史有效数量接口异常') as ApiError
    err.status = 500
    throw err
  }
  const db = readValidCountDb()
  return db[deptId] ?? db.DEFAULT ?? 0
}

export const adminRecalculateQuota = async (params: { deptId?: string; isAdmin: boolean }) => {
  await wait(50)
  if (!params.isAdmin) {
    const err = new Error('仅管理员可操作') as ApiError
    err.status = 403
    throw err
  }
  return recalculateTransitionHcQuota(params.deptId)
}

export const runDailyTransitionHcQuotaCheck = async () => {
  await wait(30)
  return runDailyQuotaConsistencyJob()
}

export const quotaApiMeta = {
  queryPath: QUOTA_PATH,
  adminPath: ADMIN_RECALC_PATH,
  responseTimeTargetP99Ms: 200,
  dailyCheckCron: '0 2 * * *'
}
