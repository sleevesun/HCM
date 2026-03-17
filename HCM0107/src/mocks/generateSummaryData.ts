import type { AdjustmentSummaryItem } from './budgetData'

type StaffBreakdown = { reg: number; intern: number; outsource: number; dispatch: number; partTime: number }
type DeptBudget = { severance: number; overtime: number; signOn: number }

const round = (value: number) => Number(value.toFixed(1))

const createEmptyMetric = () => ({
  hc: { reg: 0, intern: 0, outsource: 0, dispatch: 0, partTime: 0 },
  salary: { month: 0, year: 0 },
  salaryBreakdown: { reg: 0, intern: 0, outsource: 0, dispatch: 0, partTime: 0 },
  monthSalaryBreakdown: { reg: 0, intern: 0, outsource: 0, dispatch: 0, partTime: 0 },
  deptBudget: { severance: 0, overtime: 0, signOn: 0 }
})

const addMetrics = (a: ReturnType<typeof createEmptyMetric>, b: ReturnType<typeof createEmptyMetric>) => ({
  hc: {
    reg: round(a.hc.reg + b.hc.reg),
    intern: round(a.hc.intern + b.hc.intern),
    outsource: round(a.hc.outsource + b.hc.outsource),
    dispatch: round(a.hc.dispatch + b.hc.dispatch),
    partTime: round(a.hc.partTime + b.hc.partTime)
  },
  salary: {
    month: round(a.salary.month + b.salary.month),
    year: round(a.salary.year + b.salary.year)
  },
  salaryBreakdown: {
    reg: round(a.salaryBreakdown.reg + b.salaryBreakdown.reg),
    intern: round(a.salaryBreakdown.intern + b.salaryBreakdown.intern),
    outsource: round(a.salaryBreakdown.outsource + b.salaryBreakdown.outsource),
    dispatch: round(a.salaryBreakdown.dispatch + b.salaryBreakdown.dispatch),
    partTime: round(a.salaryBreakdown.partTime + b.salaryBreakdown.partTime)
  },
  monthSalaryBreakdown: {
    reg: round(a.monthSalaryBreakdown.reg + b.monthSalaryBreakdown.reg),
    intern: round(a.monthSalaryBreakdown.intern + b.monthSalaryBreakdown.intern),
    outsource: round(a.monthSalaryBreakdown.outsource + b.monthSalaryBreakdown.outsource),
    dispatch: round(a.monthSalaryBreakdown.dispatch + b.monthSalaryBreakdown.dispatch),
    partTime: round(a.monthSalaryBreakdown.partTime + b.monthSalaryBreakdown.partTime)
  },
  deptBudget: {
    severance: round(a.deptBudget.severance + b.deptBudget.severance),
    overtime: round(a.deptBudget.overtime + b.deptBudget.overtime),
    signOn: round(a.deptBudget.signOn + b.deptBudget.signOn)
  }
})

const diffMetrics = (post: ReturnType<typeof createEmptyMetric>, pre: ReturnType<typeof createEmptyMetric>) => ({
  hc: {
    reg: round(post.hc.reg - pre.hc.reg),
    intern: round(post.hc.intern - pre.hc.intern),
    outsource: round(post.hc.outsource - pre.hc.outsource),
    dispatch: round(post.hc.dispatch - pre.hc.dispatch),
    partTime: round(post.hc.partTime - pre.hc.partTime)
  },
  salary: {
    month: round(post.salary.month - pre.salary.month),
    year: round(post.salary.year - pre.salary.year)
  },
  salaryBreakdown: {
    reg: round(post.salaryBreakdown.reg - pre.salaryBreakdown.reg),
    intern: round(post.salaryBreakdown.intern - pre.salaryBreakdown.intern),
    outsource: round(post.salaryBreakdown.outsource - pre.salaryBreakdown.outsource),
    dispatch: round(post.salaryBreakdown.dispatch - pre.salaryBreakdown.dispatch),
    partTime: round(post.salaryBreakdown.partTime - pre.salaryBreakdown.partTime)
  },
  monthSalaryBreakdown: {
    reg: round(post.monthSalaryBreakdown.reg - pre.monthSalaryBreakdown.reg),
    intern: round(post.monthSalaryBreakdown.intern - pre.monthSalaryBreakdown.intern),
    outsource: round(post.monthSalaryBreakdown.outsource - pre.monthSalaryBreakdown.outsource),
    dispatch: round(post.monthSalaryBreakdown.dispatch - pre.monthSalaryBreakdown.dispatch),
    partTime: round(post.monthSalaryBreakdown.partTime - pre.monthSalaryBreakdown.partTime)
  },
  deptBudget: {
    severance: round(post.deptBudget.severance - pre.deptBudget.severance),
    overtime: round(post.deptBudget.overtime - pre.deptBudget.overtime),
    signOn: round(post.deptBudget.signOn - pre.deptBudget.signOn)
  }
})

const buildMetric = (hc: StaffBreakdown, monthSalary: StaffBreakdown, deptBudget: DeptBudget) => {
  const salaryBreakdown = {
    reg: round(monthSalary.reg * 12),
    intern: round(monthSalary.intern * 12),
    outsource: round(monthSalary.outsource * 12),
    dispatch: round(monthSalary.dispatch * 12),
    partTime: round(monthSalary.partTime * 12)
  }
  return {
    hc,
    salary: {
      month: round(monthSalary.reg + monthSalary.intern + monthSalary.outsource + monthSalary.dispatch + monthSalary.partTime),
      year: round(salaryBreakdown.reg + salaryBreakdown.intern + salaryBreakdown.outsource + salaryBreakdown.dispatch + salaryBreakdown.partTime)
    },
    salaryBreakdown,
    monthSalaryBreakdown: monthSalary,
    deptBudget
  }
}

const createLeafNode = (
  id: string,
  deptName: string,
  preHc: StaffBreakdown,
  postHc: StaffBreakdown,
  preMonth: StaffBreakdown,
  postMonth: StaffBreakdown,
  preDeptBudget: DeptBudget,
  postDeptBudget: DeptBudget
): AdjustmentSummaryItem => {
  const pre = buildMetric(preHc, preMonth, preDeptBudget)
  const post = buildMetric(postHc, postMonth, postDeptBudget)
  const diff = diffMetrics(post, pre)
  return { id, deptName, pre, post, diff }
}

const aggregateNode = (id: string, deptName: string, children: AdjustmentSummaryItem[]): AdjustmentSummaryItem => {
  const pre = children.reduce((acc, cur) => addMetrics(acc, cur.pre), createEmptyMetric())
  const post = children.reduce((acc, cur) => addMetrics(acc, cur.post), createEmptyMetric())
  const diff = diffMetrics(post, pre)
  return { id, deptName, children, pre, post, diff }
}

export const generateSummaryDataTree = (): AdjustmentSummaryItem[] => {
  const ops = createLeafNode(
    'D449857',
    '运营部',
    { reg: 20, intern: 2, outsource: 5, dispatch: 2, partTime: 1 },
    { reg: 21, intern: 2, outsource: 5, dispatch: 2, partTime: 2 },
    { reg: 58.0, intern: 1.2, outsource: 8.0, dispatch: 3.0, partTime: 0.6 },
    { reg: 61.0, intern: 1.2, outsource: 8.0, dispatch: 3.0, partTime: 1.2 },
    { severance: 4.0, overtime: 2.0, signOn: 1.0 },
    { severance: 4.0, overtime: 3.0, signOn: 1.0 }
  )
  const qa = createLeafNode(
    'D127299',
    '测试部',
    { reg: 18, intern: 3, outsource: 6, dispatch: 2, partTime: 1 },
    { reg: 18, intern: 3, outsource: 7, dispatch: 2, partTime: 1 },
    { reg: 52.0, intern: 1.8, outsource: 9.0, dispatch: 3.0, partTime: 0.6 },
    { reg: 52.0, intern: 1.8, outsource: 10.5, dispatch: 3.0, partTime: 0.6 },
    { severance: 5.0, overtime: 2.0, signOn: 0.5 },
    { severance: 5.0, overtime: 2.5, signOn: 0.5 }
  )
  const planning = createLeafNode(
    'D119245',
    '策划部',
    { reg: 16, intern: 2, outsource: 4, dispatch: 1, partTime: 2 },
    { reg: 17, intern: 2, outsource: 4, dispatch: 1, partTime: 2 },
    { reg: 50.0, intern: 1.2, outsource: 6.0, dispatch: 1.5, partTime: 1.2 },
    { reg: 53.0, intern: 1.2, outsource: 6.0, dispatch: 1.5, partTime: 1.2 },
    { severance: 3.0, overtime: 1.5, signOn: 1.0 },
    { severance: 3.0, overtime: 2.0, signOn: 1.0 }
  )
  const client = createLeafNode(
    'D177047',
    '客户端',
    { reg: 22, intern: 1, outsource: 3, dispatch: 1, partTime: 1 },
    { reg: 22, intern: 1, outsource: 3, dispatch: 2, partTime: 1 },
    { reg: 67.0, intern: 0.6, outsource: 4.5, dispatch: 1.5, partTime: 0.6 },
    { reg: 67.0, intern: 0.6, outsource: 4.5, dispatch: 3.0, partTime: 0.6 },
    { severance: 3.0, overtime: 2.0, signOn: 0.5 },
    { severance: 3.0, overtime: 2.5, signOn: 0.5 }
  )
  const server = createLeafNode(
    'D255624',
    '服务器',
    { reg: 24, intern: 2, outsource: 5, dispatch: 2, partTime: 1 },
    { reg: 25, intern: 2, outsource: 5, dispatch: 2, partTime: 1 },
    { reg: 72.0, intern: 1.2, outsource: 7.5, dispatch: 3.0, partTime: 0.6 },
    { reg: 75.0, intern: 1.2, outsource: 7.5, dispatch: 3.0, partTime: 0.6 },
    { severance: 4.0, overtime: 2.5, signOn: 1.5 },
    { severance: 4.5, overtime: 3.0, signOn: 1.5 }
  )
  const art = createLeafNode(
    'D597539',
    '美术部',
    { reg: 19, intern: 3, outsource: 4, dispatch: 2, partTime: 2 },
    { reg: 20, intern: 3, outsource: 4, dispatch: 2, partTime: 2 },
    { reg: 57.0, intern: 1.8, outsource: 6.0, dispatch: 3.0, partTime: 1.2 },
    { reg: 60.0, intern: 1.8, outsource: 6.0, dispatch: 3.0, partTime: 1.2 },
    { severance: 4.0, overtime: 2.0, signOn: 1.0 },
    { severance: 4.0, overtime: 2.5, signOn: 1.0 }
  )

  const root = aggregateNode('ROOT', '星云工作室', [ops, qa, planning, client, server, art])
  return [root]
}
