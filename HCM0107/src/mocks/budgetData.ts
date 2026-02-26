
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

// Use the generated large scale data
export const detailDataBefore: BudgetItem[] = largeScaleData as any;

export const detailDataAfter: BudgetItem[] = [
   {
    id: 'g1_after',
    name: '原云工作室',
    type: 'group',
    totalYear: 4655.3,
    months: generateMonthlyData(388.7),
    children: [
      {
        id: 'd1_after',
        name: '运营部',
        type: 'dept',
        totalYear: 3970.9,
        months: generateMonthlyData(330.9),
        children: [
          {
            id: 'p1_after',
            name: '陈力文',
            type: 'person',
            tag: 'REG',
            tagName: '正编',
            totalYear: 124.8,
            months: generateMonthlyData(10.4)
          },
          // ... (Same people)
          {
             id: 'p_new',
             name: '新员工(待定)',
             type: 'person',
             tag: 'REG',
             tagName: '正编',
             totalYear: 93.2,
             months: generateMonthlyData(7.8) // New person
          }
        ]
      }
    ]
   }
];
