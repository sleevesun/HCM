/**
 * 员工类型配置
 * 定义5种员工类型的名称、图标、颜色和索引
 */

/**
 * 员工类型接口
 */
export interface EmployeeType {
  /** 唯一标识 */
  key: string
  /** 显示名称 */
  name: string
  /** 图标（emoji） */
  icon: string
  /** 主题色 */
  color: string
  /** 在数据数组中的索引 */
  index: number
  /** 描述/别名 */
  aliases?: string[]
}

/**
 * 员工类型配置数组
 * 按照在数据数组中的顺序排列
 */
export const EMPLOYEE_TYPES: readonly EmployeeType[] = [
  {
    key: 'reg',
    name: '正编',
    icon: '👤',
    color: '#165DFF',
    index: 0,
    aliases: ['正式员工', '正式编制']
  },
  {
    key: 'intern',
    name: '实习',
    icon: '🎓',
    color: '#00B42A',
    index: 1,
    aliases: ['实习生']
  },
  {
    key: 'dispatch',
    name: '劳务派遣',
    icon: '🔄',
    color: '#FF7D00',
    index: 2,
    aliases: ['派遣', '派遣员工']
  },
  {
    key: 'outsourcing',
    name: '人力外包',
    icon: '📦',
    color: '#722ED1',
    index: 3,
    aliases: ['外包', '外包员工']
  },
  {
    key: 'parttime',
    name: '兼职',
    icon: '⏱️',
    color: '#86909C',
    index: 4,
    aliases: ['兼职员工', '临时工']
  }
] as const

/**
 * 根据 key 获取员工类型配置
 */
export function getEmployeeTypeByKey(key: string): EmployeeType | undefined {
  return EMPLOYEE_TYPES.find(type => type.key === key)
}

/**
 * 根据索引获取员工类型配置
 */
export function getEmployeeTypeByIndex(index: number): EmployeeType | undefined {
  return EMPLOYEE_TYPES.find(type => type.index === index)
}

/**
 * 获取员工类型的显示名称（带图标）
 */
export function getEmployeeTypeLabel(type: EmployeeType): string {
  return `${type.icon} ${type.name}`
}

/**
 * 获取员工类型的显示文本（用于列表）
 */
export function getEmployeeTypeOptions(): Array<{ label: string; value: string }> {
  return EMPLOYEE_TYPES.map(type => ({
    label: getEmployeeTypeLabel(type),
    value: type.key
  }))
}

/**
 * 根据数据值数组计算员工类型的总HC
 */
export function calculateTotalHC(values: number[]): number {
  return values.reduce((sum, value) => sum + (value || 0), 0)
}

/**
 * 计算特定员工类型的HC变化百分比
 */
export function calculateHCChange(current: number, target: number): number {
  if (current === 0) return 0
  return ((target - current) / current) * 100
}

/**
 * 获取HC变化的颜色类名
 * 正增长=红色（风险），负增长=绿色（优化），无变化=灰色
 */
export function getHCChangeColorClass(changePercent: number): string {
  if (changePercent > 0) return 'text-red'
  if (changePercent < 0) return 'text-green'
  return ''
}

/**
 * 格式化HC变化显示文本
 */
export function formatHCChange(current: number, target: number): string {
  const diff = target - current
  const percent = calculateHCChange(current, target)
  const sign = diff > 0 ? '+' : ''
  return `${sign}${diff} (${sign}${percent.toFixed(1)}%)`
}

/**
 * 员工类型颜色映射（用于图表等场景）
 */
export const EMPLOYEE_TYPE_COLORS = EMPLOYEE_TYPES.reduce((acc, type) => {
  acc[type.key] = type.color
  return acc
}, {} as Record<string, string>)

/**
 * 员工类型图标映射
 */
export const EMPLOYEE_TYPE_ICONS = EMPLOYEE_TYPES.reduce((acc, type) => {
  acc[type.key] = type.icon
  return acc
}, {} as Record<string, string>)

/**
 * 员工类型名称映射
 */
export const EMPLOYEE_TYPE_NAMES = EMPLOYEE_TYPES.reduce((acc, type) => {
  acc[type.key] = type.name
  return acc
}, {} as Record<string, string>)
