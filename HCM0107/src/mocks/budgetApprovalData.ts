
// Budget Approval Data Mock

export interface BudgetChangeItem {
  label: string;
  before: string | number;
  after: string | number;
  change: string | number;
  changeType: 'positive' | 'negative' | 'neutral'; // positive (red/increase), negative (green/decrease), neutral (gray/no change)
}

export interface BudgetMetricGroup {
  title: string;
  items: {
    name: string;
    details: BudgetChangeItem[];
  }[];
}

export interface BudgetPersonnelGroup {
  name: string;
  color: string; // e.g., 'blue', 'gray', 'orange'
  metrics: {
    label: string;
    before: string | number;
    after: string | number;
    change: string | number;
    changeType: 'positive' | 'negative' | 'neutral';
  }[];
}

export const basicInfo = {
  type: '2026年预算编制',
  department: '远景工作室',
  applicant: '张三 (2025-10-10)',
};

// 方案一：按指标模块数据
export const metricViewData: BudgetMetricGroup[] = [
  {
    title: 'HC变化',
    items: [
      {
        name: 'HC',
        details: [
          { label: '正编', before: 50, after: 54, change: '+4', changeType: 'positive' },
          { label: '实习', before: 5, after: 5, change: '0', changeType: 'neutral' },
          { label: '人力外包', before: 15, after: 20, change: '+5', changeType: 'positive' },
          { label: '其他', before: 2, after: 0, change: '-2', changeType: 'negative' },
        ],
      },
    ],
  },
  {
    title: '月度工薪预算变化（万）',
    items: [
      {
        name: '月度工薪',
        details: [
          { label: '正编', before: '150.0', after: '165.0', change: '+15.0', changeType: 'positive' },
          { label: '实习', before: '2.0', after: '2.0', change: '0', changeType: 'neutral' },
          { label: '人力外包', before: '20.0', after: '26.5', change: '+6.5', changeType: 'positive' },
          { label: '其他', before: '0.5', after: '0', change: '-0.5', changeType: 'negative' },
        ],
      },
    ],
  },
  {
    title: '年度工薪预算变化（万）',
    items: [
      {
        name: '年度工薪',
        details: [
          { label: '正编', before: '1,800.0', after: '1,980.0', change: '+180.0', changeType: 'positive' },
          { label: '实习', before: '24.0', after: '24.0', change: '0', changeType: 'neutral' },
          { label: '人力外包', before: '240.0', after: '318.0', change: '+78.0', changeType: 'positive' },
          { label: '其他', before: '6.0', after: '0', change: '-6.0', changeType: 'negative' },
        ],
      },
    ],
  },
  {
    title: '部门级预算变化（万）',
    items: [
      {
        name: '部门级预算',
        details: [
          { label: '离职补偿金', before: '50.0', after: '70.0', change: '+20.0', changeType: 'positive' },
          { label: '加班费', before: '20.0', after: '15.0', change: '-5.0', changeType: 'negative' },
        ],
      },
    ],
  },
];

// 方案二：按人员类别数据
export const personnelViewData: BudgetPersonnelGroup[] = [
  {
    name: '正编',
    color: '#3B82F6', // blue-500
    metrics: [
      { label: 'HC', before: 50, after: 54, change: '+4', changeType: 'positive' },
      { label: '月度工薪(万)', before: '150.0', after: '165.0', change: '+15.0', changeType: 'positive' },
      { label: '年度工薪(万)', before: '1,800.0', after: '1,980.0', change: '+180.0', changeType: 'positive' },
      { label: '离职补偿金(万)', before: '50.0', after: '70.0', change: '+20.0', changeType: 'positive' },
      { label: '加班费(万)', before: '20.0', after: '15.0', change: '-5.0', changeType: 'negative' },
    ],
  },
  {
    name: '实习',
    color: '#9CA3AF', // gray-400
    metrics: [
      { label: 'HC', before: 5, after: 5, change: '0', changeType: 'neutral' },
      { label: '月度工薪(万)', before: '2.0', after: '2.0', change: '0', changeType: 'neutral' },
      { label: '年度工薪(万)', before: '24.0', after: '24.0', change: '0', changeType: 'neutral' },
    ],
  },
  {
    name: '人力外包',
    color: '#FB923C', // orange-400
    metrics: [
      { label: 'HC', before: 15, after: 20, change: '+5', changeType: 'positive' },
      { label: '月度工薪(万)', before: '20.0', after: '26.5', change: '+6.5', changeType: 'positive' },
      { label: '年度工薪(万)', before: '240.0', after: '318.0', change: '+78.0', changeType: 'positive' },
    ],
  },
  {
    name: '其他人员',
    color: '#9CA3AF', // gray-400
    metrics: [
      { label: 'HC', before: 2, after: 0, change: '-2', changeType: 'negative' },
      { label: '月度工薪(万)', before: '0.5', after: '0', change: '-0.5', changeType: 'negative' },
      { label: '年度工薪(万)', before: '6.0', after: '0', change: '-6.0', changeType: 'negative' },
    ],
  },
  {
    name: '总计',
    color: '#1F2937', // gray-800
    metrics: [
      { label: '年度工薪(万)', before: '2,070.0', after: '2,322.0', change: '+252.0', changeType: 'positive' },
    ],
  },
];
