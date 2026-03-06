
import largeScaleData from './largeScaleBudgetData.json';

export interface AdjustmentSummaryItem {
  id: string;
  deptName: string; // 申请部门
  // 申请前
  pre: {
    hc: { reg: number; other: number };
    salary: { month: number; year: number };
  };
  // 申请通过后
  post: {
    hc: { reg: number; other: number };
    salary: { month: number; year: number };
  };
  // 变化
  diff: {
    hc: { reg: number; other: number };
    salary: { month: number; year: number };
  };
}

export interface BudgetItem {
  id: string;
  name: string;
  type: 'group' | 'dept' | 'person';
  tag?: 'REG' | 'INT' | 'OUT' | 'DIS' | 'PTE'; // 正编, 实习, 外包, 派遣, 兼职
  tagName?: string;
  children?: BudgetItem[];
  // Monthly Data (1-12)
  months: {
    [key: number]: {
      salary: number;
      project?: string;
    };
  };
  totalYear: number;
  // Extended fields for popover
  phone?: string;
  email?: string;
  idCard?: string;
  jobTitle?: string;
  rank?: string;
  dataSource?: string;
  createTime?: number;
}

export const summaryData: AdjustmentSummaryItem[] = [
  {
    id: '1',
    deptName: '游戏工作室群/原石工作室',
    pre: { hc: { reg: 45, other: 1 }, salary: { month: 380.9, year: 4562.1 } },
    post: { hc: { reg: 46, other: 1 }, salary: { month: 388.7, year: 4655.3 } },
    diff: { hc: { reg: 1, other: 0 }, salary: { month: 7.8, year: 93.2 } },
  },
  {
    id: '2',
    deptName: '运营部',
    pre: { hc: { reg: 9, other: 0 }, salary: { month: 52.6, year: 630.1 } },
    post: { hc: { reg: 9, other: 0 }, salary: { month: 52.6, year: 630.1 } },
    diff: { hc: { reg: 0, other: 0 }, salary: { month: 0, year: 0 } },
  },
  {
    id: '3',
    deptName: '测试部',
    pre: { hc: { reg: 5, other: 0 }, salary: { month: 22.2, year: 265.5 } },
    post: { hc: { reg: 5, other: 0 }, salary: { month: 22.2, year: 265.5 } },
    diff: { hc: { reg: 0, other: 0 }, salary: { month: 0, year: 0 } },
  },
  {
    id: '4',
    deptName: '策划部',
    pre: { hc: { reg: 9, other: 0 }, salary: { month: 69.3, year: 829.8 } },
    post: { hc: { reg: 10, other: 0 }, salary: { month: 77.1, year: 923.0 } },
    diff: { hc: { reg: 1, other: 0 }, salary: { month: 7.8, year: 93.2 } },
  },
  {
    id: '5',
    deptName: '客户端',
    pre: { hc: { reg: 4, other: 0 }, salary: { month: 32.0, year: 383.7 } },
    post: { hc: { reg: 4, other: 0 }, salary: { month: 32.0, year: 383.7 } },
    diff: { hc: { reg: 0, other: 0 }, salary: { month: 0, year: 0 } },
  },
];

const generateMonthlyData = (baseSalary: number) => {
  const months: any = {};
  for (let i = 1; i <= 12; i++) {
    months[i] = {
      salary: baseSalary,
      project: '项目A'
    };
  }
  return months;
};

const asSalary = (value: any): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

const buildEmptyMonths = () => {
  const months: Record<number, { salary: number; project?: string }> = {}
  for (let i = 1; i <= 12; i++) {
    months[i] = { salary: 0 }
  }
  return months
}

const isSpecialHcPerson = (item: BudgetItem) => {
  return item.type === 'person' && (item.name === 'NEW HC' || item.name === '过渡期HC')
}

const sortDeptChildren = (children: BudgetItem[]) => {
  return [...children].sort((a, b) => {
    const aSpecial = isSpecialHcPerson(a)
    const bSpecial = isSpecialHcPerson(b)
    if (aSpecial === bSpecial) return 0
    return aSpecial ? 1 : -1
  })
}

const recalcTree = (item: BudgetItem): { months: Record<number, { salary: number; project?: string }>; hcCount: number } => {
  if (item.type === 'person') {
    const nextMonths = buildEmptyMonths()
    for (let m = 1; m <= 12; m++) {
      const salary = asSalary(item.months?.[m]?.salary)
      nextMonths[m] = { ...item.months?.[m], salary }
    }
    item.months = nextMonths
    item.totalYear = Number(Object.values(nextMonths).reduce((sum, entry) => sum + asSalary(entry.salary), 0).toFixed(1))
    return { months: nextMonths, hcCount: 1 }
  }

  const children = item.children ?? []
  const normalizedChildren = item.type === 'dept' ? sortDeptChildren(children) : children
  item.children = normalizedChildren

  const aggregateMonths = buildEmptyMonths()
  let aggregateHcCount = 0

  for (const child of normalizedChildren) {
    const childAggregate = recalcTree(child)
    aggregateHcCount += childAggregate.hcCount
    for (let m = 1; m <= 12; m++) {
      aggregateMonths[m].salary += asSalary(childAggregate.months[m]?.salary)
    }
  }

  item.months = aggregateMonths
  item.totalYear = Number(Object.values(aggregateMonths).reduce((sum, entry) => sum + asSalary(entry.salary), 0).toFixed(1))
  ;(item as any).hcCount = aggregateHcCount
  ;(item as any).totalSalary = Number((item.totalYear * 1.4).toFixed(1))

  return { months: aggregateMonths, hcCount: aggregateHcCount }
}

const buildBeforeData = () => {
  const data: BudgetItem[] = JSON.parse(JSON.stringify(largeScaleData))
  const root = data.find((group: any) => group.id === 'ROOT')
  const opsDept = root?.children?.find((dept: any) => dept.name === '运营部')

  if (opsDept && Array.isArray(opsDept.children)) {
    opsDept.children.push({
      id: 'THC_MOCK_001',
      name: '过渡期HC',
      type: 'person',
      tag: 'REG',
      tagName: '正编',
      rank: 'P6',
      jobTitle: '高级美术设计师',
      months: {
        1: { salary: 0 }, 2: { salary: 0 },
        3: { salary: 23.0 }, 4: { salary: 23.0 }, 5: { salary: 23.0 }, 6: { salary: 23.0 },
        7: { salary: 0 }, 8: { salary: 0 }, 9: { salary: 0 }, 10: { salary: 0 }, 11: { salary: 0 }, 12: { salary: 0 }
      },
      totalYear: 92.0,
      dataSource: 'MOCK_PERSISTENCE_THC_001',
      createTime: 1772780000000
    })
    opsDept.children.push({
      id: 'THC_MOCK_002',
      name: '过渡期HC',
      type: 'person',
      tag: 'REG',
      tagName: '正编',
      rank: 'P7',
      jobTitle: '资深美术专家',
      months: {
        1: { salary: 0 }, 2: { salary: 0 },
        3: { salary: 31.0 }, 4: { salary: 31.0 }, 5: { salary: 31.0 },
        6: { salary: 0 }, 7: { salary: 0 }, 8: { salary: 0 }, 9: { salary: 0 }, 10: { salary: 0 }, 11: { salary: 0 }, 12: { salary: 0 }
      },
      totalYear: 93.0,
      dataSource: 'MOCK_PERSISTENCE_THC_002',
      createTime: 1772780000000
    })
  }

  data.forEach((group) => recalcTree(group))
  return data
}

const buildAfterData = () => {
  const data: BudgetItem[] = JSON.parse(JSON.stringify(largeScaleData))
  data.forEach((group: any) => {
    if (group.children) {
      group.children.forEach((dept: any) => {
        if (dept.type === 'dept') {
          if (!dept.children) dept.children = []
          for (let i = 1; i <= 2; i++) {
            dept.children.push({
              id: `${dept.id}_new_hc_${i}`,
              name: 'NEW HC',
              type: 'person',
              tag: 'REG',
              tagName: '正编',
              totalYear: 93.2,
              months: generateMonthlyData(7.8)
            })
          }
        }
      })
    }
  })
  data.forEach((group) => recalcTree(group))
  return data
}

export const detailDataBefore: BudgetItem[] = buildBeforeData()
export const detailDataAfter: BudgetItem[] = buildAfterData()

export interface StaffInfo {
  empId: string;
  name: string;
  deptName: string;
  projectTag: string;
  rank: string;
  socialLocation: string;
  workLocation: string;
  salaryBase?: number; // Added to store actual salary
}

// Flatten staff data from detailDataBefore
const flattenStaff = (items: BudgetItem[], currentDeptName: string = ''): StaffInfo[] => {
  let list: StaffInfo[] = [];
  for (const item of items) {
    if (item.type === 'person') {
      list.push({
        empId: item.id.replace('E_', 'E').substring(0, 8), // Simplify ID format
        name: item.name,
        deptName: currentDeptName,
        projectTag: item.months[1]?.project || '通用项目',
        rank: item.rank || 'P6',
        socialLocation: '北京', // Default or derived mock value
        workLocation: '北京',   // Default or derived mock value
        salaryBase: item.months[1]?.salary || 0
      });
    } else if (item.children) {
      list = list.concat(flattenStaff(item.children, item.type === 'dept' ? item.name : currentDeptName));
    }
  }
  return list;
};

const fullStaffList: StaffInfo[] = flattenStaff(detailDataBefore);

export const searchStaff = (keyword: string): Promise<StaffInfo[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!keyword) resolve([]);
      const lowerKeyword = keyword.toLowerCase();
      const results = fullStaffList.filter(
        (staff) => staff.name.toLowerCase().includes(lowerKeyword) || staff.empId.toLowerCase().includes(lowerKeyword)
      );
      resolve(results);
    }, 500); // 增加网络延迟模拟 500ms
  });
};

export const pickRandomStaff = (): StaffInfo | null => {
  if (!fullStaffList.length) return null
  const index = Math.floor(Math.random() * fullStaffList.length)
  return fullStaffList[index]
}
