export type OrgLevel = '01' | '1.1' | '02' | '03'

export interface OrgRecord {
  code: string
  name: string
  level: OrgLevel
  parentCode: string | null
  manager: string
  headcount: number
  transitionHcQuota?: number
}

export interface OrgNode {
  id: string
  code: string
  name: string
  title: string
  level: OrgLevel
  manager: string
  headcount: number
  parentCode: string | null
  path: string
  disabled: boolean
  isLeaf: boolean
  loaded?: boolean
  searchText: string
  children?: OrgNode[]
}

const ORG_DB_KEY = 'org_architecture_db_v1'
const ORG_VALIDATION_REPORT_KEY = 'org_architecture_validation_report_v1'
const ORG_QUOTA_RECALC_LOG_KEY = 'org_quota_recalc_log_v1'
const ORG_QUOTA_ALERT_LOG_KEY = 'org_quota_alert_log_v1'
const CURRENT_USER_DEPT_CODE = 'GB-03-星云工作室'

const presetRecords: OrgRecord[] = [
  { code: '01-PW', name: 'PerfectWorld', level: '01', parentCode: null, manager: '总部', headcount: 3224 },
  { code: 'L1-GB', name: '游戏业务', level: '1.1', parentCode: '01-PW', manager: 'GU LI MING', headcount: 2621 },
  { code: 'L1-EP', name: '电竞与平台业务', level: '1.1', parentCode: '01-PW', manager: 'XIAO HONG', headcount: 254 },
  { code: 'L1-FILM', name: '影视业务', level: '1.1', parentCode: '01-PW', manager: '曾映雪', headcount: 104 },
  { code: 'L1-BACK', name: '后勤职能', level: '1.1', parentCode: '01-PW', manager: 'XIAO HONG', headcount: 51 },
  { code: 'L1-GD', name: '集团发展部', level: '1.1', parentCode: '01-PW', manager: 'CHEN RONG', headcount: 128 },
  { code: 'L1-GO', name: '集团办公室', level: '1.1', parentCode: '01-PW', manager: '池宇峰', headcount: 23 },

  { code: 'GB-02-游戏工作室群', name: '游戏工作室群', level: '02', parentCode: 'L1-GB', manager: 'GU LI MING', headcount: 1384 },
  { code: 'GB-03-星云工作室', name: '星云工作室', level: '03', parentCode: 'GB-02-游戏工作室群', manager: '陈力文', headcount: 68 },
  { code: 'GB-03-青云工作室', name: '青云工作室', level: '03', parentCode: 'GB-02-游戏工作室群', manager: '宗梓特', headcount: 194 },
  { code: 'GB-03-硬核工作室', name: '硬核工作室', level: '03', parentCode: 'GB-02-游戏工作室群', manager: '刘桂臣', headcount: 106 },
  { code: 'GB-03-矩阵工作室', name: '矩阵工作室', level: '03', parentCode: 'GB-02-游戏工作室群', manager: '陈力文', headcount: 0 },
  { code: 'GB-03-million工作室', name: 'million 工作室', level: '03', parentCode: 'GB-02-游戏工作室群', manager: '杨晓曦', headcount: 0 },
  { code: 'GB-03-黑羽工作室', name: '黑羽工作室', level: '03', parentCode: 'GB-02-游戏工作室群', manager: '魏然', headcount: 142 },
  { code: 'GB-03-远景工作室', name: '远景工作室', level: '03', parentCode: 'GB-02-游戏工作室群', manager: '韩立', headcount: 68 },
  { code: 'GB-03-以太工作室', name: '以太工作室', level: '03', parentCode: 'GB-02-游戏工作室群', manager: 'Ryan Wong', headcount: 53 },
  { code: 'GB-03-未来工作室', name: '未来工作室', level: '03', parentCode: 'GB-02-游戏工作室群', manager: '刘好峻', headcount: 46 },
  { code: 'GB-03-火星工作室', name: '火星工作室', level: '03', parentCode: 'GB-02-游戏工作室群', manager: '陈硕', headcount: 22 },
  { code: 'GB-03-新月工作室', name: '新月工作室', level: '03', parentCode: 'GB-02-游戏工作室群', manager: 'chen aki', headcount: 16 },
  { code: 'GB-03-阳明工作室', name: '阳明工作室', level: '03', parentCode: 'GB-02-游戏工作室群', manager: '杨晓曦', headcount: 25 },
  { code: 'GB-03-乘风工作室', name: '乘风工作室', level: '03', parentCode: 'GB-02-游戏工作室群', manager: '刘安文', headcount: 0 },
  { code: 'GB-03-圆周率工作室', name: '圆周率工作室', level: '03', parentCode: 'GB-02-游戏工作室群', manager: '黄亦辰', headcount: 54 },
  { code: 'GB-03-天智游工作室', name: '天智游工作室', level: '03', parentCode: 'GB-02-游戏工作室群', manager: '韩成', headcount: 123 },
  { code: 'GB-03-白海豚工作室', name: '白海豚工作室', level: '03', parentCode: 'GB-02-游戏工作室群', manager: '刘一', headcount: 0 },
  { code: 'GB-03-幻塔工作室', name: '幻塔工作室', level: '03', parentCode: 'GB-02-游戏工作室群', manager: '张御', headcount: 467 },
  { code: 'GB-02-桃花源工作室群', name: '桃花源工作室群', level: '02', parentCode: 'L1-GB', manager: '白雪', headcount: 399 },
  { code: 'GB-02-游戏美术平台中心', name: '游戏美术平台中心', level: '02', parentCode: 'L1-GB', manager: 'GU LI MING', headcount: 64 },
  { code: 'GB-02-游戏开发运维中心', name: '游戏开发运维中心', level: '02', parentCode: 'L1-GB', manager: '陈邦忠', headcount: 180 },
  { code: 'GB-02-游戏海外分公司', name: '游戏海外分公司', level: '02', parentCode: 'L1-GB', manager: 'GU LI MING', headcount: 13 },
  { code: 'GB-02-全球研运支持中心', name: '全球研运支持中心', level: '02', parentCode: 'L1-GB', manager: 'GU LI MING', headcount: 41 },
  { code: 'GB-02-技术应用中心', name: '技术应用中心', level: '02', parentCode: 'L1-GB', manager: '林建明', headcount: 39 },
  { code: 'GB-02-用户服务支持中心', name: '用户服务支持中心', level: '02', parentCode: 'L1-GB', manager: '王婷婷', headcount: 141 },
  { code: 'GB-03-CEO Office', name: 'CEO Office', level: '03', parentCode: 'L1-GB', manager: 'GU LI MING', headcount: 3 },
  { code: 'GB-02-游戏管理办公室', name: '游戏管理办公室', level: '02', parentCode: 'L1-GB', manager: '杨晓曦', headcount: 114 },
  { code: 'GB-02-法务平台', name: '法务平台', level: '02', parentCode: 'L1-GB', manager: '马弋琀', headcount: 18 },
  { code: 'GB-02-企业发展部', name: '企业发展部', level: '02', parentCode: 'L1-GB', manager: 'GU LI MING', headcount: 3 },
  { code: 'GB-02-游戏项目孵化中心', name: '游戏项目孵化中心', level: '02', parentCode: 'L1-GB', manager: '陈军', headcount: 0 },
  { code: 'GB-02-海外发行', name: '海外发行', level: '02', parentCode: 'L1-GB', manager: 'GU LI MING', headcount: 57 },
  { code: 'GB-02-国内发行', name: '国内发行', level: '02', parentCode: 'L1-GB', manager: 'GU LI MING', headcount: 161 },
  { code: 'GB-02-新品发行', name: '新品发行', level: '02', parentCode: 'L1-GB', manager: '庄泽武', headcount: 4 },

  { code: 'EP-02-Steam CN', name: 'Steam CN', level: '02', parentCode: 'L1-EP', manager: 'GU LI MING', headcount: 254 },

  { code: 'BACK-02-可持续发展与合作事业群', name: '可持续发展与合作事业群', level: '02', parentCode: 'L1-BACK', manager: 'XIAO HONG', headcount: 30 },
  { code: 'BACK-02-集团财务中心', name: '集团财务中心', level: '02', parentCode: 'L1-BACK', manager: '王祥玉', headcount: 16 },
  { code: 'BACK-02-综合管理', name: '综合管理', level: '02', parentCode: 'L1-BACK', manager: 'XIAO HONG', headcount: 4 },
  { code: 'BACK-02-创新业务支持平台', name: '创新业务支持平台', level: '02', parentCode: 'L1-BACK', manager: '王祥玉', headcount: 1 },

  { code: 'GD-03-综合办', name: '综合办', level: '03', parentCode: 'L1-GD', manager: 'CHEN RONG', headcount: 3 },
  { code: 'GD-03-信息技术支持部', name: '信息技术支持部（IT）', level: '03', parentCode: 'L1-GD', manager: '张克建', headcount: 13 },
  { code: 'GD-03-流程优化部', name: '流程优化部', level: '03', parentCode: 'L1-GD', manager: 'CHEN RONG', headcount: 2 },
  { code: 'GD-02-人力资源中心', name: '人力资源中心', level: '02', parentCode: 'L1-GD', manager: 'CHEN RONG', headcount: 38 },
  { code: 'GD-HR-03-合规监察部', name: '合规监察部', level: '03', parentCode: 'GD-02-人力资源中心', manager: '陈世杰', headcount: 3 },
  { code: 'GD-HR-03-MIS', name: '管理信息系统部（MIS）', level: '03', parentCode: 'GD-02-人力资源中心', manager: '李曦', headcount: 33 },
  { code: 'GD-HR-03-内控部', name: '内控部', level: '03', parentCode: 'GD-02-人力资源中心', manager: '付强', headcount: 4 },
  { code: 'GD-03-采购和供应商管理中心', name: '采购和供应商管理中心', level: '03', parentCode: 'L1-GD', manager: '权俪', headcount: 24 },
  { code: 'GD-02-集团战略研究与投资部', name: '集团战略研究与投资部', level: '02', parentCode: 'L1-GD', manager: '任鹏', headcount: 5 },
  { code: 'GD-03-E管理支持平台', name: 'E - 管理支持平台', level: '03', parentCode: 'L1-GD', manager: 'CHEN RONG', headcount: 3 },
  { code: 'GD-02-行政管理平台', name: '行政管理平台', level: '02', parentCode: 'L1-GD', manager: '王贵君', headcount: 33 },

  { code: 'GO-03-CA Office', name: 'CA Office', level: '03', parentCode: 'L1-GO', manager: '鲁晓寅', headcount: 3 },
  { code: 'GO-03-综合发展二部', name: '综合发展二部', level: '03', parentCode: 'L1-GO', manager: '贺迪', headcount: 2 },
  { code: 'GO-02-集团高管办', name: '集团高管办', level: '02', parentCode: 'L1-GO', manager: '池宇峰', headcount: 8 },
  { code: 'GO-GG-03-集团资本部', name: '集团资本部', level: '03', parentCode: 'GO-02-集团高管办', manager: '何伟', headcount: 1 },
  { code: 'GO-GG-03-综合发展部', name: '综合发展部', level: '03', parentCode: 'GO-02-集团高管办', manager: '张丹', headcount: 0 },
  { code: 'GO-GG-03-内审部', name: '内审部', level: '03', parentCode: 'GO-02-集团高管办', manager: '闫晗', headcount: 5 },
  { code: 'GO-GG-03-综合发展三部', name: '综合发展三部', level: '03', parentCode: 'GO-02-集团高管办', manager: '王薇', headcount: 1 },
  { code: 'GO-GG-03-全球泛娱乐业务', name: '全球泛娱乐业务', level: '03', parentCode: 'GO-02-集团高管办', manager: '佟庆', headcount: 1 },
  { code: 'GO-GG-03-高招办', name: '高招办', level: '03', parentCode: 'GO-02-集团高管办', manager: '池宇峰', headcount: 2 },
  { code: 'GO-02-证券事业部', name: '证券事业部', level: '02', parentCode: 'L1-GO', manager: '马骏', headcount: 6 },
  { code: 'GO-02-控股发展部', name: '控股发展部', level: '02', parentCode: 'L1-GO', manager: '王巍巍', headcount: 4 }
]

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const ceilQuota = (headcount: number) => Math.max(Math.ceil(Math.max(0, headcount) * 0.025), 1)

const normalizeRecords = (records: OrgRecord[]) => {
  return records.map((item) => ({
    ...item,
    transitionHcQuota: Number.isFinite(item.transitionHcQuota) ? Math.max(0, Number(item.transitionHcQuota)) : ceilQuota(item.headcount)
  }))
}

const loadDb = (): OrgRecord[] => {
  const raw = localStorage.getItem(ORG_DB_KEY)
  if (!raw) return []
  return normalizeRecords(JSON.parse(raw) as OrgRecord[])
}

const saveDb = (records: OrgRecord[]) => {
  localStorage.setItem(ORG_DB_KEY, JSON.stringify(normalizeRecords(records)))
}

const getRecordMap = (records: OrgRecord[]) => {
  const map = new Map<string, OrgRecord>()
  records.forEach((item) => map.set(item.code, item))
  return map
}

const getPath = (code: string, map: Map<string, OrgRecord>) => {
  const codes: string[] = []
  let current = map.get(code)
  while (current) {
    codes.unshift(current.code)
    current = current.parentCode ? map.get(current.parentCode) : undefined
  }
  return codes.join('/')
}

const getChildrenCodes = (records: OrgRecord[], parentCode: string) => {
  return records.filter((item) => item.parentCode === parentCode).map((item) => item.code)
}

const collectDescendantCodes = (records: OrgRecord[], rootCode: string): Set<string> => {
  const result = new Set<string>([rootCode])
  const stack = [rootCode]
  while (stack.length) {
    const current = stack.pop()!
    const children = getChildrenCodes(records, current)
    children.forEach((code) => {
      if (!result.has(code)) {
        result.add(code)
        stack.push(code)
      }
    })
  }
  return result
}

export const validateOrgArchitecture = (records: OrgRecord[]) => {
  const issues: string[] = []
  const map = getRecordMap(records)
  if (!map.has('01-PW')) {
    issues.push('缺少根节点 01-PW')
  }
  records.forEach((item) => {
    if (item.parentCode && !map.has(item.parentCode)) {
      issues.push(`节点 ${item.code} 的父级不存在`)
    }
    if (item.headcount < 0) {
      issues.push(`节点 ${item.code} 人数不能为负数`)
    }
    if (!Number.isFinite(item.transitionHcQuota ?? NaN) || (item.transitionHcQuota ?? 0) < 0) {
      issues.push(`节点 ${item.code} 额度非法`)
    }
  })
  const report = {
    valid: issues.length === 0,
    issues,
    totalNodes: records.length
  }
  localStorage.setItem(ORG_VALIDATION_REPORT_KEY, JSON.stringify(report))
  return report
}

export const initializeOrgArchitectureData = (force = false) => {
  const existed = loadDb()
  if (!existed.length || force) {
    saveDb(normalizeRecords(presetRecords))
  }
  return validateOrgArchitecture(loadDb().length ? loadDb() : presetRecords)
}

const toNode = (
  record: OrgRecord,
  records: OrgRecord[],
  map: Map<string, OrgRecord>,
  permittedCodes: Set<string>,
  expanded = false
): OrgNode => {
  const childRecords = records.filter((item) => item.parentCode === record.code)
  const canSelect = permittedCodes.has(record.code) && (record.level === '02' || record.level === '03') && record.headcount >= 0
  return {
    id: record.code,
    code: record.code,
    name: record.name,
    title: record.name,
    level: record.level,
    manager: record.manager,
    headcount: record.headcount,
    parentCode: record.parentCode,
    path: getPath(record.code, map),
    disabled: !canSelect,
    isLeaf: childRecords.length === 0,
    loaded: expanded,
    searchText: `${record.name}|${record.code}|${record.manager}|${record.headcount}`,
    children: expanded ? childRecords.map((item) => toNode(item, records, map, permittedCodes, false)) : undefined
  }
}

const getUserPermissionCodes = (records: OrgRecord[], userDeptCode: string) => {
  const map = getRecordMap(records)
  const dept = map.get(userDeptCode)
  if (!dept) return new Set<string>()
  let current: OrgRecord | undefined = dept
  while (current?.parentCode && map.get(current.parentCode)?.level !== '01') {
    current = map.get(current.parentCode)
  }
  const root = current?.code || userDeptCode
  return collectDescendantCodes(records, root)
}

const ensureInitialized = () => {
  if (!loadDb().length) {
    initializeOrgArchitectureData()
  }
}

export const getCurrentUserDeptCode = () => CURRENT_USER_DEPT_CODE

export const fetchOrgTree = async (userDeptCode = getCurrentUserDeptCode()): Promise<OrgNode[]> => {
  ensureInitialized()
  await wait(80)
  const records = loadDb()
  const map = getRecordMap(records)
  const permittedCodes = getUserPermissionCodes(records, userDeptCode)
  const root = records.find((item) => item.code === '01-PW')
  if (!root) return []
  const levelOne = records.filter((item) => item.parentCode === root.code)
  return levelOne.map((item) => toNode(item, records, map, permittedCodes, false))
}

export const fetchOrgChildren = async (
  parentCode: string,
  userDeptCode = getCurrentUserDeptCode()
): Promise<OrgNode[]> => {
  ensureInitialized()
  await wait(80)
  const records = loadDb()
  const map = getRecordMap(records)
  const permittedCodes = getUserPermissionCodes(records, userDeptCode)
  const children = records.filter((item) => item.parentCode === parentCode)
  return children.map((item) => toNode(item, records, map, permittedCodes, false))
}

export const fetchOrgNodeByCode = async (code: string): Promise<OrgNode | null> => {
  ensureInitialized()
  await wait(60)
  const records = loadDb()
  const map = getRecordMap(records)
  const target = map.get(code)
  if (!target) return null
  return toNode(target, records, map, new Set<string>([code]), true)
}

export const fetchDeptHeadcountFromOrg = async (deptCode: string): Promise<number> => {
  const node = await fetchOrgNodeByCode(deptCode)
  return node?.headcount ?? 0
}

export const fetchDeptQuotaFromOrg = async (deptCode: string): Promise<number> => {
  ensureInitialized()
  const records = loadDb()
  const target = records.find((item) => item.code === deptCode)
  if (!target) return 0
  return target.transitionHcQuota ?? ceilQuota(target.headcount)
}

const writeQuotaRecalcLog = (payload: {
  mode: 'full' | 'single'
  total: number
  success: number
  failed: number
  failures: Array<{ code: string; reason: string }>
}) => {
  const line = {
    ...payload,
    timestamp: new Date().toISOString()
  }
  const raw = localStorage.getItem(ORG_QUOTA_RECALC_LOG_KEY)
  const logs = raw ? JSON.parse(raw) : []
  logs.unshift(line)
  localStorage.setItem(ORG_QUOTA_RECALC_LOG_KEY, JSON.stringify(logs.slice(0, 100)))
  return line
}

const writeQuotaAlert = (message: string) => {
  const raw = localStorage.getItem(ORG_QUOTA_ALERT_LOG_KEY)
  const logs = raw ? JSON.parse(raw) : []
  logs.unshift({
    message,
    timestamp: new Date().toISOString()
  })
  localStorage.setItem(ORG_QUOTA_ALERT_LOG_KEY, JSON.stringify(logs.slice(0, 200)))
}

const withTransaction = async <T,>(action: () => T): Promise<T> => {
  ensureInitialized()
  const snapshot = loadDb()
  try {
    return action()
  } catch (error) {
    saveDb(snapshot)
    throw error
  }
}

export const recalculateTransitionHcQuota = async (deptCode?: string) => {
  return withTransaction(() => {
    const records = loadDb()
    const targets = deptCode ? records.filter((item) => item.code === deptCode) : records
    const failures: Array<{ code: string; reason: string }> = []
    let success = 0
    const next = records.map((item) => {
      if (deptCode && item.code !== deptCode) return item
      try {
        const quota = ceilQuota(item.headcount)
        success += 1
        return {
          ...item,
          transitionHcQuota: quota
        }
      } catch (error: any) {
        failures.push({ code: item.code, reason: error?.message || 'unknown' })
        return item
      }
    })
    saveDb(next)
    return writeQuotaRecalcLog({
      mode: deptCode ? 'single' : 'full',
      total: targets.length,
      success,
      failed: failures.length,
      failures
    })
  })
}

export const updateDepartmentHeadcount = async (deptCode: string, headcount: number) => {
  return withTransaction(() => {
    const records = loadDb()
    const index = records.findIndex((item) => item.code === deptCode)
    if (index === -1) {
      throw new Error('部门不存在')
    }
    const next = [...records]
    next[index] = {
      ...next[index],
      headcount,
      transitionHcQuota: ceilQuota(headcount)
    }
    saveDb(next)
    return next[index]
  }).catch((error: any) => {
    writeQuotaAlert(`部门人数更新失败: ${deptCode}, ${error?.message || 'unknown'}`)
    throw error
  })
}

export const runDailyQuotaConsistencyJob = async () => {
  const records = loadDb()
  const mismatched = records.filter((item) => (item.transitionHcQuota ?? 0) !== ceilQuota(item.headcount))
  if (!mismatched.length) {
    return {
      repaired: 0,
      details: []
    }
  }
  const details = mismatched.map((item) => ({
    code: item.code,
    oldQuota: item.transitionHcQuota ?? 0,
    newQuota: ceilQuota(item.headcount)
  }))
  await recalculateTransitionHcQuota()
  writeQuotaAlert(`每日校验修复 ${details.length} 个部门额度`)
  return {
    repaired: details.length,
    details
  }
}

export const createOrgNode = async (payload: OrgRecord) => {
  ensureInitialized()
  const records = loadDb()
  if (records.some((item) => item.code === payload.code)) {
    throw new Error('组织编码已存在')
  }
  const next = [...records, { ...payload, transitionHcQuota: payload.transitionHcQuota ?? ceilQuota(payload.headcount) }]
  const report = validateOrgArchitecture(next)
  if (!report.valid) {
    throw new Error('组织数据校验失败')
  }
  saveDb(next)
  return payload
}

export const updateOrgNode = async (code: string, patch: Partial<OrgRecord>) => {
  ensureInitialized()
  const records = loadDb()
  const next = records.map((item) => {
    if (item.code !== code) return item
    const merged = { ...item, ...patch, code: item.code }
    return {
      ...merged,
      transitionHcQuota: patch.headcount !== undefined ? ceilQuota(merged.headcount) : merged.transitionHcQuota
    }
  })
  const report = validateOrgArchitecture(next)
  if (!report.valid) {
    throw new Error('组织数据校验失败')
  }
  saveDb(next)
  return next.find((item) => item.code === code) || null
}

export const deleteOrgNode = async (code: string) => {
  ensureInitialized()
  const records = loadDb()
  const descendants = collectDescendantCodes(records, code)
  const next = records.filter((item) => !descendants.has(item.code))
  const report = validateOrgArchitecture(next)
  if (!report.valid) {
    throw new Error('组织数据校验失败')
  }
  saveDb(next)
  return true
}
