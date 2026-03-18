export type BudgetChangeType = 'positive' | 'negative' | 'neutral'

export interface BudgetBasicInfo {
  type: string
  department: string
  applicant: string
}

export interface BudgetMetricDetail {
  label: string
  before: string
  after: string
  change: string
  changeType: BudgetChangeType
}

export interface BudgetMetricSection {
  title: string
  details: BudgetMetricDetail[]
}

export interface BudgetPersonnelMetric {
  label: string
  before: string
  after: string
  change: string
  changeType: BudgetChangeType
}

export interface BudgetPersonnelSection {
  name: string
  color: string
  metrics: BudgetPersonnelMetric[]
}

export interface BudgetApprovalMobileData {
  basicInfo: BudgetBasicInfo
  metricSections: BudgetMetricSection[]
  personnelSections: BudgetPersonnelSection[]
}

export interface BudgetScenarioThreeSummaryMetric {
  label: string
  before: string
  after: string
  change: string
  changeType: BudgetChangeType
}

export interface BudgetScenarioThreeAccordionMetric {
  label: string
  before: string
  after: string
  change: string
  changeType: BudgetChangeType
}

export interface BudgetScenarioThreeAccordionItem {
  key: string
  title: string
  summaryMetrics: BudgetScenarioThreeSummaryMetric[]
  panelMetrics: BudgetScenarioThreeAccordionMetric[]
}

export interface BudgetScenarioThreeGroup {
  key: string
  title: string
  items: BudgetScenarioThreeAccordionItem[]
}
