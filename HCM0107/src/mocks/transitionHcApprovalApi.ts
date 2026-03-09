import { fetchOrgNodeByCode, getCurrentUserDeptCode } from './orgData'
import { loadTransitionDraft, type TransitionHCRow } from './transitionHCService'
import { pickRandomStaff } from './budgetData'

type ApiError = Error & { status?: number }

export interface ApprovalRequestConfig {
  headers: Record<string, string>
  mockStatus?: number
  device?: 'mobile' | 'web'
}

export interface TransitionHcApprovalDetail {
  id: string
  deptId: string
  deptName: string
  deptPath: string
  reason: string
  rows: TransitionHCRow[]
}

export interface TransitionHcFlowRecord {
  operator: string
  node: string
  result: string
  comment: string
  operatedAt: string
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const ensureAuthToken = (headers: Record<string, string>) => {
  const token = headers['X-Auth-Token']
  if (!token) {
    const err = new Error('认证信息缺失') as ApiError
    err.status = 401
    throw err
  }
}

const raiseByStatus = (status?: number) => {
  if (!status) return
  const err = new Error(`接口异常(${status})`) as ApiError
  err.status = status
  throw err
}

const randomName = () => {
  const names = ['王楠', '李晨', '赵敏', '周涛', '孙悦', '吴昊', '郑岚', '钱程']
  return names[Math.floor(Math.random() * names.length)]
}

const randomNameExcluding = (exclude: string) => {
  const names = ['王楠', '李晨', '赵敏', '周涛', '孙悦', '吴昊', '郑岚', '钱程']
  const pool = names.filter((name) => name !== exclude)
  return pool[Math.floor(Math.random() * pool.length)] || names[0]
}

const buildMockApprovalRow = (): TransitionHCRow => {
  const staff = pickRandomStaff()
  const effectiveDate = '2026-03'
  const expiryDate = '2026-06'
  return {
    id: `approval_row_${Date.now()}`,
    hcType: '正编',
    replacedPersonId: staff?.empId || 'E000001',
    replacedPersonName: staff?.name || '张三',
    deptName: staff?.deptName || '星云工作室',
    projectTag: staff?.projectTag || '通用项目',
    resignDate: '2026-03',
    groupCategory: '研发',
    rank: staff?.rank || 'P6',
    socialLocation: staff?.socialLocation || '北京',
    workLocation: staff?.workLocation || '北京',
    effectiveDate,
    expiryDate,
    salaryDisplay: staff?.salaryBase ? Math.round(staff.salaryBase * 10000).toString() : '30000',
    personOptions: []
  }
}

const toDeptPathDisplay = async (deptNode: Awaited<ReturnType<typeof fetchOrgNodeByCode>>) => {
  if (!deptNode) return '上级部门\\申请部门'
  const parentCode = deptNode.parentCode
  if (!parentCode) return deptNode.name
  const parentNode = await fetchOrgNodeByCode(parentCode)
  const parentName = parentNode?.name || parentCode
  return `${parentName}\\${deptNode.name}`
}

const fillApprovalRow = (row: TransitionHCRow, index: number, deptName: string): TransitionHCRow => {
  const fallbackStaff = pickRandomStaff()
  const seq = index + 1
  return {
    ...row,
    hcType: '过渡期HC',
    replacedPersonId: row.replacedPersonId || fallbackStaff?.empId || `E67${6100 + seq}`,
    replacedPersonName: row.replacedPersonName || fallbackStaff?.name || '张子薇',
    deptName: row.deptName || deptName || fallbackStaff?.deptName || '运营部',
    resignDate: row.resignDate || '2026-04',
    effectiveDate: row.effectiveDate || '2026-03',
    expiryDate: row.expiryDate || '2026-06',
    salaryDisplay: row.salaryDisplay || (fallbackStaff?.salaryBase ? Math.round(fallbackStaff.salaryBase * 10000).toString() : '25000'),
    personOptions: []
  }
}

export const fetchTransitionHcApprovalDetail = async (
  config: ApprovalRequestConfig
): Promise<TransitionHcApprovalDetail> => {
  await wait(config.device === 'mobile' ? 70 : 90)
  ensureAuthToken(config.headers)
  raiseByStatus(config.mockStatus)
  const deptId = getCurrentUserDeptCode()
  const deptNode = await fetchOrgNodeByCode(deptId)
  const deptPathDisplay = await toDeptPathDisplay(deptNode)
  const draftRows = loadTransitionDraft()
  const sourceRows = draftRows.length ? draftRows : [buildMockApprovalRow()]
  const filledRows = sourceRows.map((item, index) => fillApprovalRow(item, index, deptNode?.name || '运营部'))
  return {
    id: 'THC-APPROVAL-20260305-001',
    deptId,
    deptName: deptNode?.name || '未知部门',
    deptPath: deptPathDisplay,
    reason: '现有项目人员离职导致岗位空缺，需要在过渡期间补齐关键角色，保障项目交付。',
    rows: filledRows
  }
}

export const fetchTransitionHcApprovalFlowHistory = async (
  config: ApprovalRequestConfig
): Promise<TransitionHcFlowRecord[]> => {
  await wait(config.device === 'mobile' ? 80 : 110)
  ensureAuthToken(config.headers)
  raiseByStatus(config.mockStatus)
  const hrdOperator = randomName()
  const cnbOperator = randomNameExcluding(hrdOperator)
  return [
    {
      operator: randomName(),
      node: '申请人',
      result: '已完成',
      comment: '已提交申请',
      operatedAt: '2026-03-05 09:30'
    },
    {
      operator: hrdOperator,
      node: 'HRD',
      result: '已完成',
      comment: '同意',
      operatedAt: '2026-03-05 10:15'
    },
    {
      operator: cnbOperator,
      node: 'C&B',
      result: '进行中',
      comment: '待处理',
      operatedAt: ''
    },
    {
      operator: randomName(),
      node: '部门负责人',
      result: '未开始',
      comment: '待处理',
      operatedAt: ''
    }
  ]
}
